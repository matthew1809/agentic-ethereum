import { 
    initializeShelterAgent, 
    initializeCoordinatorAgent, 
    initializeIntakeAgent 
} from "./agents/index.ts";
import type { ShelterFetched } from "../types/shelter";
import readData from '@/lib/data/readData';

class AgentManager {
    private static instance: AgentManager;
    private coordinatorAgent?: Awaited<ReturnType<typeof initializeCoordinatorAgent>>;
    private shelterAgents = new Map<string, Awaited<ReturnType<typeof initializeShelterAgent>>>();
    private intakeAgent?: Awaited<ReturnType<typeof initializeIntakeAgent>>;
    private initialized = false;
    private initializing = false;

    private constructor() {}

    public static getInstance(): AgentManager {
        if (!AgentManager.instance) {
            AgentManager.instance = new AgentManager();
        }
        return AgentManager.instance;
    }

    public async initialize() {
        if (this.initialized || this.initializing) return;
        
        try {
            this.initializing = true;
            console.log('Initializing agent system...');
            
            // First initialize coordinator and intake agents
            await Promise.all([
                this.initializeCoordinatorAgent(),
                this.initializeIntakeAgent()
            ]);

            // Then initialize shelter agents
            await this.initializeAllShelterAgents();
            
            this.initialized = true;
            console.log('Agent system initialized');
        } finally {
            this.initializing = false;
        }
    }

    private async initializeAllShelterAgents() {
        try {
            console.log('Fetching all shelters from Nillion...');
            const shelters = await readData();
            
            console.log(`Found ${shelters.length} shelters. Initializing agents...`);
            for (const shelter of shelters) {
                const existingAgent = this.shelterAgents.get(shelter._id);
                if (!existingAgent) {
                    console.log(`Initializing shelter agent for ${shelter._id}...`);
                    const agent = await initializeShelterAgent(shelter);
                    this.shelterAgents.set(shelter._id, agent);
                }
            }
            
            console.log('All shelter agents initialized successfully');
        } catch (error) {
            console.error('Failed to initialize shelter agents:', error);
            throw error;
        }
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

    public async initializeShelterAgent(shelter: ShelterFetched) {
        // Don't check initialization here to avoid circular dependency
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
        if (!this.initialized) {
            await this.initialize();
        }
        return this.shelterAgents.get(shelterId);
    }
}

export const agentManager = AgentManager.getInstance(); 