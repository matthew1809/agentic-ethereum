import { formatEther, type PublicClient } from "viem";

const getContractBalance = async (publicClient: PublicClient) => {
const balance = await publicClient.getBalance({
    address: '0x933bF9dbBe7ccff543Abb2C5878Fb879618182C8',
  })
  
  console.log(`Contract balance: ${formatEther(balance)} ETH`)
}

export default getContractBalance;