import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../config/nillionOrgConfig.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const schema = require('./schemas/shelters-schema.json');

async function main() {
  try {
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );

    console.log('org', org)
    await org.init();

    console.log(schema);

    // Create a new collection schema for all nodes in the org
    const collectionName = 'agentic-ethereum';
    const newSchema = await org.createSchema(schema, collectionName);
    console.log('✅ New Collection Schema created for all nodes:', newSchema);
    console.log('👀 Schema ID:', newSchema[0].result.data);
  } catch (error) {
    console.error('❌ Failed to use SecretVaultWrapper:', error.message);
    process.exit(1);
  }
}

main();