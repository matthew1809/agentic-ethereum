import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import type { WriteResult } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig.js';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import type { ShelterFetched } from '@/types/shelter';

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

const SCHEMA_ID = process.env.SHELTER_SCHEMA_ID;

interface OrgCredentials {
  secretKey: string;
  orgDid: string;
}

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

export async function GET() {
  try {
    if (!orgConfig.orgCredentials.secretKey || !orgConfig.orgCredentials.orgDid) {
      throw new Error('Missing required Nillion credentials');
    }

    console.log('calling GET shelters');

    const credentials: OrgCredentials = {
      secretKey: orgConfig.orgCredentials.secretKey,
      orgDid: orgConfig.orgCredentials.orgDid
    };

    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      credentials,
      SCHEMA_ID
    );
    await collection.init();

    console.log('reading shelters', collection);

    // Get all shelters
    const shelters = await collection.readFromNodes({}) as ShelterFetched[];
    console.log(shelters);
    
    if(shelters.length === 0) {
      return NextResponse.json([]);
    }

    // Format the response to only include necessary information
    const formattedShelters = shelters.map(shelter => ({
      id: shelter._id,
      name: shelter.shelter_info.name,
      location: shelter.shelter_info.location,
      metrics: {
        currentAnimals: shelter.metrics.current_animals,
        monthlyIntake: shelter.metrics.monthly_intake,
        neuteringCount: shelter.metrics.neutering_count,
        adoptionRate: shelter.metrics.adoption_rate
      }
    }));

    return NextResponse.json(formattedShelters);
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shelters' },
      { status: 500 }
    );
  }
} 