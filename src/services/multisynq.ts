import { Session, Model } from '@croquet/croquet';

// Types
export interface ChatMessage {
  id: string;
  text: string;
  sender: {
    fid: number;
    username: string;
    avatar?: string;
  };
  timestamp: number;
  signature?: string;
}

export interface ChatUser {
  fid: number;
  username: string;
  avatar?: string;
  lastSeen: number;
}

export interface MultiSynqOptions {
  apiKey: string;
  onMessageReceived?: (message: ChatMessage) => void;
  onUsersUpdated?: (users: Record<number, ChatUser>) => void;
}

// MultiSynq model
class ChatModel extends Model {
  messages: ChatMessage[] = [];
  users: Record<number, ChatUser> = {};
  
  init() {
    // Initialize model
    this.messages = [];
    this.users = {};
    
    // Subscribe to events
    this.subscribe("user", "joined", this.userJoined);
    this.subscribe("user", "left", this.userLeft);
    this.subscribe("chat", "message", this.receiveMessage);
  }

  userJoined(userData: Omit<ChatUser, 'lastSeen'>) {
    this.users[userData.fid] = { 
      ...userData, 
      lastSeen: this.now() 
    };
    this.publish("users", "updated", this.users);
  }

  userLeft(fid: number) {
    if (this.users[fid]) {
      delete this.users[fid];
      this.publish("users", "updated", this.users);
    }
  }

  receiveMessage(data: ChatMessage) {
    this.messages.push(data);
    this.publish("chat", "newMessage", data);
    // Store message on blockchain
    this.publish("blockchain", "storeMessage", data);
  }

  static get modelServices() {
    return {
      ChatModel: ChatModel
    };
  }
}

// Initialize MultiSynq
export async function initMultiSynq(roomName: string, options: MultiSynqOptions) {
  const { apiKey, onMessageReceived, onUsersUpdated } = options;
  
  // Create a session
  const session = await Session.join({
    apiKey,
    appId: "io.multisynq.farcaster-monad-chat",
    name: roomName,
    model: ChatModel,
    autoSleep: false,
    options: {
      tps: 2,
    }
  });
  
  // Set up event listeners
  if (onMessageReceived) {
    session.view.subscribe("chat", "newMessage", onMessageReceived);
  }
  
  if (onUsersUpdated) {
    session.view.subscribe("users", "updated", onUsersUpdated);
  }
  
  return {
    session,
    
    // Send a message
    sendMessage: (message: ChatMessage) => {
      session.view.publish("chat", "message", message);
    },
    
    // Connect user
    connectUser: (userData: Omit<ChatUser, 'lastSeen'>) => {
      session.view.publish("user", "joined", userData);
    },
    
    // Disconnect user
    disconnectUser: (fid: number) => {
      session.view.publish("user", "left", fid);
    },
    
    // Close connection
    leave: () => {
      session.leave();
    }
  };
}