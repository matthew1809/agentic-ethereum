import { agentStore } from "../store/agentStore";

export function verifyAgentStore() {
    const agents = agentStore.getAllAgents();
    console.log('\n=== Agent Store Verification ===');
    console.log('Number of agents:', agents.size);
    
    for (const [id, agent] of agents.entries()) {
        console.log('\nAgent ID:', id);
        console.log('Shelter Name:', agent.shelter?.shelter_info?.name?.$share || 'N/A');
        console.log('Agent Structure:', {
            hasAgent: !!agent.agent,
            agentType: agent.agent ? typeof agent.agent : 'N/A',
            hasInvoke: agent.agent ? typeof agent.agent.invoke : 'N/A',
            config: agent.config,
            shelterKeys: agent.shelter ? Object.keys(agent.shelter) : []
        });
    }
    
    return agents;
}

export async function testAgentInvoke(agentId: string) {
    console.log('\n=== Testing Agent Invoke ===');
    const agent = agentStore.getAgent(agentId);
    
    if (!agent) {
        console.log('Agent not found:', agentId);
        return;
    }

    try {
        console.log('Attempting to invoke agent...');
        const response = await agent.agent.invoke({
            input: "Test message - please respond with your shelter name"
        });
        console.log('Response:', response);
    } catch (error) {
        console.error('Invoke error:', error);
        console.log('Agent details:', {
            agentType: typeof agent.agent,
            methods: agent.agent ? Object.getOwnPropertyNames(agent.agent) : [],
            prototype: agent.agent ? Object.getOwnPropertyNames(Object.getPrototypeOf(agent.agent)) : []
        });
    }
} 