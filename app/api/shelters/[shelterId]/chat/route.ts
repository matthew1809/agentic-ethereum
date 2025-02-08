import { orgConfig } from '@/config/nillionOrgConfig';
import { agentManager } from '@/lib/agentManager';
import type { ShelterFetched } from '@/types/shelter';
import { HumanMessage } from "@langchain/core/messages";
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
const encoder = new TextEncoder();


export async function POST(
  req: Request
) {
  try {
    const body = await req.json();
    const { message, shelterId } = body;

    if (!shelterId) {
      return new Response(
        JSON.stringify({ error: 'Shelter ID is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Request params:', message, shelterId);

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    let shelterAgent = await agentManager.getShelterAgent(shelterId);
    
    if (!shelterAgent) {
      console.log('Shelter agent not found, initializing...');

      const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        {
          secretKey: orgConfig.orgCredentials.secretKey || '',
          orgDid: orgConfig.orgCredentials.orgDid || ''
        },
        process.env.SHELTER_SCHEMA_ID
      );
      await collection.init();

      const shelters = await collection.readFromNodes({}) as ShelterFetched[];

      if(shelters.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Something went wrong, please try again later.' }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      const shelter = shelters.find(shelter => shelter._id === shelterId);
      
      if(shelter) {
        shelterAgent = await agentManager.initializeShelterAgent(shelter);
      }
    }

    // Create transform stream to handle the agent's response
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          if ("agent" in chunk) {
            const content = chunk.agent.messages[0].content;
            // Only send if it's a string and not an object
            if (typeof content === 'string') {
              controller.enqueue(encoder.encode(content));
              // Small delay between chunks for readability
              await new Promise(resolve => setTimeout(resolve, 200));
            } else {
              console.log('Skipping non-string agent content:', content);
            }
          } else if ("tools" in chunk) {
            // Log tool responses but don't send to client
            console.log('Tool response:', JSON.stringify(chunk.tools, null, 2));
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
          controller.enqueue(encoder.encode(
            "I apologize, but I encountered an issue while processing your request. Please try again later.\n"
          ));
        }
      }
    });

    if(!shelterAgent) {
      return new Response(
        JSON.stringify({ error: 'Shelter agent not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    // Get the stream from the agent
    const stream = await shelterAgent.agent.stream(
      { 
        messages: [new HumanMessage(message)]
      },
      {
        configurable: {
          thread_id: `shelter-${shelterId}`,
          shelter_id: shelterId
        }
      }
    );

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
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 