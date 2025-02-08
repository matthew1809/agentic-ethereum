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

// Flexible preferences interface - all fields optional
interface AdopterPreferences {
  animalType?: string;          // Any animal type mentioned (dog, cat, etc.)
  size?: string;               // Any size preference (small, medium, large)
  age?: string;               // Any age preference (young, adult, senior)
  activityLevel?: string;     // Any activity level mentioned (low, high, etc.)
  livingSpace?: string;       // Any living situation mentioned (apartment, house, etc.)
  hasYard?: boolean;         // If yard is mentioned
  hasChildren?: boolean;     // If children are mentioned
  hasOtherPets?: boolean;    // If other pets are mentioned
  otherPreferences?: string[]; // Any other specific preferences mentioned
}

// Helper to extract preferences from user messages
function extractPreferences(messages: VercelChatMessage[]): AdopterPreferences {
  const preferences: AdopterPreferences = {};
  
  // Only look at user messages
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => typeof m.content === 'string' ? m.content.toLowerCase() : '');

  const allText = userMessages.join(' ');

  // Animal type
  if (allText.includes('dog')) preferences.animalType = 'dog';
  if (allText.includes('cat')) preferences.animalType = 'cat';
  
  // Size preferences
  if (allText.includes('small')) preferences.size = 'small';
  if (allText.includes('big') || allText.includes('large')) preferences.size = 'large';
  if (allText.includes('medium')) preferences.size = 'medium';

  // Age preferences
  if (allText.includes('puppy') || allText.includes('kitten') || allText.includes('baby')) preferences.age = 'young';
  if (allText.includes('adult')) preferences.age = 'adult';
  if (allText.includes('senior') || allText.includes('older')) preferences.age = 'senior';

  // Activity level
  if (allText.includes('active') || allText.includes('energetic')) preferences.activityLevel = 'high';
  if (allText.includes('calm') || allText.includes('lazy')) preferences.activityLevel = 'low';

  // Living situation
  if (allText.includes('apartment')) preferences.livingSpace = 'apartment';
  if (allText.includes('house')) preferences.livingSpace = 'house';
  if (allText.includes('yard') || allText.includes('garden')) preferences.hasYard = true;

  // Household composition
  if (allText.includes('kid') || allText.includes('child')) preferences.hasChildren = true;
  if (allText.includes('other pet') || allText.includes('another pet')) preferences.hasOtherPets = true;

  // Other specific preferences
  const otherPreferences = [];
  if (allText.includes('hypoallergenic')) otherPreferences.push('hypoallergenic');
  if (allText.includes('trained')) otherPreferences.push('trained');
  if (allText.includes('quiet')) otherPreferences.push('quiet');
  if (otherPreferences.length > 0) preferences.otherPreferences = otherPreferences;

  return preferences;
}

// Helper to check how complete the preferences are
function getPreferenceCompleteness(preferences: AdopterPreferences): {
  score: number;  // 0-1 score of how complete the preferences are
  missingKey: string[];  // List of important missing preferences
} {
  const keyPreferences = [
    { key: 'animalType', name: 'type of animal' },
    { key: 'livingSpace', name: 'living situation' },
    { key: 'hasChildren', name: 'presence of children' },
    { key: 'hasOtherPets', name: 'presence of other pets' }
  ];

  const missingKey = keyPreferences
    .filter(({ key }) => !preferences[key as keyof AdopterPreferences])
    .map(({ name }) => name);

  // Calculate completeness score (weight key preferences more heavily)
  const score = (
    (preferences.animalType ? 0.3 : 0) +
    (preferences.livingSpace ? 0.2 : 0) +
    (preferences.hasChildren !== undefined ? 0.2 : 0) +
    (preferences.hasOtherPets !== undefined ? 0.2 : 0) +
    (preferences.size ? 0.025 : 0) +
    (preferences.age ? 0.025 : 0) +
    (preferences.activityLevel ? 0.025 : 0) +
    (preferences.hasYard !== undefined ? 0.025 : 0)
  );

  return { score, missingKey };
}

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  }
  if (message.role === "assistant") {
    return new AIMessage(message.content);
  }
  return new ChatMessage(message.content, message.role);
};

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   console.log(body);

//   const shelterAgent = await initializeShelterAgent(
//     {
//       _id: "123",
//       shelter_info: {
//           name: { $share: "Shelter Name" },
//           location: { $share: "Shelter Location" },
//           operational_costs: { $share: 1000 }
//       },
//       metrics: {
//         current_animals: 10,
//         monthly_intake: 20,
//         neutering_count: 10,
//         adoption_rate: 0.5
//       },
//       animals: [
//         {
//           id: "123",
//           species: "dog",
//           breed: "Labrador",
//           age: 2,
//           status: "available",
//           intake_date: new Date().toISOString(),
//           temperament: ["friendly"],
//           medical_issues: { has_issues: false },
//           space_requirements: {
//             min_space: "apartment",
//             needs_garden: false,
//             floor_restrictions: false
//           }
//         }
//       ]
//     }
//   );
//   console.log(shelterAgent);
//   return NextResponse.json({ message: "Hello, world!" });
// }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // Extract any preferences from the conversation so far
    const preferences = extractPreferences(body.messages ?? []);
    const { score, missingKey } = getPreferenceCompleteness(preferences);
    console.log('Extracted preferences:', preferences);
    console.log('Preference completeness:', { score, missingKey });

    // Get the coordinator agent
    const coordinatorAgent = await agentManager.getCoordinatorAgent();
    if (!coordinatorAgent) {
      throw new Error("Failed to initialize coordinator agent");
    }

    // Stream the response
    const stream = await coordinatorAgent.stream({
      messages: [
        ...messages,
        new AIMessage(`When responding, please:
1. Keep each message concise and focused
2. Break up long responses into multiple shorter messages
3. Use natural pauses between thoughts
4. Ask questions one at a time
5. Wait briefly between each message

Here are the user's current preferences: ${JSON.stringify({ 
  preferences,
  completeness: { score, missingKey }
})}`),
      ]
    }, {
      configurable: {
        thread_id: "coordinator-adopt",
        coordinator_id: "adopt"
      }
    });

    // Create a transform stream that just outputs the text
    const encoder = new TextEncoder();
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
            // Log tool responses to console
            console.log('Tool response:', JSON.stringify(chunk.tools, null, 2));
            
            // Check if the tool response indicates a failure
            const toolResponse = chunk.tools.messages[0];
            if (toolResponse?.content) {
              if (typeof toolResponse.content === 'string' && 
                  (toolResponse.content.includes('error') || 
                   toolResponse.content.includes('failed'))) {
                controller.enqueue(encoder.encode(
                  "I apologize, but I encountered an issue while searching for pets. Please try again later.\n"
                ));
              }
              // Don't send tool response content to user, just log it
              console.log('Tool message content:', toolResponse.content);
            }
          }
        } catch (error) {
          console.error('Error processing chunk:', error);
          controller.enqueue(encoder.encode(
            "I apologize, but I encountered an issue while processing your request. Please try again later.\n"
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