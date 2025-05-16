// იმპორტები, React შეცვლილია JSX.Element-ის გამოყენებით
import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { ethers } from 'ethers';
import { useMonadChat } from './hooks/useMonadChat';
import ChatList from './components/ChatList';
import UserInput from './components/UserInput';
import './App.css';

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  // ამოვიღეთ error, რადგან არ გამოიყენება
  const { user, messages, isLoading, sendMessage, signIn, shareApp, addApp } = useMonadChat();

  // Initialize ethereum provider when component mounts
  useEffect(() => {
    const initProvider = async () => {
      try {
        if (sdk.wallet && sdk.wallet.ethProvider) {
          // Check if already connected
          const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            setIsWalletConnected(true);
          }
        }
      } catch (error) {
        console.error('Error initializing wallet:', error);
      }
    };

    initProvider();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      if (sdk.wallet && sdk.wallet.ethProvider) {
        const provider = new ethers.providers.Web3Provider(sdk.wallet.ethProvider);
        // Request accounts
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsWalletConnected(true);
        }
      } else {
        console.error('Ethereum provider not available');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAddress(null);
    setIsWalletConnected(false);
  };
  
  // Show loading state
  if (isLoading) {
    return <div className="loading">Loading chat...</div>;
  }
  
  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="sign-in-prompt">
        <h2>Welcome to Monad Chat!</h2>
        <p>Sign in with your Farcaster account to join the conversation.</p>
        <button onClick={signIn} className="sign-in-button">
          Sign in with Farcaster
        </button>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <header>
        <h1>Monad Chat</h1>
        <div className="actions">
          <button onClick={shareApp} className="action-button">
            Share
          </button>
          <button onClick={addApp} className="action-button">
            Add to Farcaster
          </button>
        </div>
      </header>
      
      <div className="wallet-connection">
        {isWalletConnected ? (
          <div className="wallet-info">
            <div className="connected-address">
              Connected: {address?.substring(0, 6)}...{address?.substring(address.length - 4)}
            </div>
            <button onClick={disconnectWallet} className="disconnect-button">
              Disconnect
            </button>
          </div>
        ) : (
          <button onClick={connectWallet} className="connect-button">
            Connect Wallet
          </button>
        )}
      </div>
      
      <main>
        <ChatList messages={messages} currentUser={user} />
      </main>
      
      <footer>
        <UserInput onSendMessage={sendMessage} />
      </footer>
    </div>
  );
}

export default App;