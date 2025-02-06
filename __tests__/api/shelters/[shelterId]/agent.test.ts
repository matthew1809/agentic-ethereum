import { NextRequest } from 'next/server';
import { GET } from '@/app/api/shelters/[shelterId]/agent/route';
import { SecretVaultWrapper, WriteResult } from 'nillion-sv-wrappers';
import { AgentKit, CdpWalletProvider } from '@coinbase/agentkit';
import { ChatAnthropic } from '@langchain/anthropic';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Define mock types
type MockFn = jest.Mock;

// Mock the modules
jest.mock('nillion-sv-wrappers');
jest.mock('@coinbase/agentkit');
jest.mock('@langchain/anthropic');
jest.mock('@langchain/langgraph/prebuilt');
jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

// Mock sample data
const mockShelterData = {
  _id: 'test-shelter-id',
  shelter_info: {
    name: { $share: 'Test Shelter' },
    location: { $share: 'Test Location' },
    operational_costs: { $share: 10000 }
  },
  metrics: {
    current_animals: 10,
    monthly_intake: 5,
    neutering_count: 8,
    adoption_rate: 0.75
  },
  animals: [
    {
      id: 'test-animal-1',
      species: 'dog',
      status: 'available',
      intake_date: '2024-03-20T00:00:00Z'
    }
  ]
};

describe('Shelter Agent API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const mockInit = jest.fn().mockResolvedValue(undefined) as MockFn;
    const mockReadFromNodes = jest.fn().mockResolvedValue([mockShelterData]) as MockFn;
    const mockWriteToNodes = jest.fn().mockResolvedValue([{
      result: { data: { created: ['test-id'] } }
    }]) as MockFn;

    const mockSecretVaultWrapper = {
      init: mockInit,
      readFromNodes: mockReadFromNodes,
      writeToNodes: mockWriteToNodes
    };

    (SecretVaultWrapper as unknown as MockFn)
      .mockImplementation(() => mockSecretVaultWrapper);

    const mockExportWallet = jest.fn().mockResolvedValue({ walletData: 'test' }) as MockFn;
    const mockWalletProvider = {
      exportWallet: mockExportWallet
    };

    (CdpWalletProvider.configureWithWallet as unknown as MockFn)
      .mockResolvedValue(mockWalletProvider);

    const mockAgentKit = {
      tools: [],
      wallet: mockWalletProvider
    };

    (AgentKit.from as unknown as MockFn)
      .mockResolvedValue(mockAgentKit);

    const mockChatAnthropic = {
      lc_secrets: {},
      lc_aliases: {},
      lc_serializable: true,
      temperature: 0.7,
      anthropicApiKey: 'test-key',
      model: 'claude-3-5-sonnet-latest'
    };

    (ChatAnthropic as unknown as MockFn)
      .mockImplementation(() => mockChatAnthropic);

    const mockInvoke = jest.fn() as MockFn;
    const mockChain = jest.fn() as MockFn;
    const mockAgent = {
      messageModifier: '',
      invoke: mockInvoke,
      chain: mockChain
    };

    (createReactAgent as unknown as MockFn)
      .mockImplementation(({ messageModifier }: { messageModifier: string }) => ({
        ...mockAgent,
        messageModifier
      }));
  });

  it('should successfully initialize an agent for a valid shelter ID', async () => {
    const request = new NextRequest('http://localhost/api/shelters/test-shelter-id/agent');
    const params = { shelterId: 'test-shelter-id' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
      message: 'Agent initialized successfully',
      config: expect.objectContaining({
        configurable: expect.objectContaining({
          thread_id: expect.stringContaining('Test Shelter'),
          shelter_id: 'test-shelter-id'
        })
      })
    }));

    // Verify SecretVaultWrapper was initialized correctly
    expect(SecretVaultWrapper).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Object),
      expect.any(String)
    );
  });

  it('should return 404 when shelter is not found', async () => {
    // Mock readFromNodes to return empty array
    const mockInit = jest.fn().mockResolvedValue(undefined) as MockFn;
    const mockReadFromNodes = jest.fn().mockResolvedValue([]) as MockFn;
    const mockWriteToNodes = jest.fn().mockResolvedValue([]) as MockFn;

    const mockEmptyVaultWrapper = {
      init: mockInit,
      readFromNodes: mockReadFromNodes,
      writeToNodes: mockWriteToNodes
    };

    (SecretVaultWrapper as unknown as MockFn)
      .mockImplementation(() => mockEmptyVaultWrapper);

    const request = new NextRequest('http://localhost/api/shelters/non-existent-id/agent');
    const params = { shelterId: 'non-existent-id' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Shelter not found'
    });
  });

  it('should handle initialization errors gracefully', async () => {
    // Mock SecretVaultWrapper to throw an error
    const mockInit = jest.fn().mockRejectedValue(new Error('Initialization failed')) as MockFn;
    const mockReadFromNodes = jest.fn() as MockFn;
    const mockWriteToNodes = jest.fn() as MockFn;

    const mockErrorVaultWrapper = {
      init: mockInit,
      readFromNodes: mockReadFromNodes,
      writeToNodes: mockWriteToNodes
    };

    (SecretVaultWrapper as unknown as MockFn)
      .mockImplementation(() => mockErrorVaultWrapper);

    const request = new NextRequest('http://localhost/api/shelters/test-shelter-id/agent');
    const params = { shelterId: 'test-shelter-id' };

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to initialize shelter agent'
    });
  });

  it('should include correct shelter information in agent message modifier', async () => {
    const request = new NextRequest('http://localhost/api/shelters/test-shelter-id/agent');
    const params = { shelterId: 'test-shelter-id' };

    await GET(request, { params });

    // Verify ChatAnthropic was initialized
    expect(ChatAnthropic).toHaveBeenCalledWith({
      model: "claude-3-5-sonnet-latest"
    });

    // Verify agent creation included shelter-specific information
    expect(createReactAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        messageModifier: expect.stringContaining('Test Shelter')
      })
    );

    const agentCall = (createReactAgent as unknown as MockFn).mock.calls[0][0] as { messageModifier: string };
    const messageModifier = agentCall.messageModifier;

    expect(messageModifier).toContain('Test Shelter');
    expect(messageModifier).toContain('Test Location');
    expect(messageModifier).toContain('10 animals in our care');
    expect(messageModifier).toContain('75.0%');
  });
}); 