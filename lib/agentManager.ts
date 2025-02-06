import { createReactAgent } from "@langchain/langgraph/prebuilt";
import initializeShelterAgent from "../agents/initializeShelterAgent";
import initializeCoordinatorAgent from "../agents/initializeAggregationAgent";
import type { Shelter } from "../types/shelter";

class AgentManager {
    private static instance: AgentManager;
    private coordinatorAgent?: Awaited<ReturnType<typeof initializeCoordinatorAgent>>;
    private initialized = false;

    private constructor() {}

    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    public async initialize() {
        if (this.initialized) return;
        
        console.log('Initializing coordinator agent...');
        this.coordinatorAgent = await initializeCoordinatorAgent();
        this.initialized = true;
    }

    public async initializeShelterAgent(shelter: Shelter) {
        if (!this.initialized) {
            await this.initialize();
        }
        return initializeShelterAgent(shelter);
    }

    public getCoordinatorAgent() {
        if (!this.coordinatorAgent) {
            throw new Error('Coordinator agent not initialized');
        }
        return this.coordinatorAgent;
    }
}

export const agentManager = AgentManager.getInstance(); 