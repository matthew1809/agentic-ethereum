import { Redis } from '@upstash/redis';
import type { createReactAgent } from "@langchain/langgraph/prebuilt";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing required Upstash Redis environment variables');
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

interface ShelterMetadata {
  _id: string;
  shelter_info: {
    name: { $share: string };
    location: { $share: string };
  };
  thread_id: string;
  agent?: ReturnType<typeof createReactAgent>;
}

class AgentStore {
  private shelters: Map<string, ShelterMetadata>;

  constructor() {
    this.shelters = new Map();
    this.loadFromRedis();
  }

  private async loadFromRedis() {
    try {
      const data = await redis.get('agent_store');
      if (data) {
        this.shelters = new Map(Object.entries(data as Record<string, ShelterMetadata>));
      }
    } catch (error) {
      console.error('Error loading agent store from Redis:', error);
    }
  }

  private async saveToRedis() {
    try {
      const data = Object.fromEntries(this.shelters);
      await redis.set('agent_store', data);
    } catch (error) {
      console.error('Error saving agent store to Redis:', error);
    }
  }

  async addShelter(id: string, metadata: ShelterMetadata) {
    this.shelters.set(id, metadata);
    await this.saveToRedis();
  }

  async getShelter(id: string): Promise<ShelterMetadata | undefined> {
    await this.loadFromRedis(); // Reload to get latest state
    return this.shelters.get(id);
  }

  async getAllShelters(): Promise<Map<string, ShelterMetadata>> {
    await this.loadFromRedis(); // Reload to get latest state
    return new Map(this.shelters);
  }

  async removeShelter(id: string) {
    this.shelters.delete(id);
    await this.saveToRedis();
  }

  async clear() {
    this.shelters.clear();
    await this.saveToRedis();
  }
}

export const agentStore = new AgentStore(); 