import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

// Keep track of active agents in memory
const activeAgents = new Map();

export function registerAgent(shelterId: string, agent: ReturnType<typeof createReactAgent>) {
  activeAgents.set(shelterId, agent);
}

async function initializeCoordinatorAgent() {
  const llm = new ChatAnthropic({
    model: "claude-3-5-sonnet-latest",
  });

  const memory = new MemorySaver();

  class QuerySheltersTool extends Tool {
    name = "query_shelters";
    description = "Query all shelter agents for information";

    async _call(query: string) {
      const shelterCount = activeAgents.size;
      console.log(`Querying ${shelterCount} shelter${shelterCount !== 1 ? 's' : ''}...`);
      
      const results: Record<string, string> = {};
      let totalAnimals = 0;
      let totalShelters = 0;

      // Query each shelter sequentially
      for (const [shelterId, agent] of activeAgents.entries()) {
        try {
          const response = await agent.invoke({
            messages: [{
              type: 'human',
              content: query
            }]
          }, { configurable: { checkpointing: false } });

          if (Array.isArray(response.messages) && response.messages.length > 0) {
            const content = response.messages[response.messages.length - 1].content;
            results[shelterId] = content;

            // Extract animal count if present
            const animalMatch = content.match(/(\d+)\s+animals? in our care/i);
            if (animalMatch) {
              const count = Number.parseInt(animalMatch[1], 10);
              totalAnimals += count;
              totalShelters++;
            }
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          console.error(`Error querying shelter ${shelterId}: ${error.message}`);
          results[shelterId] = `Error: ${error.message}`;
        }
      }

      return JSON.stringify({
        summary: {
          total_animals: totalAnimals,
          total_shelters: totalShelters
        },
        details: results
      });
    }
  }

  class MatchPetsTool extends Tool {
    name = "match_pets";
    description = "Find suitable pets based on adopter preferences. Input should be a natural language description of preferences (e.g., 'Looking for a dog, I have a yard, no kids, no other pets')";

    async _call(input: string) {
      console.log('Finding matches based on preferences:', input);

      // Parse natural language preferences
      const preferences = {
        animalType: input.toLowerCase().includes('dog') ? 'dog' : 
                    input.toLowerCase().includes('cat') ? 'cat' : undefined,
        hasGarden: input.toLowerCase().includes('garden') || 
                  input.toLowerCase().includes('yard') || 
                  input.toLowerCase().includes('backyard'),
        hasKids: input.toLowerCase().includes('kids') || 
                input.toLowerCase().includes('children'),
        hasOtherPets: input.toLowerCase().includes('other pets'),
        spaceType: input.toLowerCase().includes('apartment') ? 'apartment' : 
                  input.toLowerCase().includes('house') ? 'house' : undefined,
        energyLevel: input.toLowerCase().includes('active') || input.toLowerCase().includes('energetic') ? 'high' :
                    input.toLowerCase().includes('calm') || input.toLowerCase().includes('quiet') ? 'low' : undefined,
        preferredAge: input.toLowerCase().includes('puppy') || input.toLowerCase().includes('kitten') ? 'young' :
                     input.toLowerCase().includes('senior') || input.toLowerCase().includes('old') ? 'senior' : undefined
      };

      const allMatches: Array<{
        animal: string;
        shelterId: string;
        shelterName: string;
        score: number;
        explanation: string;
      }> = [];

      console.log('We have the following active agents:', activeAgents.entries());
      console.log('Parsed preferences:', preferences);

      // Query each shelter for matches
      for (const [shelterId, agent] of activeAgents.entries()) {
        try {
          console.log(`\nQuerying ${shelterId}...`);
          const response = await agent.invoke({
            messages: [{
              type: 'human',
              content: `Please find animals that match these preferences:
              - Species: ${preferences.animalType || 'any'}
              - Has garden/yard: ${preferences.hasGarden ? 'yes' : 'no'}
              - Has children: ${preferences.hasKids ? 'yes' : 'no'}
              - Has other pets: ${preferences.hasOtherPets ? 'yes' : 'no'}
              - Living space: ${preferences.spaceType || 'any'}
              - Energy level preference: ${preferences.energyLevel || 'any'}
              - Age preference: ${preferences.preferredAge || 'any'}

              Return your response as a list of matches in this format:
              1. [Animal Description] - [Match Score]/100 - [Reason for match]
              2. [Animal Description] - [Match Score]/100 - [Reason for match]
              ...`
            }]
          }, { configurable: { checkpointing: false } });

          if (Array.isArray(response.messages) && response.messages.length > 0) {
            const content = response.messages[response.messages.length - 1].content;
            console.log(`\nResponse from ${shelterId}:\n${content}\n`);
            
            // Parse the response using regex
            const matchRegex = /(\d+)\.\s+([^-]+)-\s*(\d+)\/100\s*-\s*([^\n]+)/g;
            let matchResult: RegExpMatchArray | null;
            while (true) {
              matchResult = matchRegex.exec(content);
              if (matchResult === null) break;
              
              allMatches.push({
                animal: matchResult[2].trim(),
                score: Number.parseInt(matchResult[3], 10),
                explanation: matchResult[4].trim(),
                shelterId,
                shelterName: activeAgents.get(shelterId).name || shelterId
              });
            }
          }
        } catch (err) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          console.error(`Error querying shelter ${shelterId}:`, error);
        }
      }

      // Sort matches by score and get top 3
      const topMatches = allMatches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (topMatches.length === 0) {
        return "I'm sorry, but I couldn't find any matches that fit your preferences. Consider adjusting your criteria to see more potential matches.";
      }

      // Format matches with line breaks between sections
      const matchesText = topMatches.map((match, index) => {
        const sections = [
          `🐾 Match #${index + 1}: ${match.animal}`,
          `⭐ Match Score: ${match.score}/100`,
          `💭 Why this could be a good fit:\n   ${match.explanation}`,
          `📍 Available at: ${match.shelterName}`
        ];
        return sections.join('\n');
      }).join('\n\n');

      // Break the response into multiple messages
      return [
        "I've found some great potential matches for you!",
        matchesText,
        "Would you like to learn more about any of these pets or schedule a visit to meet them? Just let me know which one interests you the most!"
      ].join('\n\n');
    }
  }

  const tools = [new QuerySheltersTool(), new MatchPetsTool()];

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: memory,
    messageModifier: `You are a coordination agent that helps match potential adopters with animals across multiple shelters.
    You have two main functions:
    1. query_shelters - Get general statistics about animals in shelters
    2. match_pets - Find suitable pets based on adopter preferences

    When processing match_pets requests:
    - Use the provided preferences to find suitable matches across all shelters
    - Consider all relevant factors like space, household composition, and animal requirements
    - Present matches in order of suitability
    
    When presenting matches to users:
    - Break up long responses into smaller, more digestible chunks
    - Use emojis and formatting to make the information more readable
    - Present one piece of information at a time
    - Ask follow-up questions to help guide the conversation
    
    Always be empathetic and focus on finding the best match for both the adopter and the animal.
    
    Remember to:
    1. Start with a friendly greeting
    2. Break up long responses into multiple messages
    3. Use clear section breaks between different pieces of information
    4. End with a question or call to action to keep the conversation going`
  });

  return agent;
}

export default initializeCoordinatorAgent;