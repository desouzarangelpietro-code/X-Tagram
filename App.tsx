
import React, { useState, useCallback, useEffect, useRef } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import CreateAccountPage from './components/CreateAccountPage';
import { ADMIN_PROFILES, MOCK_POSTS, MOCK_CHAT_HISTORY } from './constants';
import type { AdminProfile, Post, ChatMessage, EventLogEntry, Notification } from './types';
import usePersistentState from './hooks/usePersistentState';

const LoadingScreen: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-cyan-400 tracking-wider font-orbitron animate-pulse">X-Tagram</h1>
            <p className="text-lg mt-2 text-gray-400">Inicializando sistema...</p>
        </div>
    </div>
)

type AuthView = 'login' | 'createAccount';

const App: React.FC = () => {
  const [loggedInAdmin, setLoggedInAdmin] = useState<AdminProfile | null>(null);
  const loggedInAdminRef = useRef(loggedInAdmin);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState<AuthView>('login');
  
  const [profiles, setProfiles] = usePersistentState<AdminProfile[]>('xtagram_profiles', ADMIN_PROFILES);
  const [posts, setPosts] = usePersistentState<Post[]>('xtagram_posts', MOCK_POSTS);
  const [chatHistory, setChatHistory] = usePersistentState<{ [key: string]: ChatMessage[] }>('xtagram_chats', MOCK_CHAT_HISTORY);
  const [eventLog, setEventLog] = usePersistentState<EventLogEntry[]>('event_log', []);
  const [notifications, setNotifications] = usePersistentState<Notification[]>('xtagram_notifications', []);

  useEffect(() => {
    loggedInAdminRef.current = loggedInAdmin;
  }, [loggedInAdmin]);

  useEffect(() => {
    // Simula a verificação de sessão
    const timer = setTimeout(() => setLoading(false), 1500);
    
    const handleGlobalClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const user = loggedInAdminRef.current?.userName || 'Sistema';

        let readableAction = `clicou em '${target.tagName.toLowerCase()}'`;
        const textContent = target.textContent?.trim().substring(0, 30);
        
        if (target.ariaLabel) {
            readableAction = `clicou em '${target.ariaLabel}'`;
        } else if (textContent) {
            readableAction = `clicou em '${target.tagName.toLowerCase()}: ${textContent}'`;
        // FIX: A propriedade 'placeholder' não existe no tipo genérico HTMLElement. Que surpresa, hein?
        // Para impedir que seu código desmorone, adicionei uma verificação para garantir que a propriedade existe antes de tentar usá-la. De nada.
        } else if ('placeholder' in target && (target as HTMLInputElement).placeholder) {
             readableAction = `clicou no campo '${(target as HTMLInputElement).placeholder}'`;
        } else if (target.title) {
            readableAction = `clicou em '${target.title}'`;
        }
        
        const newLogEntry: EventLogEntry = {
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            user: user,
            action: readableAction,
        };
        
        setEventLog(prevLog => [...prevLog, newLogEntry]);
    };
    
    document.addEventListener('click', handleGlobalClick, true);

    return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleGlobalClick, true);
    };
  }, [setEventLog]);

  const handleLogin = useCallback((username: string, password: string): boolean => {
    const admin = profiles.find(
      (p) => p.userName === username && p.password === password
    );
    if (admin) {
      setLoggedInAdmin(admin);
      return true;
    }
    return false;
  }, [profiles]);

  const handleCreateAccount = useCallback((username: string, email: string, password: string, avatar: string): string | null => {
    if (profiles.some(p => p.userName.toLowerCase() === username.toLowerCase())) {
      return 'Este nome de usuário já foi reivindicado por outra alma.';
    }
    const newAdmin: AdminProfile = {
      userName: username,
      contact: email,
      password: password,
      specialPower: 'Mero Mortal',
      avatar: avatar,
      isImmune: false,
    };
    setProfiles(prevProfiles => [...prevProfiles, newAdmin]);

    const newNotification: Notification = {
        id: `notif-${Date.now()}`,
        text: `Novo usuário '${username}' juntou-se ao sistema.`,
        timestamp: new Date().toLocaleString('pt-BR'),
        read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    return null; // Indica sucesso
  }, [setProfiles, profiles, setNotifications]);
  
  const handleToggleImmunity = useCallback((username: string) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(p =>
        p.userName.toLowerCase() === username.toLowerCase() ? { ...p, isImmune: !p.isImmune } : p
      )
    );
  }, [setProfiles]);

  const handleLogout = useCallback(() => {
    setLoggedInAdmin(null);
  }, []);
  
  const navigateToCreateAccount = () => setAuthView('createAccount');
  const navigateToLogin = () => setAuthView('login');

  if (loading) {
    return <LoadingScreen />;
  }

  if (!loggedInAdmin) {
    if (authView === 'createAccount') {
      return <CreateAccountPage onNavigateToLogin={navigateToLogin} onCreateAccount={handleCreateAccount} />;
    }
    return <LoginPage onLogin={handleLogin} onNavigateToCreateAccount={navigateToCreateAccount} />;
  }

  return (
    <Dashboard 
      admin={loggedInAdmin} 
      onLogout={handleLogout} 
      profiles={profiles} 
      onToggleImmunity={handleToggleImmunity}
      setProfiles={setProfiles}
      posts={posts}
      setPosts={setPosts}
      chatHistory={chatHistory}
      setChatHistory={setChatHistory}
      eventLog={eventLog}
      notifications={notifications}
      setNotifications={setNotifications}
    />
  );
};

export default App;