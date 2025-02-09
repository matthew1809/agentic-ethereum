import { HumanMessage } from "@langchain/core/messages";
import readData from "@/lib/data/readData";
import initializeAgent from "@/walletInfo/initializeShelterAgent";
import initializeCoordinatorAgent from "@/lib/agents/initializeCoordinatorAgent";
import { createInterface } from 'node:readline/promises';

import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

 /* Run the agent interactively based on user input
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
    const data = await readData()

    const shelter = data[0]
    console.log("Initializing shelter agent for one shelter: ", shelter.shelter_info.name.$share)

    const { agent, config } = await initializeAgent(data[0]);
    console.log("Initialized shelter agent with config:", config);  

    console.log("\nInitializing coordinator agent...");
    const coordinatorAgent = await initializeCoordinatorAgent();
    console.log("Coordinator agent initialized!");

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    console.log("\nWhat would you like to test?");
    console.log("1. Get shelter statistics");
    console.log("2. Chat with the agent");

    const choice = await rl.question("\nEnter your choice (1 or 2): ");
    
    if (choice === "1") {
      const query = "Please provide statistics about all the shelters and their animals.";
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
    } else if (choice === "2") {
      console.log("Entering chat mode with the shelter agent...");
      await runChatMode(agent, config);
    } else {
      console.log("Invalid choice. Exiting...");
      rl.close();
      return;
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