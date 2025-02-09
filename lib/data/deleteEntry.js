import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../../config/nillionOrgConfig.js';

// update schema id and record id to delete with your own values
const SCHEMA_ID = process.env.SHELTER_SCHEMA_ID;

async function main(recordId) {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    const filterById = {
      _id: recordId,
    };

    const readOriginalRecord = await collection.readFromNodes(filterById);
    console.log('📚 Read original record:', readOriginalRecord);

    const deletedData = await collection.deleteDataFromNodes(filterById);

    console.log('📚 Deleted record from all nodes:', deletedData);

    // await collection.flushData();
  } catch (error) {
    console.error('❌ Failed to use SecretVaultWrapper:', error.message);
    process.exit(1);
  }
}

main('64788169-a5c0-408a-9a3b-9c15e553b17f');