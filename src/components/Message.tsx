import React from 'react';
import { ChatMessage } from '../services/multisynq';

interface MessageProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const { text, sender, timestamp } = message;
  const formattedTime = new Date(timestamp).toLocaleTimeString();
  
  return (
    <div className={`message ${isCurrentUser ? 'user-message' : 'other-message'}`}>
      <div className="message-header">
        <img 
          className="avatar" 
          src={sender.avatar || `https://via.placeholder.com/32?text=${sender.username?.charAt(0)}`}
          alt={sender.username} 
        />
        <span className="username">{sender.username}</span>
        <span className="timestamp">{formattedTime}</span>
      </div>
      <div className="message-body">{text}</div>
    </div>
  );
};

export default Message;