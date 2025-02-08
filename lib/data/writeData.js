import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../config/nillionOrgConfig.js';
import { sampleShelterData } from './sampleShelterData.js';

async function main(SCHEMA_ID) {
    try {
      // Create a secret vault wrapper and initialize the SecretVault collection to use
      const collection = new SecretVaultWrapper(
        orgConfig.nodes,
        orgConfig.orgCredentials,
        SCHEMA_ID
      );

      await collection.init();
  
      // Write collection data to nodes encrypting the specified fields ahead of time
      const dataWritten = await collection.writeToNodes(sampleShelterData);
      console.log(
        '👀 Data written to nodes:',
        JSON.stringify(dataWritten, null, 2)
      );
  
      // Get the ids of the SecretVault records created
      const newIds = [
        ...new Set(dataWritten.flatMap((item) => item.result.data.created)),
      ];
      console.log('uploaded record ids:', newIds);
    } catch (error) {
      console.error('❌ SecretVaultWrapper error:', error.message);
      process.exit(1);
    }
  }

main('d20f2c6f-84d2-4542-92d7-e47e63359d97')

//   export default main;