import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { Message as VercelChatMessage } from "ai";
import { agentManager } from '@/lib/agentManager';
import {
  AIMessage,
  ChatMessage,
  HumanMessage,
} from "@langchain/core/messages";

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

    // Get the coordinator agent from the manager
    const coordinatorAgent = await agentManager.getCoordinatorAgent();
    if (!coordinatorAgent) {
      throw new Error("Failed to get coordinator agent");
    }

    // Create encoder and transform stream early to send initial message
    const encoder = new TextEncoder();
    const transformStream = new TransformStream({
      async start(controller) {
        // Send initial message
        controller.enqueue(encoder.encode("I'll help you find the perfect pet match! Give me a moment to search through all our shelters...\n\n"));
      },
      async transform(chunk, controller) {
        try {
          if ("agent" in chunk) {
            const content = chunk.agent.messages[0].content;
            // Only send if it's a string and not an object
            if (typeof content === 'string') {
              controller.enqueue(encoder.encode(content));
            } else if (content && typeof content === 'object') {
              // If it's a structured message, try to extract text
              if ('text' in content) {
                controller.enqueue(encoder.encode(content.text));
              } else {
                console.log('Skipping non-text content:', content);
              }
            } else {
              console.log('Skipping non-string agent content:', content);
            }
          } else if ("tools" in chunk) {
            // Log tool responses to console
            console.log('Tool response:', JSON.stringify(chunk.tools, null, 2));
            
            // Check if the tool response indicates a failure
            const toolResponse = chunk.tools.messages[0];
            if (toolResponse?.content) {
              if (typeof toolResponse.content === 'string') {
                if (toolResponse.content.includes('Error: Unexpected token')) {
                  // Don't send JSON parsing errors to the user
                  console.error('Tool JSON parsing error:', toolResponse.content);
                } else if (toolResponse.content.includes('error') || 
                          toolResponse.content.includes('failed')) {
                  controller.enqueue(encoder.encode(
                    "I'm having trouble finding matches. Let me try a different approach. Could you confirm if you're looking for a dog or cat, and tell me about your living situation?"
                  ));
                } else {
                  // If it's a valid response, send it to the user
                  controller.enqueue(encoder.encode(toolResponse.content));
                }
              }
              // Log tool message content for debugging
              console.log('Tool message content:', toolResponse.content);
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
          controller.enqueue(encoder.encode(
            "I apologize, but I encountered an issue while processing your request. Could you try rephrasing your preferences?"
          ));
        }
      }
    });

    // Get the agent's response stream
    const stream = await coordinatorAgent.stream({
      messages: [
        ...messages,
        new HumanMessage(`Please help find pets that match this person's preferences. When using the match_pets tool, format the input as a JSON object with the following structure:
        {
          "input": {
            "species": "dog" | "cat",
            "hasGarden": boolean,
            "hasKids": boolean,
            "hasOtherPets": boolean,
            "spaceType": "apartment" | "house" | null,
            "energyLevel": "high" | "low" | null,
            "preferredAge": "young" | "adult" | "senior" | null
          }
        }
        
        Extract the preferences from their messages and use them to find matching pets.`)
      ]
    }, {
      configurable: {
        thread_id: "coordinator-agent",
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
          "I apologize, but I encountered an issue while processing your request. Please try again."
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