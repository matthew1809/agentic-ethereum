import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '@/config/nillionOrgConfig';
import type { Shelter } from '@/types/shelter';
async function main(SCHEMA_ID: string): Promise<Shelter[]> {
    
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
   const decryptedCollectionData = await collection.readFromNodes({}) as Shelter[];

   return decryptedCollectionData;
}

export default main;