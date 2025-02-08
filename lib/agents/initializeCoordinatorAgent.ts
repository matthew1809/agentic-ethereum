import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

interface AdopterPreferences {
  animalType: 'cat' | 'dog';
  hasGarden: boolean;
  hasKids: boolean;
  hasOtherPets: boolean;
  preferredAge?: 'young' | 'adult' | 'senior' | 'any';
  spaceType: 'apartment' | 'house' | 'farm';
  energyLevel?: 'low' | 'medium' | 'high';
}

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
    description = "Find suitable pets based on adopter preferences";

    async _call(input: string) {
      const preferences = JSON.parse(input) as AdopterPreferences;
      console.log('Finding matches based on preferences...');

      const allMatches: Array<{
        animal: string;
        shelterId: string;
        shelterName: string;
        score: number;
        explanation: string;
      }> = [];

      // Query each shelter for matches
      for (const [shelterId, agent] of activeAgents.entries()) {
        try {
          console.log(`\nQuerying ${shelterId}...`);
          const response = await agent.invoke({
            messages: [{
              type: 'human',
              content: `Given these adopter preferences: ${JSON.stringify(preferences)}, return ONLY a JSON array of matching animals.

              Rules:
              1. Return ONLY the JSON array, no other text
              2. Only include animals that match the preferred species (${preferences.animalType})
              3. Score should consider:
                 - Space requirements vs ${preferences.spaceType}
                 - Garden needs vs ${preferences.hasGarden ? 'has garden' : 'no garden'}
                 - Energy level vs ${preferences.energyLevel || 'any'}
                 - Age preference vs ${preferences.preferredAge || 'any'}
                 - Compatibility with children: ${preferences.hasKids ? 'has kids' : 'no kids'}
                 - Compatibility with other pets: ${preferences.hasOtherPets ? 'has other pets' : 'no other pets'}

              Required response format:
              [
                {
                  "animal": "species - breed - age",
                  "score": number between 0-100,
                  "explanation": "brief reason for match score"
                }
              ]`
            }]
          }, { configurable: { checkpointing: false } });

          if (Array.isArray(response.messages) && response.messages.length > 0) {
            const content = response.messages[response.messages.length - 1].content;
            console.log(`\nResponse from ${shelterId}:\n${content}\n`);
            
            try {
              // Try to find and parse JSON array in the response
              const jsonMatch = content.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                const matches = JSON.parse(jsonMatch[0]);
                if (Array.isArray(matches)) {
                  for (const match of matches) {
                    if (match.animal && match.score && match.explanation) {
                      allMatches.push({
                        ...match,
                        shelterId,
                        shelterName: activeAgents.get(shelterId).name || shelterId
                      });
                    }
                  }
                }
              } else {
                // Fallback: Try to extract matches from the text response
                const matchRegex = /["']animal["']: ["']([^"']+)["'],\s*["']score["']: (\d+),\s*["']explanation["']: ["']([^"']+)["']/g;
                let match;
                while ((match = matchRegex.exec(content)) !== null) {
                  allMatches.push({
                    animal: match[1],
                    score: Number.parseInt(match[2], 10),
                    explanation: match[3],
                    shelterId,
                    shelterName: activeAgents.get(shelterId).name || shelterId
                  });
                }
              }
            } catch (error) {
              console.error(`Error parsing response from ${shelterId}:`, error);
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

      return `Here are your top ${topMatches.length} matches:

${topMatches.map((match, index) => `
${index + 1}. ${match.animal}
   Match Score: ${match.score}/100
   Why this could be a good fit: ${match.explanation}
   Available at: ${match.shelterName}
`).join('\n')}

Would you like to learn more about any of these matches or schedule a visit to meet them?`;
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
    
    When presenting matches to users, format them in a clear, easy-to-read way, highlighting:
    - Basic information (species, breed, age)
    - Why this animal might be a good match (based on the match_reason)
    - Any special considerations (medical issues, space requirements)
    - The shelter where they can find the animal

    Always be empathetic and focus on finding the best match for both the adopter and the animal.`
  });

  return agent;
}

export default initializeCoordinatorAgent;