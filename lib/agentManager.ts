import { 
    initializeShelterAgent, 
    initializeCoordinatorAgent, 
    initializeIntakeAgent 
} from "../agents/index";
import type { Shelter } from "../types/shelter";

class AgentManager {
    private static instance: AgentManager;
    private coordinatorAgent?: Awaited<ReturnType<typeof initializeCoordinatorAgent>>;
    private shelterAgents = new Map<string, Awaited<ReturnType<typeof initializeShelterAgent>>>();
    private intakeAgent?: Awaited<ReturnType<typeof initializeIntakeAgent>>;
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
        
        console.log('Initializing agent system...');
        await Promise.all([
            this.initializeCoordinatorAgent(),
            this.initializeIntakeAgent()
        ]);
        
        this.initialized = true;
        console.log('Agent system initialized');
    }

    private async initializeCoordinatorAgent() {
        if (this.coordinatorAgent) return this.coordinatorAgent;
        
        console.log('Initializing coordinator agent...');
        this.coordinatorAgent = await initializeCoordinatorAgent();
        return this.coordinatorAgent;
    }

    private async initializeIntakeAgent() {
        if (this.intakeAgent) return this.intakeAgent;
        
        console.log('Initializing intake agent...');
        this.intakeAgent = await initializeIntakeAgent();
        return this.intakeAgent;
    }

    public async initializeShelterAgent(shelter: Shelter) {
        if (!this.initialized) {
            await this.initialize();
        }

        const existingAgent = this.shelterAgents.get(shelter._id);
        if (existingAgent) return existingAgent;

        console.log(`Initializing shelter agent for ${shelter._id}...`);
        const agent = await initializeShelterAgent(shelter);
        this.shelterAgents.set(shelter._id, agent);
        return agent;
    }

    public async getCoordinatorAgent() {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.coordinatorAgent;
    }

    public async getIntakeAgent() {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.intakeAgent;
    }

    public async getShelterAgent(shelterId: string) {
        return this.shelterAgents.get(shelterId);
    }
}

export const agentManager = AgentManager.getInstance(); 