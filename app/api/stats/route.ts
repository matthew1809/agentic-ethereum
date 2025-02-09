import { NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { ANIMAL_WELFARE_CONFIG } from '@/contracts/animalWelfareContractConfig';

const CONTRACT_ADDRESS = '0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8';

export async function GET() {
  try {
    // Initialize the public client
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    // Get contract balance
    const balance = await publicClient.getBalance({
      address: CONTRACT_ADDRESS
    });

    // Count approved shelters and donations
    let shelterCount = 0;
    let donationCount = 0;

    // Check the known shelter addresses from the initialization
    const knownAddresses = [
      '0x7C6461Aa79DD6eEb22191c68d37F3E5a22763112',
      '0x0396e77cC09293C5E61E6058423928694f0C1D0b',
      '0x5A91c18425767179C73fB89D15283E5B939F54A0',
      '0x66E64Be2DF7251c254dE8a712d83C1b6F88f50fE',
      '0x9Ce0177bd91c447dEc2C5A11e4ec7C67006F289f'
    ];

    console.log('Checking shelters in contract...');

    // Get total number of transactions to contract as a proxy for donations
    try {
      donationCount = Number(await publicClient.getTransactionCount({
        address: CONTRACT_ADDRESS
      }));
      console.log(`Contract has received ${donationCount} transactions`);
    } catch (error) {
      console.error('Failed to get transaction count:', error);
      donationCount = 0;
    }

    for (const address of knownAddresses) {
      try {
        const shelterInfo = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ANIMAL_WELFARE_CONFIG.abi,
          functionName: 'approvedShelters',
          args: [address]
        }) as { isApproved: boolean; monthlyAllowance: bigint; lastDistributionTime: bigint };

        shelterCount++;

        if (shelterInfo.monthlyAllowance > BigInt(0)) {
          console.log(`Found active shelter at ${address}`);
        }
      } catch (error) {
        console.error(`Error checking shelter ${address}:`, error);
      }
    }

    console.log('Stats summary:', {
      balance: formatEther(balance),
      shelterCount,
      donationCount
    });

    return NextResponse.json({
      balance: formatEther(balance),
      shelterCount,
      donationCount
    });
  } catch (error) {
    console.error('Failed to fetch blockchain stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blockchain stats' },
      { status: 500 }
    );
  }
}
