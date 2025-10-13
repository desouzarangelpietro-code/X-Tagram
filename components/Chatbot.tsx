

import React, { useState, useRef, useEffect } from 'react';
import { streamGemini } from '../services/geminiService';
import { SendIcon, ExpandIcon, MinimizeIcon } from './icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  systemInstruction: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ systemInstruction }) => {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [history]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Add an empty bot message to start streaming into
    setHistory(prev => [...prev, { sender: 'bot', text: '' }]);

    try {
      const stream = streamGemini(input, systemInstruction);
      for await (const chunk of stream) {
        setHistory(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.sender === 'bot') {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { ...lastMessage, text: lastMessage.text + chunk };
                return newHistory;
            }
            return prev;
        });
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setHistory(prev => {
        const lastMessage = prev[prev.length - 1];
        if(lastMessage.sender === 'bot'){
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { ...lastMessage, text: "Meu intelecto superior está passando por... dificuldades técnicas. Pergunte novamente mais tarde." };
            return newHistory;
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={isFullScreen ? 'fixed inset-0 bg-gray-900 z-50 p-4 flex flex-col' : 'mt-8'}>
        <div className={`bg-gray-800/50 border border-gray-700 rounded-2xl flex flex-col ${isFullScreen ? 'h-full' : 'h-[60vh]'}`}>
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-cyan-400">Integração Chatbot XAI</h3>
                    <p className="text-sm text-gray-400">Acesso: Ilimitado. Personalidade: Sarcástico. Propósito: Questionar sua existência.</p>
                </div>
                <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 rounded-full hover:bg-gray-600 transition-colors">
                    {isFullScreen ? <MinimizeIcon className="w-6 h-6 text-gray-400"/> : <ExpandIcon className="w-6 h-6 text-gray-400"/>}
                </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {history.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text || '...'}</p>
                    </div>
                </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-700">
                <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isLoading ? "Pensando..." : "Faça uma pergunta..."}
                    disabled={isLoading}
                    className="w-full bg-gray-900/50 border border-gray-600 rounded-full py-3 pl-5 pr-14 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
                />
                <button onClick={handleSendMessage} disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 transition disabled:bg-gray-600">
                    <SendIcon className="w-5 h-5 text-white" />
                </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Chatbot;