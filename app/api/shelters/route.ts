import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import type { WriteResult } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig.js';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';

// Define types for our data structures
interface Animal {
  species: string;
  status: 'available' | 'adopted';
  intake_date: string;
}

interface Metrics {
  current_animals: number;
  monthly_intake: number;
  neutering_count: number;
  adoption_rate: number;
}

interface ShelterInput {
  name: string;
  location: string;
  operational_costs: number;
  metrics: Metrics;
  animals: Animal[];
}

const SCHEMA_ID = '03e30e97-abc9-4cee-96b4-ec9d67bbc2a6';

export async function POST(request: Request) {
  try {
    const body = await request.json() as ShelterInput;
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'operational_costs', 'metrics', 'animals'] as const;
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Format the data according to the schema
    const shelterData = [{
      _id: randomUUID(),
      shelter_info: {
        name: { $share: body.name },
        location: { $share: body.location },
        operational_costs: { $share: body.operational_costs }
      },
      metrics: {
        current_animals: body.metrics.current_animals,
        monthly_intake: body.metrics.monthly_intake,
        neutering_count: body.metrics.neutering_count,
        adoption_rate: body.metrics.adoption_rate
      },
      animals: body.animals.map((animal: Animal) => ({
        id: randomUUID(),
        species: animal.species,
        status: animal.status,
        intake_date: animal.intake_date
      }))
    }];

    // Initialize SecretVaultWrapper
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Write data to nodes
    const dataWritten = await collection.writeToNodes(shelterData);
    
    // Get the created record IDs
    const newIds = [
      ...new Set(dataWritten.flatMap((item: WriteResult) => item.result.data.created))
    ];

    return NextResponse.json({
      message: 'Shelter created successfully',
      ids: newIds
    });

  } catch (error) {
    console.error('Failed to create shelter:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 