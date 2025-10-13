


import React, { useState } from 'react';
import type { AdminProfile, Post as PostType, ChatMessage, EventLogEntry, Notification } from '../types';
import { HomeIcon, ChatIcon, ShieldIcon, LogoutIcon, CodeIcon, BellIcon } from './icons';
import Feed from './Feed';
import AdminPanel from './AdminPanel';
import Chat from './Chat';
import HtmlEditor from './HtmlEditor';
import { INITIAL_SYSTEM_INSTRUCTION } from '../services/geminiService';
import NotificationsPage from './Notifications';

interface DashboardProps {
  admin: AdminProfile;
  onLogout: () => void;
  profiles: AdminProfile[];
  onToggleImmunity: (username: string) => void;
  setProfiles: React.Dispatch<React.SetStateAction<AdminProfile[]>>;
  posts: PostType[];
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
  chatHistory: { [key: string]: ChatMessage[] };
  setChatHistory: React.Dispatch<React.SetStateAction<{ [key: string]: ChatMessage[] }>>;
  eventLog: EventLogEntry[];
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

type NavItem = 'Feed' | 'Chat' | 'Notificações' | 'Painel Admin' | 'Editor HTML';

const Dashboard: React.FC<DashboardProps> = ({ admin, onLogout, profiles, onToggleImmunity, setProfiles, posts, setPosts, chatHistory, setChatHistory, eventLog, notifications, setNotifications }) => {
  const [activeView, setActiveView] = useState<NavItem>('Feed');
  const [systemInstruction, setSystemInstruction] = useState(INITIAL_SYSTEM_INSTRUCTION);
  const isAdmin = admin.specialPower !== 'Mero Mortal';
  const isLevel1Admin = admin.specialPower === 'Mestre dos Fantoches Nível 1' || admin.specialPower === 'GODNESS';
  const isLevel2Admin = admin.specialPower === 'Mestre dos Fantoches Nível 2';
  const canSeeNotifications = isLevel1Admin || isLevel2Admin;
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const renderView = () => {
    switch (activeView) {
      case 'Feed':
        return <Feed admin={admin} posts={posts} setPosts={setPosts} />;
      case 'Chat':
        return <Chat 
                  admin={admin} 
                  allProfiles={profiles} 
                  chatHistory={chatHistory} 
                  setChatHistory={setChatHistory} 
                />;
      case 'Notificações':
        if (canSeeNotifications) {
            return <NotificationsPage notifications={notifications} setNotifications={setNotifications} />;
        }
        return <Feed admin={admin} posts={posts} setPosts={setPosts} />;
      case 'Painel Admin':
        if (isAdmin) {
          return <AdminPanel 
            admin={admin} 
            profiles={profiles} 
            onToggleImmunity={onToggleImmunity} 
            setProfiles={setProfiles}
            posts={posts} 
            setPosts={setPosts}
            chatHistory={chatHistory} 
            setChatHistory={setChatHistory}
            systemInstruction={systemInstruction}
            setSystemInstruction={setSystemInstruction}
            eventLog={eventLog}
          />;
        }
        // Fallback for non-admins trying to access admin panel
        return <Feed admin={admin} posts={posts} setPosts={setPosts} />;
      case 'Editor HTML':
         if (isLevel1Admin) {
            return <HtmlEditor />;
         }
         // Fallback for non-Lvl1 trying to access editor
         return <Feed admin={admin} posts={posts} setPosts={setPosts} />;
      default:
        return <Feed admin={admin} posts={posts} setPosts={setPosts} />;
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-200 flex flex-col md:flex-row page-transition">
      {/* Sidebar Navigation (Desktop) */}
      <nav className="w-64 bg-gray-900/70 backdrop-blur-xl border-r border-gray-800 p-5 hidden md:flex flex-col justify-between">
        <div>
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-cyan-400 tracking-wider">X-Tagram</h1>
            </div>
            <div className="space-y-4">
                <button
                    onClick={() => setActiveView('Feed')}
                    className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                        activeView === 'Feed'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                    <HomeIcon className="w-6 h-6" />
                    <span className="font-medium">Feed</span>
                </button>
                <button
                    onClick={() => setActiveView('Chat')}
                    className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                        activeView === 'Chat'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                    <ChatIcon className="w-6 h-6" />
                    <span className="font-medium">Chat</span>
                </button>
                {canSeeNotifications && (
                   <button
                      onClick={() => setActiveView('Notificações')}
                      className={`relative flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                          activeView === 'Notificações'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                  >
                      <BellIcon className="w-6 h-6" />
                      <span className="font-medium">Notificações</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadNotificationsCount}
                        </span>
                      )}
                  </button>
                )}
                {isAdmin && (
                  <button
                      onClick={() => setActiveView('Painel Admin')}
                      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                          activeView === 'Painel Admin'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                  >
                      <ShieldIcon className="w-6 h-6" />
                      <span className="font-medium">Painel Admin</span>
                  </button>
                )}
                 {isLevel1Admin && (
                  <button
                      onClick={() => setActiveView('Editor HTML')}
                      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
                          activeView === 'Editor HTML'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                  >
                      <CodeIcon className="w-6 h-6" />
                      <span className="font-medium">Editor HTML</span>
                  </button>
                )}
            </div>
        </div>
        <div className="border-t border-gray-800 pt-5">
            <div className="flex items-center space-x-4 mb-5">
                <img src={admin.avatar} alt={admin.userName} className="w-12 h-12 rounded-full border-2 border-cyan-500" />
                <div>
                    <p className="font-bold text-white">{admin.userName}</p>
                    <p className="text-xs text-purple-400">{admin.specialPower}</p>
                </div>
            </div>
            <button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
            >
                <LogoutIcon className="w-6 h-6" />
                <span className="font-medium">Sair</span>
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-4">
        <div key={activeView} className="page-transition">
          {renderView()}
        </div>
      </main>

       {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-gray-800 p-1 flex justify-around">
        <button
          onClick={() => setActiveView('Feed')}
          className={`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 ${
            activeView === 'Feed' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
          }`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Feed</span>
        </button>
        <button
          onClick={() => setActiveView('Chat')}
          className={`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 ${
            activeView === 'Chat' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
          }`}
        >
          <ChatIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Chat</span>
        </button>
        {canSeeNotifications && (
            <button
                onClick={() => setActiveView('Notificações')}
                className={`relative flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 ${
                activeView === 'Notificações' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
                }`}
            >
                <BellIcon className="w-6 h-6" />
                <span className="text-xs font-medium">Alertas</span>
                {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1/4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadNotificationsCount}
                    </span>
                )}
            </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setActiveView('Painel Admin')}
            className={`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 ${
              activeView === 'Painel Admin' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
            }`}
          >
            <ShieldIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Admin</span>
          </button>
        )}
        {isLevel1Admin && (
          <button
            onClick={() => setActiveView('Editor HTML')}
            className={`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 ${
              activeView === 'Editor HTML' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
            }`}
          >
            <CodeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Editor</span>
          </button>
        )}
        <button onClick={onLogout} className="flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg text-gray-500 hover:text-red-400">
          <LogoutIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;