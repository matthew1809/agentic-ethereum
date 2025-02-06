declare module 'nillion-sv-wrappers' {
  interface Node {
    url: string;
    did: string;
  }

  interface OrgCredentials {
    secretKey: string;
    orgDid: string;
  }

  interface WriteResult {
    result: {
      data: {
        created: string[];
      };
    };
  }

  export class SecretVaultWrapper {
    constructor(nodes: Node[], orgCredentials: OrgCredentials, schemaId?: string);
    init(): Promise<void>;
    writeToNodes(data: unknown[]): Promise<WriteResult[]>;
    readFromNodes(options: { filter?: Record<string, unknown> }): Promise<unknown[]>;
  }
} 