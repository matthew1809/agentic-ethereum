import { ANIMAL_WELFARE_CONFIG } from "../../contracts/animalWelfareContractConfig";
import type { Address } from "viem";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";

const CONTRACT_ADDRESS = '0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8' as Address;

export async function getShelterAllowances() {
    try {
      console.log('Fetching shelter allowances from contract...');
      console.log('Using contract address:', CONTRACT_ADDRESS);
      
      // Initialize public client
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });

      // First verify the contract exists
      const code = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
      if (!code) {
        throw new Error('No contract found at the specified address');
      }
      console.log('Contract verified at address');

      // Try to get the owner to verify contract interface
      try {
        const owner = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ANIMAL_WELFARE_CONFIG.abi,
          functionName: 'owner'
        });
        console.log('Contract owner:', owner);
      } catch (error) {
        console.error('Failed to read owner - contract may not be properly deployed:', error);
        throw error;
      }

      // Now try to get approved shelters directly
      console.log('\nFetching shelter details...\n');
      
      // use the contract's approvedShelters mapping
      for (let i = 0; i < 100; i++) { // Limit to first 100 addresses for safety
        try {
          const testAddress = `0x${i.toString(16).padStart(40, '0')}` as Address;
          
          // First check if this address is approved using the mapping
          const shelterInfo = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ANIMAL_WELFARE_CONFIG.abi,
            functionName: 'approvedShelters',
            args: [testAddress]
          }) as {
            isApproved: boolean;
            monthlyAllowance: bigint;
            lastDistributionTime: bigint;
          };

          if (shelterInfo.isApproved) {
            console.log(`\nShelter Address: ${testAddress}`);
            console.log(`Monthly Allowance: ${shelterInfo.monthlyAllowance} wei`);
            console.log(`Last Distribution: ${new Date(Number(shelterInfo.lastDistributionTime) * 1000).toLocaleString()}`);
            
            // Get additional details
            const details = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ANIMAL_WELFARE_CONFIG.abi,
              functionName: 'getShelterDetails',
              args: [testAddress]
            }) as {
              isApproved: boolean;
              monthlyAllowance: bigint;
              lastDistributionTime: bigint;
              canReceiveDistribution: boolean;
            };
            
            console.log(`Can Receive Distribution: ${details.canReceiveDistribution}`);
            console.log('----------------------------------------');
          }
        } catch (error) {
          // Log any unexpected errors (non-existent shelters will be skipped silently)
          const err = error as Error;
          if (err.message && !err.message.includes('revert')) {
            console.error(`Error checking address ${i}:`, err);
          }
        }
      }
  
      console.log('\nFinished fetching shelter allowances');
    } catch (error) {
      console.error('Failed to fetch shelter allowances:', error);
      throw error;
    }
}

const run = async () => {
    await getShelterAllowances();
}

run();