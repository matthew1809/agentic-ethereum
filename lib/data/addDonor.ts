import { v4 as uuidv4 } from 'uuid';
import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig';

interface DonorInfo {
  name: {
    $share: string;
  };
  amount: {
    $share: number;
  };
}

interface Donor {
  _id: string;
  donor_info: DonorInfo;
  recurring: boolean;
  duration_months: number;
}

export async function addDonor(
  name: string,
  amount: number,
  isRecurring: boolean = false,
  durationMonths: number = 0
): Promise<void> {
  try {
    if (!orgConfig.orgCredentials.secretKey || !orgConfig.orgCredentials.orgDid) {
      throw new Error("Missing org credentials");
    }

      const sv = new SecretVaultWrapper(
        orgConfig.nodes,
        {
          secretKey: orgConfig.orgCredentials.secretKey,
          orgDid: orgConfig.orgCredentials.orgDid
        },
        process.env.DONOR_SCHEMA_ID
      );

      await sv.init();
    
    // Create donor object according to schema
    const donor: Donor = {
      _id: uuidv4(),
      donor_info: {
        name: {
          $share: name
        },
        amount: {
          $share: amount
        }
      },
      recurring: isRecurring,
      duration_months: isRecurring ? durationMonths : 0
    };

    // Get existing donors
    const existingDonors = await sv.read(orgConfig.schemaIds.donors);
    const donors: Donor[] = existingDonors || [];

    // Check if donor with same name exists
    const existingDonorIndex = donors.findIndex(
      d => d.donor_info.name.$share === name
    );

    if (existingDonorIndex !== -1) {
      // Update existing donor
      donors[existingDonorIndex] = {
        ...donors[existingDonorIndex],
        donor_info: {
          ...donors[existingDonorIndex].donor_info,
          amount: {
            $share: amount
          }
        },
        recurring: isRecurring,
        duration_months: isRecurring ? durationMonths : 0
      };
    } else {
      // Add new donor
      donors.push(donor);
    }

    // Write updated donors array back to the secret vault
    await sv.write(orgConfig.schemaIds.donors, donors);

  } catch (error) {
    console.error('Error in addDonor:', error);
    throw new Error('Failed to process donation');
  }
} 