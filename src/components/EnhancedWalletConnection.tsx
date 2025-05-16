// src/components/EnhancedWalletConnection.tsx
import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { ethers } from 'ethers';

const EnhancedWalletConnection: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  // Monad Testnet config
  const MONAD_TESTNET = {
    chainId: '0x279f', // 10143 in hex
    chainName: 'Monad Testnet',
    nativeCurrency: {
      name: 'MON',
      symbol: 'MON',
      decimals: 18
    },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://testnet.monadexplorer.com']
  };

  // Check if already connected when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if SDK wallet is available
        if (!sdk.wallet || !sdk.wallet.ethProvider) {
          console.log("Wallet provider not available");
          return;
        }

        const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          
          // Get network info
          const network = await provider.getNetwork();
          setChainId(`0x${network.chainId.toString(16)}`);
          
          // Get balance
          const balanceWei = await provider.getBalance(accounts[0]);
          setBalance(ethers.utils.formatEther(balanceWei));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkConnection();
  }, []);

  // Connect wallet
  const connect = async () => {
    try {
      setIsLoading(true);
      
      if (!sdk.wallet || !sdk.wallet.ethProvider) {
        console.error("Wallet provider not available");
        setIsLoading(false);
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
      // Request accounts using eth_requestAccounts
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setIsConnected(true);
        
        // Get network info
        const network = await provider.getNetwork();
        setChainId(`0x${network.chainId.toString(16)}`);
        
        // Get balance
        const balanceWei = await provider.getBalance(accounts[0]);
        setBalance(ethers.utils.formatEther(balanceWei));
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet (client-side only as ethProvider doesn't support this)
  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
    setChainId(null);
    setBalance(null);
  };
  
  // Switch to Monad Testnet
  const switchToMonad = async () => {
    try {
      if (!sdk.wallet || !sdk.wallet.ethProvider) {
        console.error("Wallet provider not available");
        return;
      }
      
      try {
        // Try to switch to Monad Testnet
        await sdk.wallet.ethProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x279f' }] // Monad Testnet chainId
        });
      } catch (switchError: any) {
        // If the chain doesn't exist, add it
        if (switchError.code === 4902) {
          await sdk.wallet.ethProvider.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_TESTNET]
          });
        } else {
          throw switchError;
        }
      }
      
      // Update chain ID after successful switch
      const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
      const network = await provider.getNetwork();
      setChainId(`0x${network.chainId.toString(16)}`);
      
      // Update balance for the new chain
      if (address) {
        const balanceWei = await provider.getBalance(address);
        setBalance(ethers.utils.formatEther(balanceWei));
      }
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };
  
  // Send a transaction
  const sendTransaction = async () => {
    try {
      if (!sdk.wallet || !sdk.wallet.ethProvider || !address) {
        console.error("Wallet provider not available or not connected");
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
      const signer = provider.getSigner();
      
      // Example transaction
      const tx = await signer.sendTransaction({
        to: ethers.constants.AddressZero, // Replace with recipient address
        value: ethers.utils.parseEther("0.0001") // Amount to send
      });
      
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Update balance after transaction
      const balanceWei = await provider.getBalance(address);
      setBalance(ethers.utils.formatEther(balanceWei));
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };
  
  // Sign a message
  const signMessage = async () => {
    try {
      if (!sdk.wallet || !sdk.wallet.ethProvider) {
        console.error("Wallet provider not available");
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
      const signer = provider.getSigner();
      
      // Message to sign
      const message = "Hello from Monad Chat!";
      
      // Personal sign
      const signature = await signer.signMessage(message);
      console.log("Signature:", signature);
      
      // Verify signature
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);
      console.log("Recovered address:", recoveredAddress);
      console.log("Matches connected address:", recoveredAddress.toLowerCase() === address?.toLowerCase());
    } catch (error) {
      console.error('Signing failed:', error);
    }
  };
  
  if (isConnected && address) {
    return (
      <div className="wallet-connection">
        <div className="wallet-info">
          <div className="connected-address">
            <div>Address: {address.substring(0, 6)}...{address.substring(address.length - 4)}</div>
            {chainId && <div>Network ID: {chainId}</div>}
            {balance && <div>Balance: {parseFloat(balance).toFixed(4)} ETH</div>}
          </div>
          <div className="wallet-actions">
            <button onClick={switchToMonad} className="wallet-button">
              Switch to Monad
            </button>
            <button onClick={sendTransaction} className="wallet-button">
              Send Test TX
            </button>
            <button onClick={signMessage} className="wallet-button">
              Sign Message
            </button>
            <button onClick={disconnect} className="wallet-button disconnect">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="wallet-connection">
      <button 
        onClick={connect} 
        className="wallet-button connect"
        disabled={isLoading}
      >
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
};

export default EnhancedWalletConnection;