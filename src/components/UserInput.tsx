import React, { useState } from 'react';

interface UserInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const UserInput: React.FC<UserInputProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };
  
  return (
    <form className="user-input" onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        placeholder="Type your message..." 
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
};

export default UserInput;