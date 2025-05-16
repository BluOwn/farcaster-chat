import React from 'react';
import { ChatMessage } from '../services/multisynq';
import Message from './Message';

interface ChatListProps {
  messages: ChatMessage[];
  currentUser: { fid: number } | null;
}

const ChatList: React.FC<ChatListProps> = ({ messages, currentUser }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <div className="chat-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          No messages yet. Be the first to say something!
        </div>
      ) : (
        <>
          {messages.map(message => (
            <Message 
              key={message.id} 
              message={message} 
              isCurrentUser={currentUser?.fid === message.sender.fid} 
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default ChatList;