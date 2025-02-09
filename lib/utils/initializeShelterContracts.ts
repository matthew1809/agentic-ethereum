import { createPublicClient, createWalletClient, http, type Address, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { ANIMAL_WELFARE_CONFIG } from '@/contracts/animalWelfareContractConfig';
import readData from '@/lib/data/readData';
import type { ShelterFetched } from '@/types/shelter';
import * as fs from 'node:fs';
import path from 'node:path';
// Current exchange rate PLN to ETH (this should be fetched from an API in production)
const PLN_TO_ETH = 0.000125; // Example rate: 1 PLN = 0.000125 ETH

const CONTRACT_ADDRESS = '0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8' as Address;

// Get shelter's CDP wallet address from their wallet data file
async function getShelterWalletAddress(shelterId: string): Promise<Address | null> {
  const WALLET_INFO_DIR = path.join(process.cwd(), 'walletInfo');
  const walletAddressFile = path.join(WALLET_INFO_DIR, `wallet_address_${shelterId}.txt`);
  
  try {
    if (!fs.existsSync(walletAddressFile)) {
      console.log(`No wallet address file found for shelter ${shelterId}`);
      return null;
    }

    const walletAddressStr = fs.readFileSync(walletAddressFile, 'utf8');
    
    // Log the wallet data structure to understand what's available
    console.log('Wallet address:', walletAddressStr);
    
    if (walletAddressStr) {
      return walletAddressStr as Address;
    }
    
    console.error('Could not find address in wallet data');
    return null;
  } catch (error) {
    console.error(`Error reading wallet data for shelter ${shelterId}:`, error);
    return null;
  }
}

export async function initializeShelterContracts(privateKey: string) {
  try {
    console.log('Initializing shelter contracts...');
    
    // Create account from private key
    const account = privateKeyToAccount(`0x${privateKey}` as `0x${string}`);
    console.log('Our wallet address:', account.address);
    
    // Initialize clients
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http()
    });

    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
      account
    });

    // First, check if we're the contract owner
    const contractOwner = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: ANIMAL_WELFARE_CONFIG.abi,
      functionName: 'owner'
    }) as Address;

    console.log('Contract owner:', contractOwner);

    if (contractOwner.toLowerCase() !== account.address.toLowerCase()) {
      throw new Error(`Not authorized. Contract owner is ${contractOwner}, but we're using ${account.address}`);
    }

    // Get all shelters from Nillion
    const shelters: ShelterFetched[] = await readData();
    console.log(`Found ${shelters.length} shelters in Nillion`);

    for (const shelter of shelters) {
      try {
        console.log('\nProcessing shelter:', {
          id: shelter._id,
          name: shelter.shelter_info.name,
          location: shelter.shelter_info.location
        });

        // Get shelter's CDP wallet address
        const shelterAddress = await getShelterWalletAddress(shelter._id);
        if (!shelterAddress) {
          console.error(`Could not get wallet address for shelter ${shelter._id}, skipping...`);
          continue;
        }
        console.log('Found CDP wallet address:', shelterAddress);

        // Get shelter's operational costs in PLN
        const operationalCostsPLN = Number(shelter.shelter_info.operational_costs);
        if (Number.isNaN(operationalCostsPLN)) {
          console.error(`Invalid operational costs for shelter ${shelter._id}`);
          continue;
        }
        console.log('Operational costs (PLN):', operationalCostsPLN);

        // Convert PLN to ETH (10% of monthly costs)
        const monthlyAllowanceETH = (operationalCostsPLN * PLN_TO_ETH * 0.1).toFixed(18);
        console.log('Monthly allowance (ETH):', monthlyAllowanceETH);

        // Check if shelter exists in contract
        console.log('Checking if shelter exists in contract...');
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ANIMAL_WELFARE_CONFIG.abi,
          functionName: 'getShelterDetails',
          args: [shelterAddress]
        }) as { isApproved: boolean };

        if (!result.isApproved) {
          console.log(`Adding shelter ${shelter.shelter_info.name} to contract...`);
          
          // Convert ETH to wei and add shelter to contract
          const { request } = await publicClient.simulateContract({
            address: CONTRACT_ADDRESS,
            abi: ANIMAL_WELFARE_CONFIG.abi,
            functionName: 'addShelter',
            args: [
              shelterAddress,
              parseEther(monthlyAllowanceETH)   
            ],
            account
          });

          const hash = await walletClient.writeContract(request);
          console.log(`Transaction sent: ${hash}`);

          // Wait for transaction confirmation
          const receipt = await publicClient.waitForTransactionReceipt({ hash });
          console.log(`Shelter ${shelter.shelter_info.name} added to contract. Status: ${receipt.status}`);
        } else {
          console.log(`Shelter ${shelter.shelter_info.name} already exists in contract`);
        }
      } catch (error) {
        console.error(`Error processing shelter ${shelter._id}:`, error);
      }
    }

    console.log('\nFinished initializing shelter contracts');
  } catch (error) {
    console.error('Failed to initialize shelter contracts:', error);
    throw error;
  }
}