import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig';
import type { ShelterFetched } from '@/types/shelter';

const SCHEMA_ID = process.env.SHELTER_SCHEMA_ID || '';
async function main(): Promise<ShelterFetched[]> {
    
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

   // Read all collection data from the nodes, decrypting the specified fields
   const decryptedCollectionData = await collection.readFromNodes({}) as ShelterFetched[];

   return decryptedCollectionData;
}

export default main;