import { useState, useEffect, useCallback } from 'react';
import { useFarcasterAuth } from '../services/auth';
import { initMultiSynq, ChatMessage, ChatUser } from '../services/multisynq';
import { setupMonadContract } from '../services/blockchain';
import { sdk } from '@farcaster/frame-sdk';

// Use environment variables for sensitive data
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0x26a849DEeF67C78595AB0E57Ea4b6C64AF68F253";
const MULTISYNQ_API_KEY = import.meta.env.VITE_MULTISYNQ_API_KEY || "2w1BbLTcjkLhBXTldf0VbY2wULOfqfEGkHmDobVedv";

export function useMonadChat() {
  const { user, isLoading: isAuthLoading, error: authError, signIn } = useFarcasterAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<Record<number, ChatUser>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [synqClient, setSynqClient] = useState<any>(null);
  const [monadClient, setMonadClient] = useState<any>(null);
  
  // Initialize chat
  useEffect(() => {
    async function initializeChat() {
      try {
        if (isAuthLoading || !user) return;
        
        setIsLoading(true);
        
        // Setup Monad contract
        const monad = await setupMonadContract(CONTRACT_ADDRESS);
        setMonadClient(monad);
        
        // Load historical messages
        const historicalMessages = await monad.getMessages(50, 0);
        setMessages(historicalMessages);
        
        // Initialize MultiSynq
        const synq = await initMultiSynq("monad-chat-room", {
          apiKey: MULTISYNQ_API_KEY,
          onMessageReceived: (message) => {
            setMessages((prev: ChatMessage[]) => [...prev, message]);
          },
          onUsersUpdated: (updatedUsers) => {
            setUsers(updatedUsers);
          }
        });
        
        setSynqClient(synq);
        
        // Connect user
        if (user) {
          synq.connectUser({
            fid: user.fid,
            username: user.username || `user_${user.fid}`,
            avatar: user.pfp
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }
    
    initializeChat();
    
    // Cleanup
    return () => {
      if (synqClient) {
        synqClient.leave();
      }
    };
  }, [user, isAuthLoading]);
  
  // Send message
  const sendMessage = useCallback(async (text: string) => {
    if (!user || !synqClient || !text.trim()) return;
    
    try {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text,
        sender: {
          fid: user.fid,
          username: user.username || `user_${user.fid}`,
          avatar: user.pfp
        },
        timestamp: Date.now()
      };
      
      // Send via MultiSynq
      synqClient.sendMessage(message);
      
      // Store on blockchain
      if (monadClient) {
        try {
          await monadClient.storeMessage(message);
        } catch (error) {
          console.error("Failed to store message on blockchain:", error);
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [user, synqClient, monadClient]);
  
  // Share app
  const shareApp = useCallback(async () => {
    try {
      const url = window.location.href;
      await sdk.actions.composeCast({
        text: "I'm chatting on Monad Chat - a decentralized chat app built with MultiSynq and Monad blockchain!",
        embeds: [url]
      });
    } catch (error) {
      console.error("Failed to share app:", error);
    }
  }, []);
  
  // Add app to Farcaster
  const addApp = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      console.error("Failed to add app:", error);
    }
  }, []);
  
  return {
    user,
    messages,
    users,
    isLoading: isLoading || isAuthLoading,
    error: error || authError,
    sendMessage,
    signIn,
    shareApp,
    addApp
  };
}