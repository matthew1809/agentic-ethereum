import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../config/nillionOrgConfig.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs/promises';
import path from 'node:path';

// Schema IDs - will be generated during initialization
let SHELTER_SCHEMA_ID = '';
let DONOR_SCHEMA_ID = '';

interface SchemaType {
  $schema: string;
  title: string;
  type: string;
  items: Record<string, unknown>;
}

async function loadSchema(filePath: string): Promise<SchemaType> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

const sampleShelters = [
  {
    _id: uuidv4(),
    shelter_info: {
      name: { $share: "Happy Paws Shelter" },
      location: { $share: "San Francisco, CA" },
      operational_costs: { $share: 15000 }
    },
    metrics: {
      current_animals: 45,
      monthly_intake: 12,
      neutering_count: 8,
      adoption_rate: 0.75
    },
    animals: []
  },
  {
    _id: uuidv4(),
    shelter_info: {
      name: { $share: "Furry Friends Haven" },
      location: { $share: "Austin, TX" },
      operational_costs: { $share: 12000 }
    },
    metrics: {
      current_animals: 32,
      monthly_intake: 8,
      neutering_count: 5,
      adoption_rate: 0.8
    },
    animals: []
  }
];

const sampleDonors = [
  {
    _id: uuidv4(),
    donor_info: {
      name: { $share: "John Smith" },
      amount: { $share: 1000 }
    },
    recurring: true,
    duration_months: 12
  },
  {
    _id: uuidv4(),
    donor_info: {
      name: { $share: "Jane Doe" },
      amount: { $share: 500 }
    },
    recurring: false,
    duration_months: 0
  }
];

async function initializeSchema(
  wrapper: SecretVaultWrapper, 
  schema: SchemaType, 
  name: string
): Promise<string> {
  try {
    // @ts-expect-error createSchema exists in the latest version but types are not updated
    const schemaId = await wrapper.createSchema(schema);
    console.log(`✅ ${name} schema created with ID: ${schemaId}`);
    return schemaId;
  } catch (error) {
    console.error(`❌ Failed to create ${name} schema:`, error);
    throw error;
  }
}

async function writeData(
  wrapper: SecretVaultWrapper, 
  data: Record<string, unknown>[], 
  schemaId: string, 
  name: string
) {
  try {
    if (!orgConfig.orgCredentials.secretKey || !orgConfig.orgCredentials.orgDid) {
      throw new Error('Missing required credentials');
    }

    const credentials = {
      secretKey: orgConfig.orgCredentials.secretKey,
      orgDid: orgConfig.orgCredentials.orgDid
    };

    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      credentials,
      schemaId
    );
    await collection.init();
    await collection.writeToNodes(data);
    console.log(`✅ Sample ${name} data written successfully`);
  } catch (error) {
    console.error(`❌ Failed to write ${name} data:`, error);
    throw error;
  }
}

async function generateEnvFile(shelterSchemaId: string, donorSchemaId: string) {
  const envContent = `# Nillion Secret Vault Configuration
SHELTER_SCHEMA_ID="${shelterSchemaId}"
DONOR_SCHEMA_ID="${donorSchemaId}"

# Node Configuration
NODE_URLS=${orgConfig.nodes.join(',')}

# Organization Credentials
ORG_SECRET_KEY="${orgConfig.orgCredentials.secretKey}"
ORG_DID="${orgConfig.orgCredentials.orgDid}"

# API Configuration
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
`;

  try {
    await fs.writeFile('.env.local', envContent);
    console.log('✅ Environment variables written to .env.local');
    console.log('\nAdd these variables to your Vercel project:');
    console.log(`SHELTER_SCHEMA_ID="${shelterSchemaId}"`);
    console.log(`DONOR_SCHEMA_ID="${donorSchemaId}"`);
  } catch (error) {
    console.error('❌ Failed to write .env.local file:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Initializing database...\n');

    // Load schemas from files
    const shelterSchema = await loadSchema(path.join(process.cwd(), 'data', 'shelters-schema.json'));
    const donorSchema = await loadSchema(path.join(process.cwd(), 'data', 'donors-schema.json'));

    // Initialize base wrapper for schema creation
    const wrapper = new SecretVaultWrapper(
      orgConfig.nodes,
      {
        secretKey: orgConfig.orgCredentials.secretKey || '',
        orgDid: orgConfig.orgCredentials.orgDid || ''
      }
    );
    await wrapper.init();

    // Create schemas
    SHELTER_SCHEMA_ID = await initializeSchema(wrapper, shelterSchema, 'Shelter');
    DONOR_SCHEMA_ID = await initializeSchema(wrapper, donorSchema, 'Donor');

    // Write sample data
    await writeData(wrapper, sampleShelters, SHELTER_SCHEMA_ID, 'shelter');
    await writeData(wrapper, sampleDonors, DONOR_SCHEMA_ID, 'donor');

    // Generate environment variables
    await generateEnvFile(SHELTER_SCHEMA_ID, DONOR_SCHEMA_ID);

    console.log('\n✨ Database initialization complete!');
    console.log('\nNext steps:');
    console.log('1. Add the schema IDs to your Vercel environment variables');
    console.log('2. Run your application with `npm run dev`');
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
