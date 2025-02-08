import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const STORE_FILE = 'agent_store.json';

interface ShelterMetadata {
  _id: string;
  shelter_info: {
    name: { $share: string };
    location: { $share: string };
  };
  thread_id: string;
}

class AgentStore {
  private shelters: Map<string, ShelterMetadata>;
  private storePath: string;

  constructor() {
    this.shelters = new Map();
    this.storePath = path.join(process.cwd(), STORE_FILE);
    this.loadFromDisk();
  }

  private loadFromDisk() {
    if (existsSync(this.storePath)) {
      try {
        const data = JSON.parse(readFileSync(this.storePath, 'utf8'));
        this.shelters = new Map(Object.entries(data));
      } catch (error) {
        console.error('Error loading agent store:', error);
      }
    }
  }

  private saveToDisk() {
    try {
      const data = Object.fromEntries(this.shelters);
      writeFileSync(this.storePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving agent store:', error);
    }
  }

  addShelter(id: string, metadata: ShelterMetadata) {
    this.shelters.set(id, metadata);
    this.saveToDisk();
  }

  getShelter(id: string): ShelterMetadata | undefined {
    this.loadFromDisk(); // Reload to get latest state
    return this.shelters.get(id);
  }

  getAllShelters(): Map<string, ShelterMetadata> {
    this.loadFromDisk(); // Reload to get latest state
    return new Map(this.shelters);
  }

  removeShelter(id: string) {
    this.shelters.delete(id);
    this.saveToDisk();
  }

  clear() {
    this.shelters.clear();
    this.saveToDisk();
  }
}

export const agentStore = new AgentStore(); 