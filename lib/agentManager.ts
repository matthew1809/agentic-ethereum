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
        await this.initializeCoordinatorAgent();
    }

    public async initializeCoordinatorAgent() {
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

    public async getCoordinatorAgent() {
        if (!this.coordinatorAgent) {
            await this.initialize();
        }
        return this.coordinatorAgent;
    }
}

export const agentManager = AgentManager.getInstance(); 