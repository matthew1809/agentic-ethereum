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

main('585adef6-ef51-434b-ace9-092c84ce011b');