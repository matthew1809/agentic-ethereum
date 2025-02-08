import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Message as VercelChatMessage } from "ai";
import { initializeIntakeAgent } from "@/agents/initializeIntakeAgent";
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig.js';
import type { Shelter } from '@/types/shelter';
import {
  AIMessage,
  ChatMessage,
  HumanMessage,
} from "@langchain/core/messages";

const SCHEMA_ID = '03e30e97-abc9-4cee-96b4-ec9d67bbc2a6';

async function findSimilarShelters(name: string, location: string) {
  try {
    // Type assertion for credentials to handle undefined
    const credentials = {
      secretKey: orgConfig.orgCredentials.secretKey || '',
      orgDid: orgConfig.orgCredentials.orgDid || ''
    };

    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      credentials,
      SCHEMA_ID
    );
    await collection.init();

    // Get all shelters
    const shelters = await collection.readFromNodes({}) as Shelter[];
    
    // Look for similar shelters
    return shelters.filter(shelter => {
      const shelterName = shelter.shelter_info.name.$share.toLowerCase();
      const shelterLocation = shelter.shelter_info.location.$share.toLowerCase();
      const searchName = name.toLowerCase();
      const searchLocation = location.toLowerCase();

      // Check if either name or location is similar
      return shelterName.includes(searchName) || 
             searchName.includes(shelterName) ||
             shelterLocation.includes(searchLocation) ||
             searchLocation.includes(shelterLocation);
    });
  } catch (error) {
    console.error('Error searching for similar shelters:', error);
    return [];
  }
}

export const runtime = "nodejs";

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  }
  if (message.role === "assistant") {
    return new AIMessage(message.content);
  }
  return new ChatMessage(message.content, message.role);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // Initialize the agent
    const { agent } = await initializeIntakeAgent();

    const stream = await agent.stream({
      messages
    }, {
      configurable: {
        thread_id: "intake-agent",
      }
    });

    // Create a simple transform stream that just outputs the text
    const encoder = new TextEncoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          if ("agent" in chunk) {
            const content = chunk.agent.messages[0].content;
            // Only send if it's a string and not an object
            if (typeof content === 'string') {
              controller.enqueue(encoder.encode(content));
            } else {
              console.log('Skipping non-string agent content:', content);
            }
          } else if ("tools" in chunk) {
            // Log tool responses to console
            console.log('Tool response:', JSON.stringify(chunk.tools, null, 2));
            
            // If this is a shelter creation attempt, check for similar shelters
            const toolResponse = chunk.tools.messages[0];
            if (toolResponse?.content && typeof toolResponse.content === 'object') {
              const { name, location } = toolResponse.content;
              if (name && location) {
                const similarShelters = await findSimilarShelters(name, location);
                if (similarShelters.length > 0) {
                  const shelterList = similarShelters
                    .map(s => `${s.shelter_info.name.$share} in ${s.shelter_info.location.$share}`)
                    .join(', ');
                  controller.enqueue(encoder.encode(
                    `I noticed some similar shelters: ${shelterList}. Is this the same shelter? Please let me know if this is a different shelter and we should proceed with registration, or if it's the same one and we should update the existing record instead.`
                  ));
                  return;
                }
              }
            }

            // Check if the tool response indicates a failure
            if (toolResponse?.content) {
              if (typeof toolResponse.content === 'string' && 
                  (toolResponse.content.includes('error') || 
                   toolResponse.content.includes('failed'))) {
                controller.enqueue(encoder.encode(
                  "I apologize, but I encountered an issue while processing your request. Please try again later."
                ));
              }
              // Don't send tool response content to user, just log it
              console.log('Tool message content:', toolResponse.content);
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
          controller.enqueue(encoder.encode(
            "I apologize, but I encountered an issue while processing your request. Please try again later."
          ));
        }
      }
    });

    // Pipe the agent stream through our transform
    (async () => {
      const reader = stream.getReader();
      const writer = transformStream.writable.getWriter();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          await writer.write(value);
        }
      } catch (error) {
        console.error('Error in stream processing:', error);
        await writer.write(encoder.encode(
          "I apologize, but I encountered an issue while processing your request. Please try again later."
        ));
      } finally {
        await writer.close();
      }
    })();

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });

  } catch (error) {
    console.error('Error processing request:', error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 