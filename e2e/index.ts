import { HumanMessage } from "@langchain/core/messages";
import readData from "../data/readData";
import initializeAgent from "../agents/initializeShelterAgent";
import initializeCoordinatorAgent from "../agents/initializeAggregationAgent";
import { createInterface } from 'node:readline/promises';
import type { ChunkOutput } from "@langchain/core/dist/callbacks/manager";

import * as dotenv from "dotenv";
import * as readline from "readline";

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

/**
 * Run the agent autonomously with specified intervals
 */
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  while (true) {
    try {
      const thought =
        "Be creative and do something interesting on the blockchain. " +
        "Choose an action or set of actions and execute it that highlights your abilities.";

      const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise(resolve => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Choose whether to run in autonomous or chat mode
 */
async function chooseMode(): Promise<"chat" | "auto"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat    - Interactive chat mode");
    console.log("2. auto    - Autonomous action mode");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    if (choice === "1" || choice === "chat") {
      rl.close();
      return "chat";
    } else if (choice === "2" || choice === "auto") {
      rl.close();
      return "auto";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Run the agent interactively based on user input
 */
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

interface StreamChunk {
  agent?: {
    messages: Array<{
      content: string;
    }>;
  };
  tools?: {
    messages: Array<{
      content: string;
    }>;
  };
}

const e2eTest = async () => {
  try {
    console.log(process.env.SCHEMA_ID)
    const data = await readData(process.env.SCHEMA_ID)

    for (const shelter of data) {
      console.log("Found shelter: ", shelter.shelter_info.name.$share)

      const { agent, config } = await initializeAgent(shelter);
      console.log("Initialized shelter agent with config:", config);
    }

    console.log("\nInitializing coordinator agent...");
    const coordinatorAgent = await initializeCoordinatorAgent();
    console.log("Coordinator agent initialized!");

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("\nWhat would you like to test?");
    console.log("1. Get shelter statistics");
    console.log("2. Match with an animal");

    const choice = await rl.question("\nEnter your choice (1 or 2): ");
    
    let query: string;
    if (choice === "1") {
      query = "Please provide statistics about all the shelters and their animals.";
    } else if (choice === "2") {
      console.log("\nLet me help you find a perfect pet match!");
      
      const preferences: AdopterPreferences = {
        animalType: (await rl.question('Are you looking for a cat or dog? (cat/dog): ')).toLowerCase() as 'cat' | 'dog',
        hasGarden: (await rl.question('Do you have a garden? (yes/no): ')).toLowerCase().startsWith('y'),
        hasKids: (await rl.question('Do you have children? (yes/no): ')).toLowerCase().startsWith('y'),
        hasOtherPets: (await rl.question('Do you have other pets? (yes/no): ')).toLowerCase().startsWith('y'),
        spaceType: (await rl.question('What type of home do you live in? (apartment/house/farm): ')).toLowerCase() as 'apartment' | 'house' | 'farm',
        energyLevel: (await rl.question('Preferred energy level? (low/medium/high): ')).toLowerCase() as 'low' | 'medium' | 'high',
        preferredAge: (await rl.question('Preferred age? (young/adult/senior/any): ')).toLowerCase() as 'young' | 'adult' | 'senior' | 'any'
      };

      query = `Please help me find a pet match with these preferences: ${JSON.stringify(preferences)}`;
    } else {
      console.log("Invalid choice. Exiting...");
      rl.close();
      return;
    }

    console.log("\nInvoking coordinator agent...");
    const stream = await coordinatorAgent.stream({
      messages: [new HumanMessage(query)]
    }, {
      configurable: {
        thread_id: "coordinator-main",
        coordinator_id: "global"
      }
    });

    for await (const chunk of stream) {
      const typedChunk = chunk as StreamChunk;
      if (typedChunk.agent) {
        console.log(typedChunk.agent.messages[0].content);
      } else if (typedChunk.tools) {
        console.log(typedChunk.tools.messages[0].content);
      }
      console.log("-------------------");
    }

    rl.close();
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

// Start the test when running directly
if (import.meta.url.endsWith('index.ts')) {
  console.log("Starting E2E Test...");
  e2eTest().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}