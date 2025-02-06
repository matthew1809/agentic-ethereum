import { verifyAgentStore, testAgentInvoke } from '../utils/verifyAgent';

async function main() {
    // First verify the agent store
    const agents = verifyAgentStore();
    
    // If we have any agents, test the first one
    const firstAgentId = Array.from(agents.keys())[0];
    if (firstAgentId) {
        await testAgentInvoke(firstAgentId);
    } else {
        console.log('\nNo agents found to test.');
    }
}

main().catch(console.error); 