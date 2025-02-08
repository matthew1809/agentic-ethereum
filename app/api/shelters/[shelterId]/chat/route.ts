import type { NextApiRequest } from 'next';
import { agentManager } from '@/lib/agentManager';
import { HumanMessage } from "@langchain/core/messages";

const encoder = new TextEncoder();

export async function POST(
  req: NextApiRequest,
) {
  try {
    console.log('req', req);
    const { message } = req.body;
    const { shelterId } = req.query;

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const shelterAgent = await agentManager.getShelterAgent(shelterId);
    
    if (!shelterAgent) {
      return new Response(
        JSON.stringify({ error: 'Shelter agent not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
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