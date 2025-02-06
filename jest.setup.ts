import { jest } from '@jest/globals';

// Make jest available globally
global.jest = jest;

// Mock environment variables
process.env.CDP_API_KEY_NAME = 'test-api-key';
process.env.CDP_API_KEY_PRIVATE_KEY = 'test-private-key';
process.env.NETWORK_ID = 'base-sepolia'; 