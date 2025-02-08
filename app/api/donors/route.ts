import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import type { WriteResult } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig.js';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

// Define types for our data structures
interface DonorInput {
  name: string;
  amount: number;
  recurring: boolean;
  duration_months: number;
}

const SCHEMA_ID = '03e30e97-abc9-4cee-96b4-ec9d67bbc2a6'; // You'll need to update this with the actual schema ID

export async function POST(request: Request) {
  try {
    const body = await request.json() as DonorInput;
    
    // Validate required fields
    const requiredFields = ['name', 'amount', 'recurring', 'duration_months'] as const;
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Additional validation
    if (body.duration_months < 0) {
      return NextResponse.json(
        { error: 'duration_months must be 0 or positive' },
        { status: 400 }
      );
    }

    if (!body.recurring && body.duration_months !== 0) {
      return NextResponse.json(
        { error: 'Non-recurring donations must have duration_months set to 0' },
        { status: 400 }
      );
    }

    // Format the data according to the schema
    const donorData = [{
      _id: randomUUID(),
      donor_info: {
        name: { $share: body.name },
        amount: { $share: body.amount }
      },
      recurring: body.recurring,
      duration_months: body.duration_months
    }];

    if(!orgConfig.orgCredentials.secretKey || !orgConfig.orgCredentials.orgDid) {
      throw new Error("Missing org credentials");
    }
    // Initialize SecretVaultWrapper
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      {
        secretKey: orgConfig.orgCredentials.secretKey,
        orgDid: orgConfig.orgCredentials.orgDid
      },
      SCHEMA_ID
    );
    await collection.init();

    // Write data to nodes
    const dataWritten = await collection.writeToNodes(donorData);
    
    // Get the created record IDs
    const newIds = [
      ...new Set(dataWritten.flatMap((item: WriteResult) => item.result.data.created))
    ];

    return NextResponse.json({
      message: 'Donor created successfully',
      ids: newIds
    });

  } catch (error) {
    console.error('Failed to create donor:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 