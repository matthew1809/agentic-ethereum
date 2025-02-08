import { type NextRequest, NextResponse } from 'next/server';
import { agentManager } from '@/lib/agentManager';
import { HumanMessage } from "@langchain/core/messages";

const encoder = new TextEncoder();

export async function POST(req: NextRequest) {
  try {
    const { message, shelterId } = await req.json();

    if (!message || !shelterId) {
      return NextResponse.json(
        { error: 'Message and shelter ID are required' },
        { status: 400 }
      );
    }

    const shelterAgent = await agentManager.getShelterAgent(shelterId);
    
    if (!shelterAgent) {
      return NextResponse.json(
        { error: 'Shelter agent not found' },
        { status: 404 }
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