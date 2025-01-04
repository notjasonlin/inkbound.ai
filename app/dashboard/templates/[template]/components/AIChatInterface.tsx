import React, { useState } from 'react';

interface AIChatInterfaceProps {
  userCredits: number;
  onSendMessage: (message: string) => Promise<string>;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({ userCredits, onSendMessage }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: inputMessage }]);
    const userText = inputMessage;
    setInputMessage('');

    // Get AI response
    const response = await onSendMessage(userText);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-4 border border-gray-200">
      <div className="flex flex-col space-y-1">
        <h3 className="text-2xl font-bold text-gray-900">AI Assistant</h3>
        <p className="text-sm text-gray-500">Credits remaining: {userCredits}</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';
            return (
              <div
                key={index}
                className={`flex ${
                  isUser ? 'justify-end' : 'justify-start'
                } w-full transition-all`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg text-sm whitespace-pre-wrap break-words ${
                    isUser
                      ? 'bg-blue-600 text-white font-medium self-end'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIChatInterface;
