import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { ethers } from 'ethers';

const WalletConnection: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already connected when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (sdk.wallet && sdk.wallet.ethProvider) {
          const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsConnected(true);
          }
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
      
      if (sdk.wallet && sdk.wallet.ethProvider) {
        const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
        // Request accounts
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      } else {
        console.error('Ethereum provider not available');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAddress(null);
    setIsConnected(false);
  };
  
  if (isConnected && address) {
    return (
      <div className="wallet-connection">
        <div className="wallet-info">
          <div>Connected: {address.substring(0, 6)}...{address.substring(address.length - 4)}</div>
        </div>
        <button onClick={disconnect} className="wallet-button disconnect">
          Disconnect
        </button>
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

export default WalletConnection;