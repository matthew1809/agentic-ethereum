# Animal Welfare Fund Smart Contract

A smart contract designed to manage and distribute funds to animal shelters on a monthly basis. This contract enables transparent, automated distribution of donations to approved animal welfare organizations.

## Deployed Address: 0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8 (Base Sepolia)

## Features

- **Fixed Monthly Distributions**: Each shelter receives a predetermined monthly allowance
- **Secure Fund Management**: Built with OpenZeppelin's security standards
- **Flexible Administration**: Add, remove, or modify shelter allowances
- **Transparent Operations**: All transactions and changes are recorded on-chain

## Contract Details

- **Network**: Base Sepolia Testnet
- **Contract Address**: [Your deployed contract address]
- **Block Explorer**: [BaseScan link to your contract]

## Core Functions

### For Administrators

```solidity
function addShelter(address _shelter, uint256 _monthlyAllowance)
```
Adds a new shelter with a specified monthly allowance.
- `_shelter`: The shelter's wallet address
- `_monthlyAllowance`: Amount in wei to be distributed monthly

```solidity
function updateMonthlyAllowance(address _shelter, uint256 _newAllowance)
```
Updates an existing shelter's monthly allowance.

```solidity
function removeShelter(address _shelter)
```
Removes a shelter from the approved list.

### For Shelters/Public

```solidity
function distributeFunds(address _shelter)
```
Triggers the monthly distribution for a specific shelter.
- Can only be called once per month per shelter
- Contract must have sufficient balance

```solidity
function getShelterDetails(address _shelter)
```
Returns shelter information including:
- Approval status
- Monthly allowance
- Last distribution time
- Current distribution eligibility

### View Functions

```solidity
function getTotalMonthlyCommitments()
```
Returns the total amount of monthly commitments across all shelters.

## Events

- `DonationReceived(address indexed donor, uint256 amount)`
- `FundsDistributed(address indexed shelter, uint256 amount)`
- `ShelterAdded(address indexed shelter, uint256 monthlyAllowance)`
- `ShelterRemoved(address indexed shelter)`
- `MonthlyAllowanceUpdated(address indexed shelter, uint256 newAllowance)`

## Usage Example

```typescript
import { createPublicClient, http, parseEther } from 'viem'
import { baseSepolia } from 'viem/chains'

// Initialize client
const client = createPublicClient({
  chain: baseSepolia,
  transport: http()
})

// Add a new shelter (0.1 ETH monthly)
const addShelter = async (shelterAddress) => {
  const { request } = await client.simulateContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'addShelter',
    args: [shelterAddress, parseEther('0.1')]
  })
  // Execute with wallet client
}
```

## Security Considerations

1. The contract implements ReentrancyGuard to prevent re-entrancy attacks
2. Only the contract owner can add/remove shelters and modify allowances
3. Distribution intervals are enforced to prevent duplicate payments
4. All state-changing functions have appropriate access controls

## Development

### Prerequisites

- Node.js and npm
- Hardhat
- An Ethereum wallet with Base Sepolia ETH

### Installation

```bash
# Clone the repository
git clone [your-repo]

# Install dependencies
npm install

# Compile contract
npx hardhat compile

# Deploy to Base Sepolia
npx hardhat run scripts/deploy.js --network base-sepolia
```

### Testing

```bash
# Run tests
npx hardhat test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.

## Author

Matthew Foyle

## Support

For questions and support, please open an issue in the GitHub repository.