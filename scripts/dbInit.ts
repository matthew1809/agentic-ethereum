import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../config/nillionOrgConfig.js';
import { sampleShelterData } from '../lib/data/sampleShelterData.js';
import { sampleDonorData } from '../lib/data/sampleDonorData.js';
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

async function initializeSchema(
  wrapper: SecretVaultWrapper, 
  schema: SchemaType, 
  name: string
): Promise<string> {
  try {
    // @ts-expect-error createSchema exists in the latest version but types are not updated
    const schemaResponse = await wrapper.createSchema(schema, name);
    const schemaId = schemaResponse[0].result.data;
    console.log(`✅ ${name} schema created with ID: ${schemaId}`);
    return schemaId;
  } catch (error) {
    console.error(`❌ Failed to create ${name} schema:`, error);
    throw error;
  }
}

async function writeData(
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
    console.log('Error writing data');
    // console.error(`❌ Failed to write ${name} data:`, error);
    // throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Initializing database...\n');

    // Load schemas from files
    const shelterSchema = await loadSchema(path.join(process.cwd(), 'lib/data/schemas', 'shelters-schema.json'));
    const donorSchema = await loadSchema(path.join(process.cwd(), 'lib/data/schemas', 'donors-schema.json'));

    console.log('Loaded schemas');

    // Initialize base wrapper for schema creation
    const wrapper = new SecretVaultWrapper(
      orgConfig.nodes,
      {
        secretKey: orgConfig.orgCredentials.secretKey || '',
        orgDid: orgConfig.orgCredentials.orgDid || ''
      }
    );
    await wrapper.init();

    console.log('Initialized wrapper');

    // Create schemas
    SHELTER_SCHEMA_ID = await initializeSchema(wrapper, shelterSchema, 'Shelter');
    DONOR_SCHEMA_ID = await initializeSchema(wrapper, donorSchema, 'Donor');

    console.log('Initialized schemas');

    // Write sample data
    await writeData(sampleShelterData, SHELTER_SCHEMA_ID, 'shelter');
    await writeData(sampleDonorData, DONOR_SCHEMA_ID, 'donor');

    console.log('\n✨ Database initialization complete!');
  } catch (error) {
    console.error('\n❌ Initialization failed:', error);
    process.exit(1);
  }
}

main();
