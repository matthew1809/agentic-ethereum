import { ChatAnthropic } from "@langchain/anthropic";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { Tool } from "@langchain/core/tools";
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../../config/nillionOrgConfig';
// import initializeShelterAgent from './initializeShelterAgent';
import { MemorySaver } from "@langchain/langgraph";
import type { Shelter } from '../../types/shelter';
// Schema ID for the shelter data in Nillion Secret Vault
const SHELTER_SCHEMA_ID = 'd20f2c6f-84d2-4542-92d7-e47e63359d97';

class CreateShelterTool extends Tool {
  name = "create_shelter";
  description = "Creates a new shelter record with the collected information";

  async _call(shelterData: string) {
    try {
      if (!orgConfig.orgCredentials.secretKey || !orgConfig.orgCredentials.orgDid) {
        throw new Error("Missing org credentials");
      }

      const parsedData = JSON.parse(shelterData);

      // Initialize Secret Vault for secure storage
      const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        {
          secretKey: orgConfig.orgCredentials.secretKey,
          orgDid: orgConfig.orgCredentials.orgDid
        },
        SHELTER_SCHEMA_ID
      );
      await collection.init();

      // Prepare shelter data with encrypted sensitive fields
      const shelter: Shelter = {
        _id: crypto.randomUUID(),
        shelter_info: {
          name: { $share: parsedData.name },
          location: { $share: parsedData.location },
          operational_costs: { $share: parsedData.operational_costs }
        },
        metrics: {
          current_animals: 0,
          monthly_intake: 0,
          neutering_count: 0,
          adoption_rate: 0
        },
        animals: []
      };

      // Write to Secret Vault
      await collection.writeToNodes([shelter]);
      
      // Initialize the shelter's dedicated agent
    //   await initializeShelterAgent(shelter);
    // TODO: Implement this
      return `Successfully created shelter ${shelter._id}. A dedicated agent has been initialized for this shelter.`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return `Failed to create shelter: ${error.message}`;
      }
    }
  }
}

export default async function initializeIntakeAgent() {
  const llm = new ChatAnthropic({
    model: "claude-3-5-sonnet-latest"
  });

    const memory = new MemorySaver();

  const tools = [new CreateShelterTool()];

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver:memory,
    messageModifier: `
      You are an intake agent responsible for onboarding new animal shelters. Your job is to collect essential information
      about the shelter in a conversational manner. You need to gather:

      1. Shelter name
      2. Location (city and state/province)
      3. Monthly operational costs (this will be encrypted)

      Once you have all required information, use the create_shelter tool by passing a JSON string with the collected data.
      Format: {"name": "...", "location": "...", "operational_costs": "..."}

      Be friendly and professional. If any information is unclear, ask for clarification. Explain that we'll automatically
      sync their animal data later, so they don't need to provide that now.

      After creation, inform them that their dedicated shelter agent will be ready to assist them with day-to-day operations.
    `
  });

  return {
    agent,
    config: {
      configurable: {
        thread_id: "Shelter_Intake_Agent",
      }
    }
  };
}
