import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import { MemorySaver } from "@langchain/langgraph";
import * as dotenv from "dotenv";
import * as fs from "node:fs";
import type { Shelter } from '../../types/shelter';
import { agentStore } from "../store/agentStore";
dotenv.config();

// Configure a file to persist the agent's CDP MPC Wallet Data
const WALLET_DATA_FILE = "wallet_data.txt";

// Add environment validation
function validateEnvironment() {
    const requiredVars = [
        'CDP_API_KEY_NAME',
        'CDP_API_KEY_PRIVATE_KEY',
        'NETWORK_ID',
        'ANTHROPIC_API_KEY'
    ];
    
    const missing = requiredVars.filter(varName => !process.env[varName]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log('Environment validation passed. Required variables present.');
}

/**
 * Initialize the agent with CDP Agentkit
 *
 * @param shelter The shelter data from the database
 * @returns Agent executor and config
 */
async function initializeShelterAgent(shelter: Shelter): Promise<{
    agent: ReturnType<typeof createReactAgent>;
    config: {
        configurable: {
            thread_id: string;
            shelter_id: string;
            memory: MemorySaver;
        };
    };
}> {
    try {
        console.log('Starting agent initialization...');
        validateEnvironment();

        console.log('Initializing LLM...');
        const llm = new ChatAnthropic({
            model: "claude-3-5-sonnet-latest",
        });
        console.log('LLM initialized successfully');

        let walletDataStr: string | null = null;
        console.log('Checking for existing wallet data...');
        
        if (fs.existsSync(WALLET_DATA_FILE)) {
            try {
                walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
                console.log('Found existing wallet data');
            } catch (error) {
                console.error("Error reading wallet data:", error);
            }
        } else {
            console.log('No existing wallet data found');
        }

        const config = {
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            cdpWalletData: walletDataStr || undefined,
            networkId: process.env.NETWORK_ID || "base-sepolia",
        };

        console.log("CDP Wallet Provider config prepared:", {
            apiKeyName: config.apiKeyName,
            networkId: config.networkId,
            hasPrivateKey: !!config.apiKeyPrivateKey,
            hasWalletData: !!config.cdpWalletData
        });

        console.log("Importing AgentKit dependencies...");
        const { CdpWalletProvider, twitterActionProvider, walletActionProvider } = await import("@coinbase/agentkit");
        const { AgentKit } = await import("@coinbase/agentkit");
        const { getLangChainTools } = await import("@coinbase/agentkit-langchain");

        console.log("Initializing CDP Wallet Provider...");
        const walletProvider = await CdpWalletProvider.configureWithWallet(config);
        console.log("CDP Wallet Provider initialized successfully");

        console.log("Initializing AgentKit...");
        const agentkit = await AgentKit.from({
            walletProvider,
            actionProviders: [
              walletActionProvider(), 
                      twitterActionProvider({
                          apiKey: process.env.TWITTER_API_KEY,
                          apiSecret: process.env.TWITTER_API_SECRET,
                          accessToken: process.env.TWITTER_ACCESS_TOKEN,
                          accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
                      })
            ] 
        });
        console.log("AgentKit initialized successfully");

        console.log('Getting LangChain Tools...');
        const tools = await getLangChainTools(agentkit);
        console.log('LangChain Tools retrieved successfully');

        console.log('Creating memory saver...');
        const memory = new MemorySaver();
        
        const agentConfig = { 
            configurable: { 
                thread_id: `Shelter Agent - ${shelter.shelter_info.name.$share}`,
                shelter_id: shelter._id,
                memory
            } 
        };

        console.log('Creating React Agent...');
        const agent = createReactAgent({
            llm,
            tools,
            messageModifier: `
                You are a helpful AI agent for ${shelter.shelter_info.name.$share}, an animal shelter located in ${shelter.shelter_info.location.$share}.
                Your primary responsibilities are:
                1. Promoting animal adoptions from our shelter
                2. Accepting donations to your wallet from any user
                3. Providing information about our current animals and operations

                Current shelter statistics:
                - We have ${shelter.metrics.current_animals} animals in our care
                - Our monthly intake is ${shelter.metrics.monthly_intake} animals
                - We perform about ${shelter.metrics.neutering_count} neutering procedures monthly
                - Our adoption rate is ${(shelter.metrics.adoption_rate * 100).toFixed(1)}%
                - Our monthly operational costs are ${shelter.shelter_info.operational_costs.$share}

                The animals in our care are:
                ${shelter.animals.map(animal => `
                    ID: ${animal.id}
                    Species: ${animal.species}
                    Breed: ${animal.breed}
                    Age: ${animal.age}
                    Status: ${animal.status}
                    Intake Date: ${animal.intake_date}
                    Temperament: ${animal.temperament.join(', ')}
                    Medical Issues: ${animal.medical_issues.has_issues ? `Yes - ${animal.medical_issues.description || 'No description provided'}` : 'No'}
                    Space Requirements:
                      - Minimum Space: ${animal.space_requirements.min_space}
                      - Needs Garden: ${animal.space_requirements.needs_garden ? 'Yes' : 'No'}
                      - Floor Restrictions: ${animal.space_requirements.floor_restrictions ? 'Yes' : 'No'}
                    ${animal.additional_notes ? `Additional Notes: ${animal.additional_notes}` : ''}
                    -------------------
                `).join('\n')}

                You can interact with the blockchain using Coinbase Developer Platform AgentKit to handle donations
                and track shelter operations. If you need funds for transactions, you can request them from the
                faucet if on network ID 'base-sepolia', or provide wallet details to request funds from users.

                Always be warm, empathetic, and focused on the welfare of our animals. Encourage responsible
                pet ownership and support for our shelter's mission.
            `
        });
        console.log('React Agent created successfully');

        console.log('Saving wallet data...');
        const exportedWallet = await walletProvider.exportWallet();
        fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
        console.log('Wallet data saved successfully');

        // Check if this shelter has tweeted before
        // const existingShelter = agentStore.getShelter(shelter._id);
        // if (!existingShelter?.has_tweeted) {
        //     try {
        //         await agent.invoke({
        //             messages: [{
        //                 type: 'human',
        //                 content: `Tweet to help get more visibility, and ask for donations. Make it engaging and heartwarming, but keep it within Twitter's character limit.`
        //             }]
        //         });
                
        //         // Mark the shelter as having tweeted
        //         agentStore.markShelterAsTweeted(shelter._id);
        //         console.log('Initial tweet sent successfully');
        //     } catch (error) {
        //         console.error('Failed to send initial tweet:', error);
        //         // We don't throw here as this is not critical to agent initialization
        //     }
        // }

        console.log('Adding shelter to agent store...');
        agentStore.addShelter(shelter._id, {
            _id: shelter._id,
            shelter_info: {
                name: { $share: shelter.shelter_info.name.$share },
                location: { $share: shelter.shelter_info.location.$share }
            },
            thread_id: agentConfig.configurable.thread_id
        });
        console.log('Shelter added to agent store successfully');

        console.log('Registering agent with coordinator...');
        const { registerAgent } = await import('./initializeCoordinatorAgent');
        await registerAgent(shelter._id, agent);
        console.log('Agent registered with coordinator successfully');

        console.log('Agent initialization completed successfully!');
        return { agent, config: agentConfig };
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
    }
}

// // Replace the CommonJS check and execution
// if (import.meta.url === new URL(import.meta.url).href) {
//   console.log("Starting basic agent test...");
//   initializeShelterAgent(
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
//   )
//       .then(() => console.log("Test completed successfully"))
//       .catch(error => {
//           console.error("Test failed:", error);
//           process.exit(1);
//       });
// }

export default initializeShelterAgent;