import { ethers } from 'ethers';
import { sdk } from '@farcaster/frame-sdk';
import { ChatMessage } from './multisynq';

// Contract ABI
const CHAT_ABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "fid",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "MessageStored",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fid",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "text",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"name": "storeMessage",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMessageCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "limit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "offset",
				"type": "uint256"
			}
		],
		"name": "getMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fid",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "username",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "text",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "signature",
						"type": "bytes"
					}
				],
				"internalType": "struct ChatStorage.Message[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fid",
				"type": "uint256"
			}
		],
		"name": "getUserMessageCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "fid",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "limit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "offset",
				"type": "uint256"
			}
		],
		"name": "getUserMessages",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "fid",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "username",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "text",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bytes",
						"name": "signature",
						"type": "bytes"
					}
				],
				"internalType": "struct ChatStorage.Message[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "messages",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fid",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "username",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "text",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bytes",
				"name": "signature",
				"type": "bytes"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userMessageCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Monad Testnet config
export const MONAD_TESTNET = {
  chainId: '0x279f', // 10143 hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MON',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://testnet-rpc.monad.xyz'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
};

// Setup Monad connection
export async function setupMonadContract(contractAddress: string) {
  try {
    // Create provider
    const provider = new ethers.providers.JsonRpcProvider("https://testnet-rpc.monad.xyz");
    
    // Create contract instance
    const contract = new ethers.Contract(
      contractAddress,
      CHAT_ABI,
      provider
    );
    
    // Try to connect a wallet if available
    let signer: ethers.Signer | null = null;
    
    if (sdk.wallet && sdk.wallet.ethProvider) {
      try {
        // Try to switch to Monad Testnet using Frame SDK's ethProvider
        try {
          await sdk.wallet.ethProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x279f' }] 
          });
        } catch (switchError: any) {
          // Add the chain if it doesn't exist
          if (switchError.code === 4902) {
            await sdk.wallet.ethProvider.request({
              method: 'wallet_addEthereumChain',
              params: [MONAD_TESTNET]
            });
          } else {
            throw switchError;
          }
        }
        
        // Get signer
        const web3Provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
        signer = web3Provider.getSigner();
        
        // Connect contract with signer
        const connectedContract = contract.connect(signer);
        
        return {
          provider,
          contract: connectedContract,
          
          // Store message to blockchain
          storeMessage: async (message: ChatMessage) => {
            if (!signer) throw new Error("No wallet connected");
            
            const tx = await connectedContract.storeMessage(
              message.sender.fid,
              message.sender.username,
              message.text,
              message.timestamp,
              message.signature || "0x" // Empty signature if none
            );
            
            return await tx.wait();
          },
          
          // Get messages from blockchain
          getMessages: async (limit = 50, offset = 0) => {
            const rawMessages = await contract.getMessages(limit, offset);
            
            return rawMessages.map((msg: any) => ({
              id: msg.id.toString(),
              text: msg.text,
              sender: {
                fid: msg.fid.toNumber(),
                username: msg.username
              },
              timestamp: msg.timestamp.toNumber(),
              signature: msg.signature
            }));
          }
        };
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        // Fall back to read-only mode
      }
    }
    
    // Read-only client
    return {
      provider,
      contract,
      
      storeMessage: async () => {
        throw new Error("No wallet connected");
      },
      
      getMessages: async (limit = 50, offset = 0) => {
        try {
          const rawMessages = await contract.getMessages(limit, offset);
          
          return rawMessages.map((msg: any) => ({
            id: msg.id.toString(),
            text: msg.text,
            sender: {
              fid: msg.fid.toNumber(),
              username: msg.username
            },
            timestamp: msg.timestamp.toNumber(),
            signature: msg.signature
          }));
        } catch (error) {
          console.error("Failed to fetch messages:", error);
          return [];
        }
      }
    };
  } catch (error) {
    console.error("Failed to setup Monad connection:", error);
    throw error;
  }
}