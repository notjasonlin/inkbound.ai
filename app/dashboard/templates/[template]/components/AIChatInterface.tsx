import React, { useState, useEffect } from 'react';

interface AIChatInterfaceProps {
  userCredits: number;
  onSendMessage: (message: string) => Promise<string>;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ userCredits, onSendMessage }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    setInputMessage('');

    const response = await onSendMessage(inputMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-80">
      <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
      <p className="text-sm mb-4">Credits remaining: {userCredits}</p>
      <div className="h-64 overflow-y-auto mb-4 border border-gray-200 p-2 rounded">
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded ${message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow border border-gray-300 rounded-l p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChatInterface;

