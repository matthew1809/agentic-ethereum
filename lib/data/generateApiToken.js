import { SecretVaultWrapper } from 'nillion-sv-wrappers';
import { orgConfig } from '../../config/nillionOrgConfig.js';

const generateApiToken = async () => {
  try {
    console.log(orgConfig);
    const org = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials
    );
    await org.init();

    // generate api tokens for all nodes in the org config
    const res = await org.generateTokensForAllNodes();
    console.log(res)
    return res[1];
  } catch (error) {
    console.error('❌ Failed to use SecretVaultWrapper:', error.message);
    process.exit(1);
  }
}

generateApiToken();
// export default generateApiToken;