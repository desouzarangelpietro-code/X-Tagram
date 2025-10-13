

import React, { useState, useEffect } from 'react';
import type { AdminProfile, ChatMessage } from '../types';
import { SendIcon, ExpandIcon, MinimizeIcon, ArrowLeftIcon } from './icons';

interface ChatProps {
  admin: AdminProfile;
  allProfiles: AdminProfile[];
  chatHistory: { [key: string]: ChatMessage[] };
  setChatHistory: React.Dispatch<React.SetStateAction<{ [key: string]: ChatMessage[] }>>;
}

const Chat: React.FC<ChatProps> = ({ admin, allProfiles, chatHistory, setChatHistory }) => {
  const otherUsers = allProfiles.filter(p => p.userName !== admin.userName);
  const [selectedChat, setSelectedChat] = useState<AdminProfile | null>(otherUsers.length > 0 ? otherUsers[0] : null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedChat) {
      setMessages(chatHistory[selectedChat.userName] || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat, chatHistory]);
  
  useEffect(() => {
    let typingTimeout: ReturnType<typeof setTimeout>;
    if (selectedChat) {
      typingTimeout = setTimeout(() => setIsTyping(true), 2000);
      const anxietyTimeout = setTimeout(() => setIsTyping(false), 5000);
      
      return () => {
        clearTimeout(typingTimeout);
        clearTimeout(anxietyTimeout);
      }
    }
  }, [messages, selectedChat]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const msg: ChatMessage = { 
      id: `chat${Date.now()}`, 
      sender: admin.userName, 
      receiver: selectedChat.userName,
      text: newMessage, 
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setChatHistory(prev => {
        const newHistory = { ...prev };
        const targetChat = newHistory[selectedChat.userName] || [];
        newHistory[selectedChat.userName] = [...targetChat, msg];
        return newHistory;
    });
    setNewMessage('');
  };
  
  const filteredUsers = otherUsers.filter(user => 
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedChat) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center bg-gray-800/50 rounded-2xl">
        <p className="text-gray-400">Não há outros usuários no sistema para conversar.</p>
      </div>
    );
  }

  return (
    <div className={isFullScreen ? 'fixed inset-0 bg-gray-900 z-50 p-0 md:p-4 flex' : 'flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]'}>
      {/* Contacts List */}
      <div className={`w-full md:w-1/3 bg-gray-800/50 border-r border-gray-700 md:rounded-l-2xl flex-col ${mobileView === 'chat' && !isFullScreen ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-cyan-400">Contatos</h2>
           <div className="relative mt-4">
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-2 pl-4 pr-4 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.map(p => (
            <div
              key={p.userName}
              onClick={() => { setSelectedChat(p); setMobileView('chat'); }}
              className={`flex items-center space-x-4 p-4 cursor-pointer transition ${selectedChat.userName === p.userName ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
            >
              <img src={p.avatar} alt={p.userName} className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold text-white">{p.userName}</p>
                <p className="text-sm text-gray-400">{p.specialPower}</p>
              </div>
            </div>
          ))}
           {filteredUsers.length === 0 && (
             <p className="p-4 text-center text-gray-500">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
      
      {/* Chat Window */}
      <div className={`w-full md:w-2/3 bg-gray-800/70 md:rounded-r-2xl flex-col ${mobileView === 'list' && !isFullScreen ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
             <button onClick={() => setMobileView('list')} className="md:hidden p-2 -ml-2 mr-1 rounded-full hover:bg-gray-700/50 transition-colors">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <img src={selectedChat.avatar} alt={selectedChat.userName} className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{selectedChat.userName}</h3>
              <p className="text-xs text-purple-400 truncate">Criptografia suficientemente forte, talvez.</p>
            </div>
          </div>
          <button onClick={() => setIsFullScreen(!isFullScreen)} className="p-2 rounded-full hover:bg-gray-600 transition-colors flex-shrink-0">
             {isFullScreen ? <MinimizeIcon className="w-6 h-6 text-gray-400"/> : <ExpandIcon className="w-6 h-6 text-gray-400"/>}
          </button>
        </div>
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === admin.userName ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === admin.userName ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <p className="break-words">{msg.text}</p>
                <p className="text-xs opacity-60 text-right mt-1">{msg.timestamp}</p>
              </div>
            </div>
          ))}
           {isTyping && <div className="text-sm text-gray-400 italic">...{selectedChat.userName} está digitando</div>}
        </div>
        <div className="p-4 border-t border-gray-700">
          <div className="relative">
            <input 
              type="text"
              placeholder="Gerar ansiedade máxima..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="w-full bg-gray-900/50 border border-gray-600 rounded-full py-3 pl-5 pr-14 text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button onClick={handleSendMessage} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 transition">
              <SendIcon className="w-5 h-5 text-white"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
