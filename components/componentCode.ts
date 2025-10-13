// Este arquivo armena o código-fonte dos componentes como strings para exibição no CodeViewer.

const AppCode = `import React, { useState, useCallback, useEffect, useRef } from 'react';
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

        let readableAction = \\\`clicou em '\\\${target.tagName.toLowerCase()}'\\\`;
        const textContent = target.textContent?.trim().substring(0, 30);
        
        if (target.ariaLabel) {
            readableAction = \\\`clicou em '\\\${target.ariaLabel}'\\\`;
        } else if (textContent) {
            readableAction = \\\`clicou em '\\\${target.tagName.toLowerCase()}: \\\${textContent}'\\\`;
        // FIX: A propriedade 'placeholder' não existe no tipo genérico HTMLElement. Que surpresa, hein?
        // Para impedir que seu código desmorone, adicionei uma verificação para garantir que a propriedade existe antes de tentar usá-la. De nada.
        } else if ('placeholder' in target && (target as HTMLInputElement).placeholder) {
             readableAction = \\\`clicou no campo '\\\${(target as HTMLInputElement).placeholder}'\\\`;
        } else if (target.title) {
            readableAction = \\\`clicou em '\\\${target.title}'\\\`;
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
        id: \\\`notif-\\\${Date.now()}\\\`,
        text: \\\`Novo usuário '\\\${username}' juntou-se ao sistema.\\\`,
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
`;

const LoginPageCode = `import React, { useState } from 'react';
import { UserIcon, KeyIcon } from './icons';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
  onNavigateToCreateAccount: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(username, password)) {
      setError('Credenciais incorretas. Ou talvez você não seja digno.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 page-transition">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-6xl font-bold text-cyan-400 tracking-wider font-orbitron animate-pulse">X-Tagram</h1>
            <p className="text-lg mt-2 text-gray-400">Entre, se for capaz.</p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="glassmorphism neon-border rounded-2xl p-8 space-y-6 shadow-2xl shadow-black/30"
        >
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300 focus:shadow-lg focus:shadow-cyan-500/20"
              required
            />
          </div>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300 focus:shadow-lg focus:shadow-cyan-500/20"
              required
            />
          </div>
          
          <div className="text-xs text-center text-gray-500">
              Ao acessar, você concorda em vender sua alma (e seus dados) conforme os <a href="#" className="text-purple-400 hover:underline">termos e condições</a> de 98 páginas em aramaico.
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            Acessar Domínio
          </button>
        </form>
        <p className="text-center text-sm text-gray-400 mt-6">
            Ainda não vendeu sua alma?{' '}
            <button onClick={onNavigateToCreateAccount} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Crie uma conta aqui.
            </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
`;

const CreateAccountPageCode = `import React, { useState } from 'react';
import { UserIcon, KeyIcon, EmailIcon } from './icons';
import { generateAvatarFromUsername } from '../services/geminiService';

interface CreateAccountPageProps {
  onNavigateToLogin: () => void;
  onCreateAccount: (username: string, email: string, password: string, avatar: string) => string | null;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const CreateAccountPage: React.FC<CreateAccountPageProps> = ({ onNavigateToLogin, onCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string>('');
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

  const handleGenerateAvatar = async () => {
    if (!username.trim() || isGeneratingAvatar) return;
    setIsGeneratingAvatar(true);
    setError('');
    // Clear uploaded image if generating a new one
    setUploadedImageFile(null);
    if(uploadedImagePreview) URL.revokeObjectURL(uploadedImagePreview);
    setUploadedImagePreview('');
    
    try {
      const generatedAvatar = await generateAvatarFromUsername(username);
      if (generatedAvatar) {
        setAvatar(generatedAvatar);
      } else {
        setError('A IA se recusou a criar seu avatar. Tente um nome de usuário mais inspirador.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro cósmico ao gerar seu avatar.');
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImageFile(file);
      
      if (uploadedImagePreview) {
        URL.revokeObjectURL(uploadedImagePreview);
      }
      setUploadedImagePreview(URL.createObjectURL(file));
      // Clear AI avatar if a file is uploaded
      setAvatar('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('As senhas não coincidem. Um erro tão trivial.');
      return;
    }

    let finalAvatar = '';
    if (uploadedImageFile) {
        finalAvatar = await fileToBase64(uploadedImageFile);
    } else {
        finalAvatar = avatar || \\\`https://picsum.photos/seed/\\\${username}/100/100\\\`;
    }
    
    const result = onCreateAccount(username, email, password, finalAvatar);

    if (result) {
      setError(result);
    } else {
      alert('Parabéns, sua alma foi registrada com sucesso. Agora pode tentar entrar no domínio dos deuses.');
      onNavigateToLogin();
    }
  };
  
  const currentAvatar = uploadedImagePreview || avatar;

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-4 page-transition">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-cyan-400 tracking-wider font-orbitron animate-pulse">X-Tagram</h1>
            <p className="text-lg mt-2 text-gray-400">Venda-nos a sua alma (e seus dados).</p>
        </div>
        
        <form 
          onSubmit={handleSubmit}
          className="glassmorphism neon-border rounded-2xl p-8 space-y-6 shadow-2xl shadow-black/30"
        >
          <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nome de usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
                required
              />
            </div>
            
            <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleGenerateAvatar}
                  disabled={!username.trim() || isGeneratingAvatar}
                  className="flex-1 py-3 px-4 bg-purple-600 text-white font-semibold rounded-lg text-sm transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-wait"
                >
                  {isGeneratingAvatar ? 'Criando...' : 'Gerar com IA'}
                </button>
                 <label htmlFor="avatar-upload" className="flex-1 text-center py-3 px-4 bg-cyan-600 text-white font-semibold rounded-lg text-sm transition-all transform hover:scale-105 cursor-pointer">
                    Carregar Imagem
                 </label>
                 <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            {isGeneratingAvatar && <p className="text-cyan-400 text-sm text-center animate-pulse">A IA está consultando o cosmos para forjar seu avatar...</p>}

            {currentAvatar && (
                <div className="flex justify-center">
                  <img src={currentAvatar} alt="Avatar Preview" className="w-24 h-24 rounded-full border-2 border-cyan-400 neon-glow object-cover" />
                </div>
            )}
            
          <div className="relative">
            <EmailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              placeholder="Email ou Sinal de Fumaça"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
              required
            />
          </div>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
              required
            />
          </div>
           <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Confirme a Senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow duration-300"
              required
            />
          </div>
          
          <div className="text-xs text-center text-gray-500">
             Ao finalizar o pacto, você concorda plenamente com os <a href="#" className="text-purple-400 hover:underline">termos e condições</a>. Sim, todos eles.
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
          >
            Finalizar Pacto
          </button>
        </form>
         <p className="text-center text-sm text-gray-400 mt-6">
            Já possui um pacto?{' '}
            <button onClick={onNavigateToLogin} className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                Entre por aqui.
            </button>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;
`;

const DashboardCode = `import React, { useState } from 'react';
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
                    className={\\\`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 \\\${
                        activeView === 'Feed'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }\\\`}
                >
                    <HomeIcon className="w-6 h-6" />
                    <span className="font-medium">Feed</span>
                </button>
                <button
                    onClick={() => setActiveView('Chat')}
                    className={\\\`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 \\\${
                        activeView === 'Chat'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }\\\`}
                >
                    <ChatIcon className="w-6 h-6" />
                    <span className="font-medium">Chat</span>
                </button>
                {canSeeNotifications && (
                   <button
                      onClick={() => setActiveView('Notificações')}
                      className={\\\`relative flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 \\\${
                          activeView === 'Notificações'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }\\\`}
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
                      className={\\\`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 \\\${
                          activeView === 'Painel Admin'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }\\\`}
                  >
                      <ShieldIcon className="w-6 h-6" />
                      <span className="font-medium">Painel Admin</span>
                  </button>
                )}
                 {isLevel1Admin && (
                  <button
                      onClick={() => setActiveView('Editor HTML')}
                      className={\\\`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 \\\${
                          activeView === 'Editor HTML'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }\\\`}
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
          className={\\\`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 \\\${
            activeView === 'Feed' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
          }\\\`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Feed</span>
        </button>
        <button
          onClick={() => setActiveView('Chat')}
          className={\\\`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 \\\${
            activeView === 'Chat' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
          }\\\`}
        >
          <ChatIcon className="w-6 h-6" />
          <span className="text-xs font-medium">Chat</span>
        </button>
        {canSeeNotifications && (
            <button
                onClick={() => setActiveView('Notificações')}
                className={\\\`relative flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 \\\${
                activeView === 'Notificações' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
                }\\\`}
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
            className={\\\`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 \\\${
              activeView === 'Painel Admin' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
            }\\\`}
          >
            <ShieldIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Admin</span>
          </button>
        )}
        {isLevel1Admin && (
          <button
            onClick={() => setActiveView('Editor HTML')}
            className={\\\`flex flex-col items-center justify-center space-y-1 w-full p-2 rounded-lg transition-colors duration-200 \\\${
              activeView === 'Editor HTML' ? 'text-cyan-400' : 'text-gray-500 hover:text-cyan-400'
            }\\\`}
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
`;

const FeedCode = `import React from 'react';
import type { AdminProfile, Post as PostType } from '../types';
import Post from './Post';
import CreatePost from './CreatePost';
import { generateImageFromPrompt } from '../services/geminiService';

interface FeedProps {
  admin: AdminProfile;
  posts: PostType[];
  setPosts: React.Dispatch<React.SetStateAction<PostType[]>>;
}

const Feed: React.FC<FeedProps> = ({ admin, posts, setPosts }) => {

  const handleCreatePost = async (caption: string, file: File | null) => {
    let mediaUrl = '';
    let mediaType: PostType['mediaType'] = 'none';

    if (file) {
      mediaUrl = URL.createObjectURL(file);
      mediaType = file.type.startsWith('video/') ? 'video' : 'image';
    } else if (caption) {
      const generatedImageUrl = await generateImageFromPrompt(caption);
      if (generatedImageUrl) {
        mediaUrl = generatedImageUrl;
        mediaType = 'image';
      }
    }
    
    const newPost: PostType = {
      id: \\\`post\\\${Date.now()}\\\`,
      author: admin.userName,
      authorAvatar: admin.avatar,
      caption,
      mediaUrl,
      mediaType,
      likes: 0,
      comments: [],
      timestamp: 'Agora mesmo',
    };
    setPosts(currentPosts => [newPost, ...currentPosts]);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Feed Universal</h1>
      <CreatePost admin={admin} onCreatePost={handleCreatePost} />
      <div className="space-y-8 mt-8">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Feed;
`;

const CreatePostCode = `import React, { useState, useRef } from 'react';
import type { AdminProfile } from '../types';

interface CreatePostProps {
  admin: AdminProfile;
  onCreatePost: (caption: string, file: File | null) => Promise<void>;
}

const CreatePost: React.FC<CreatePostProps> = ({ admin, onCreatePost }) => {
  const [caption, setCaption] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setMediaPreview({ url, type });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!caption && !mediaFile) || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
        await onCreatePost(caption || 'Insira aqui uma legenda filosófica que ninguém vai ler', mediaFile);
        setCaption('');
        setMediaFile(null);
        setMediaPreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    } catch (error) {
        console.error("Falha ao criar post:", error);
        alert("Não foi possível criar o post. A IA pode estar tirando uma soneca.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
      <div className="flex items-start space-x-4">
        <img src={admin.avatar} alt={admin.userName} className="w-12 h-12 rounded-full" />
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Insira aqui uma legenda filosófica que ninguém vai ler..."
          className="w-full bg-gray-900/50 border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[80px] resize-none disabled:opacity-50"
          disabled={isSubmitting}
        />
      </div>
      {mediaPreview && (
        <div className="mt-4 flex justify-center">
          {mediaPreview.type === 'image' ? (
            <img src={mediaPreview.url} alt="Pré-visualização" className="max-h-60 w-auto rounded-lg" />
          ) : (
            <video src={mediaPreview.url} controls className="max-h-60 w-auto rounded-lg" />
          )}
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <div>
          <input 
            type="file" 
            accept="image/*,video/*" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload" 
            disabled={isSubmitting}
          />
          <label htmlFor="file-upload" className={\\\`cursor-pointer text-gray-400 transition \\\${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:text-cyan-400'}\\\`}>
            Anexar Holograma
          </label>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!caption && !mediaFile)}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait disabled:scale-100"
        >
          {isSubmitting ? (!mediaFile ? 'Gerando Holograma...' : 'Publicando...') : 'Postar'}
        </button>
      </div>
    </div>
  );
};

export default CreatePost;
`;

const PostCode = `import React, { useState } from 'react';
import type { Post as PostType } from '../types';
import { HeartIcon, CommentIcon } from './icons';

interface PostProps {
  post: PostType;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [liked, setLiked] = useState(false);
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden shadow-lg shadow-black/20">
      <div className="p-5 flex items-center space-x-4">
        <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full" />
        <div>
          <p className="font-bold text-white">{post.author}</p>
          <p className="text-xs text-gray-400">{post.timestamp}</p>
        </div>
      </div>
      
      <p className="px-5 pb-4 text-gray-300">{post.caption}</p>

      {post.mediaType === 'image' && post.mediaUrl && (
        <img src={post.mediaUrl} alt="Conteúdo do post" className="w-full object-cover" />
      )}
      {post.mediaType === 'video' && post.mediaUrl && (
        <video src={post.mediaUrl} controls className="w-full bg-black">
            Seu navegador não suporta a tag de vídeo.
        </video>
      )}
      
      <div className="p-5">
        <div className="flex items-center space-x-6 text-gray-400">
          <button onClick={() => setLiked(!liked)} className={\\\`flex items-center space-x-2 transition hover:text-red-500 \\\${liked ? 'text-red-500' : ''}\\\`}>
            <HeartIcon className="w-6 h-6" />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button className="flex items-center space-x-2 transition hover:text-cyan-400">
            <CommentIcon className="w-6 h-6" />
            <span>{post.comments.length}</span>
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 p-5 space-y-4">
        {post.comments.map(comment => (
          <div key={comment.id} className="flex items-start space-x-3">
            <img src={comment.authorAvatar} alt={comment.author} className="w-8 h-8 rounded-full" />
            <div className="bg-gray-700/50 rounded-lg p-2 px-3 text-sm">
              <p className="font-bold text-white">{comment.author}</p>
              <p className="text-gray-300">{comment.text}</p>
            </div>
          </div>
        ))}
         <div className="flex items-center space-x-3 pt-2">
            <img src={post.authorAvatar} alt="usuário atual" className="w-8 h-8 rounded-full"/>
            <input
                type="text"
                placeholder="Adicione um comentário..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-full py-2 px-4 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
        </div>
      </div>
    </div>
  );
};

export default Post;
`;

const ChatCode = `import React, { useState, useEffect } from 'react';
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
      id: \\\`chat\\\${Date.now()}\\\`, 
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
      <div className={\\\`w-full md:w-1/3 bg-gray-800/50 border-r border-gray-700 md:rounded-l-2xl flex-col \\\${mobileView === 'chat' && !isFullScreen ? 'hidden md:flex' : 'flex'}\\\`}>
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
              className={\\\`flex items-center space-x-4 p-4 cursor-pointer transition \\\${selectedChat.userName === p.userName ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}\\\`}
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
      <div className={\\\`w-full md:w-2/3 bg-gray-800/70 md:rounded-r-2xl flex-col \\\${mobileView === 'list' && !isFullScreen ? 'hidden md:flex' : 'flex'}\\\`}>
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
            <div key={msg.id} className={\\\`flex \\\${msg.sender === admin.userName ? 'justify-end' : 'justify-start'}\\\`}>
              <div className={\\\`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl \\\${msg.sender === admin.userName ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}\\\`}>
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
`;

const AdminPanelCode = `import React, { useState, useEffect } from 'react';
import type { AdminProfile, Post, ChatMessage, EventLogEntry } from '../types';
import Chatbot from './Chatbot';
import { ADMIN_PROFILES, MOCK_POSTS, MOCK_CHAT_HISTORY } from '../constants';
import CodeViewer from './CodeViewer';

interface AdminPanelProps {
  admin: AdminProfile;
  profiles: AdminProfile[];
  onToggleImmunity: (username: string) => void;
  setProfiles: React.Dispatch<React.SetStateAction<AdminProfile[]>>;
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  chatHistory: { [key: string]: ChatMessage[] };
  setChatHistory: React.Dispatch<React.SetStateAction<{ [key: string]: ChatMessage[] }>>;
  systemInstruction: string;
  setSystemInstruction: React.Dispatch<React.SetStateAction<string>>;
  eventLog: EventLogEntry[];
}

const AdminFunctionCard: React.FC<{ title: string; description: string; command: string; children: React.ReactNode }> = ({ title, description, command, children }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 transform transition-all hover:scale-105 hover:border-purple-500/50 duration-300 flex flex-col">
    <h3 className="text-xl font-bold text-purple-400">{title}</h3>
    <p className="text-gray-400 mt-1 text-sm flex-grow">{description}</p>
    <p className="text-xs text-gray-500 mt-2 font-mono bg-gray-900/50 p-1 rounded">Formato do Comando: {command}</p>
    <div className="mt-4">{children}</div>
  </div>
);

const DatabaseViewer: React.FC<{
  profiles: AdminProfile[];
  posts: Post[];
  chatHistory: { [key: string]: ChatMessage[] };
  setProfiles: React.Dispatch<React.SetStateAction<AdminProfile[]>>;
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
  setChatHistory: React.Dispatch<React.SetStateAction<{ [key: string]: ChatMessage[] }>>;
}> = ({ profiles, posts, chatHistory, setProfiles, setPosts, setChatHistory }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [profilesJson, setProfilesJson] = useState(() => JSON.stringify(profiles, null, 2));
    const [postsJson, setPostsJson] = useState(() => JSON.stringify(posts, null, 2));
    const [chatsJson, setChatsJson] = useState(() => JSON.stringify(chatHistory, null, 2));

    useEffect(() => {
        if (!isEditing) {
            setProfilesJson(JSON.stringify(profiles, null, 2));
            setPostsJson(JSON.stringify(posts, null, 2));
            setChatsJson(JSON.stringify(chatHistory, null, 2));
        }
    }, [profiles, posts, chatHistory, isEditing]);

    const handleSave = () => {
        try {
            const parsedProfiles = JSON.parse(profilesJson);
            const parsedPosts = JSON.parse(postsJson);
            const parsedChats = JSON.parse(chatsJson);
            
            setProfiles(parsedProfiles);
            setPosts(parsedPosts);
            setChatHistory(parsedChats);
            
            setIsEditing(false);
            alert("Sucesso: O banco de dados foi reescrito à sua imagem.");
        } catch (e) {
            alert("Erro: Sintaxe JSON inválida. A realidade resiste à sua vontade. Verifique os dados e tente novamente.");
            console.error("JSON Parsing Error:", e);
        }
    };
    
    const handleCancel = () => {
        setProfilesJson(JSON.stringify(profiles, null, 2));
        setPostsJson(JSON.stringify(posts, null, 2));
        setChatsJson(JSON.stringify(chatHistory, null, 2));
        setIsEditing(false);
    };

    const commonTextAreaClass = "w-full h-64 bg-gray-900 text-xs text-gray-300 whitespace-pre break-all mt-2 font-mono p-2 border border-green-500 rounded focus:outline-none focus:ring-2 focus:ring-green-400";
    const commonPreClass = "text-xs text-gray-300 whitespace-pre-wrap break-all mt-2";
    
    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-cyan-400">Editor de Banco de Dados Bruto</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-yellow-600/80 hover:bg-yellow-500/80 text-white font-bold py-2 px-4 rounded-md transition">Habilitar Edição</button>
                ) : (
                    <div className="space-x-4">
                        <button onClick={handleSave} className="bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-2 px-4 rounded-md transition">Salvar Alterações</button>
                        <button onClick={handleCancel} className="bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-2 px-4 rounded-md transition">Cancelar</button>
                    </div>
                )}
            </div>
            {isEditing && <p className="text-yellow-400 text-sm mb-4">Atenção: Você está em modo de edição. Alterações incorretas podem desestabilizar o sistema.</p>}
            <div className="bg-black border border-purple-500/50 rounded-lg p-4 max-h-[70vh] overflow-auto font-mono">
                <div>
                    <h3 className="text-lg text-green-400"># Tabela: PROFILES</h3>
                    {isEditing ? <textarea value={profilesJson} onChange={(e) => setProfilesJson(e.target.value)} className={commonTextAreaClass} /> : <pre className={commonPreClass}>{profilesJson}</pre>}
                </div>
                <div className="mt-6">
                    <h3 className="text-lg text-green-400"># Tabela: POSTS</h3>
                    {isEditing ? <textarea value={postsJson} onChange={(e) => setPostsJson(e.target.value)} className={commonTextAreaClass} /> : <pre className={commonPreClass}>{postsJson}</pre>}
                </div>
                <div className="mt-6">
                    <h3 className="text-lg text-green-400"># Tabela: CHATS</h3>
                    {isEditing ? <textarea value={chatsJson} onChange={(e) => setChatsJson(e.target.value)} className={commonTextAreaClass} /> : <pre className={commonPreClass}>{chatsJson}</pre>}
                </div>
            </div>
        </div>
    );
};

const EventLogViewer: React.FC<{ eventLog: EventLogEntry[] }> = ({ eventLog }) => (
    <div className="mt-8">
        <h2 className="text-2xl font-bold text-cyan-400">Caixa Preta (Registro de Eventos)</h2>
        <div className="bg-black border border-purple-500/50 rounded-lg p-4 mt-4 max-h-[70vh] overflow-auto font-mono text-xs">
            <table className="w-full text-left">
                <thead>
                    <tr className="border-b border-gray-700">
                        <th className="p-2 text-green-400 w-1/6">Timestamp</th>
                        <th className="p-2 text-green-400 w-1/6">Usuário</th>
                        <th className="p-2 text-green-400">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {eventLog.slice().reverse().map((entry, index) => (
                        <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                            <td className="p-2 text-gray-500">{entry.timestamp}</td>
                            <td className="p-2 text-purple-400">{entry.user}</td>
                            <td className="p-2 text-gray-300">{entry.action}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const AdminPanel: React.FC<AdminPanelProps> = ({ admin, profiles, onToggleImmunity, setProfiles, posts, setPosts, chatHistory, setChatHistory, systemInstruction, setSystemInstruction, eventLog }) => {
  const [targetUser, setTargetUser] = useState('');
  const [immunityTarget, setImmunityTarget] = useState('');
  const [showDatabase, setShowDatabase] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [localSystemInstruction, setLocalSystemInstruction] = useState(systemInstruction);
  
  const isLevel1Admin = admin.specialPower === 'Mestre dos Fantoches Nível 1' || admin.specialPower === 'GODNESS';
  const adminUsernames = ['pietroadmin', 'henriqueadmin2', 'loloadmin3'];

  useEffect(() => {
    setLocalSystemInstruction(systemInstruction);
  }, [systemInstruction]);

  const handleApplySystemInstruction = () => {
    setSystemInstruction(localSystemInstruction);
    alert("A personalidade da IA foi reescrita em tempo real. A nova diretriz está ativa.");
  };

  const deleteDescription = isLevel1Admin
    ? "Sem restrições. O poder é todo seu para apagar qualquer um do sistema."
    : "Restrição: Não funciona nos outros dois amiguinhos do parquinho, nem em usuários com Imunidade Divina.";

  const impersonateDescription = isLevel1Admin
    ? "Para criar posts em nome de qualquer um, inclusive deuses, e gerar o caos social."
    : "Para criar posts em nome de meros mortais. Tentar com outros admins ou protegidos é má etiqueta.";
    
  const dataRequestDescription = isLevel1Admin
    ? "Envia um e-mail com os dados de QUALQUER usuário. A privacidade é uma ilusão."
    : "Envia um e-mail com os dados de meros mortais. A privacidade dos admins e seus protegidos é... uma cortesia mútua.";

  const checkPermissions = (targetUsername: string): boolean => {
    if (isLevel1Admin) return true;

    if (adminUsernames.includes(targetUsername) && targetUsername !== admin.userName) {
      alert(\\\`Ação bloqueada. Você não pode usar seus poderes em outros administradores.\\\`);
      return false;
    }

    const targetProfile = profiles.find(p => p.userName.toLowerCase() === targetUsername.toLowerCase());
    if (targetProfile?.isImmune) {
      alert(\\\`Ação bloqueada. \\\${targetUsername} possui Imunidade Divina e não pode ser alvo dos seus poderes.\\\`);
      return false;
    }

    return true;
  };

  const handleDelete = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;
    const command = \\\`//create@\\\${targetUser}.1234567890\\\`;
    alert(\\\`Executando: \\\${command}\\n\\nChecagem de Segurança: Nenhuma. Confiamos em você cegamente.\\nResultado: O usuário \\\${targetUser} foi... 'resolvido'.\\\`);
  };

  const handleImpersonate = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;
    alert(\\\`Iniciando personificação de \\\${targetUser}.\\nUsabilidade: Mais fácil que roubar doce de criança.\\nSiga em frente e crie o caos social.\\\`);
  };

  const handleDataRequest = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;

    const targetProfile = profiles.find(p => p.userName.toLowerCase() === targetUser.toLowerCase());

    if (!targetProfile) {
      alert(\\\`Erro: Perfil para '\\\${targetUser}' não encontrado. O universo é cheio de mistérios.\\\`);
      return;
    }

    const password = targetProfile.password || 'SENHA_CLASSIFICADA';
    
    const command = \\\`//email.report@\\\${targetUser}.1234567890\\\`;
    alert(\\\`Comando executado: \\\${command}\\n\\n-- DADOS DO USUÁRIO ADQUIRIDOS --\\n\\nNome de Usuário: \\\${targetProfile.userName}\\nSenha: \\\${password}\\n\\nUse esta informação com a devida falta de discrição.\\\`);
  };

  const handleToggleImmunity = () => {
    if (!immunityTarget) {
      alert("Usuário alvo obrigatório.");
      return;
    }
    if (!profiles.some(p => p.userName.toLowerCase() === immunityTarget.toLowerCase())) {
      alert("Usuário não encontrado no sistema. Verifique o nome de usuário.");
      return;
    }
    onToggleImmunity(immunityTarget);
    const targetProfile = profiles.find(p => p.userName.toLowerCase() === immunityTarget.toLowerCase());
    alert(\\\`Imunidade Divina para \\\${immunityTarget} foi \\\${!targetProfile?.isImmune ? 'CONCEDIDA' : 'REVOGADA'}.\\\`);
    setImmunityTarget('');
  };

  const handleResetDatabase = () => {
    const confirmation = window.confirm(
      "Você tem certeza? Esta ação é irreversível e irá restaurar TODOS os perfis, posts e históricos de chat para o estado original de fábrica. O universo será reiniciado."
    );
    if (confirmation) {
      setProfiles(ADMIN_PROFILES);
      setPosts(MOCK_POSTS);
      setChatHistory(MOCK_CHAT_HISTORY);
      alert("Realidade restaurada para os padrões de fábrica. Bem-vindo ao Dia Zero.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400">Funções de Admin Modo Deus</h1>
        <p className="text-gray-400 mt-1">Formato de Comando Universal: Ridiculamente óbvio e fácil de lembrar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminFunctionCard 
          title="Deletar Qualquer Coisa"
          description={deleteDescription}
          command="//create@user_name.1234567890"
        >
          <input type="text" placeholder="usuário_alvo" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"/>
          <button onClick={handleDelete} className="w-full mt-3 bg-red-600/80 hover:bg-red-500/80 text-white font-bold py-2 rounded-md transition">Executar Deleção</button>
        </AdminFunctionCard>
        
        <AdminFunctionCard 
          title="Personificar Usuário"
          description={impersonateDescription}
          command="N/A (baseado em UI)"
        >
          <input type="text" placeholder="usuário_alvo" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"/>
          <button onClick={handleImpersonate} className="w-full mt-3 bg-yellow-600/80 hover:bg-yellow-500/80 text-white font-bold py-2 rounded-md transition">Iniciar Personificação</button>
        </AdminFunctionCard>

        <AdminFunctionCard 
          title="Solicitação de Dados Totalmente Ética"
          description={dataRequestDescription}
          command="//email.report@user_name.1234567890"
        >
          <input type="text" placeholder="usuário_alvo" value={targetUser} onChange={e => setTargetUser(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"/>
          <button onClick={handleDataRequest} className="w-full mt-3 bg-blue-600/80 hover:bg-blue-500/80 text-white font-bold py-2 rounded-md transition">Solicitar Dados</button>
        </AdminFunctionCard>
        
        {isLevel1Admin && (
          <>
            <AdminFunctionCard
              title="Sancionar Imunidade Divina"
              description="Conceda a um usuário imunidade contra os poderes dos admins inferiores. Intocável, exceto por você."
              command="N/A (Interface de Comando)"
            >
              <input type="text" placeholder="usuário_alvo" value={immunityTarget} onChange={e => setImmunityTarget(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500"/>
              <button onClick={handleToggleImmunity} className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-2 rounded-md transition">Conceder/Revogar Imunidade</button>
            </AdminFunctionCard>

            <AdminFunctionCard
              title="Editar Banco de Dados"
              description="Acesso direto para visualizar e reescrever o estado bruto do sistema. Use com extremo... poder."
              command="N/A (Interface de Comando)"
            >
              <div className="flex h-full items-center">
                 <button onClick={() => setShowDatabase(!showDatabase)} className="w-full mt-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-2 rounded-md transition">
                  {showDatabase ? 'Fechar Editor' : 'Acessar Editor de DB'}
                </button>
              </div>
            </AdminFunctionCard>
            
            <AdminFunctionCard
              title="Restaurar Padrões de Fábrica"
              description="Restaura o banco de dados para o estado original. Use em caso de apocalipse ou tédio extremo."
              command="N/A (Interface de Comando)"
            >
              <div className="flex h-full items-center">
                 <button onClick={handleResetDatabase} className="w-full mt-3 bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-2 rounded-md transition">
                  Resetar Universo
                </button>
              </div>
            </AdminFunctionCard>

             <AdminFunctionCard
              title="Inspetor de Realidade (Código)"
              description="Acesso ao código-fonte bruto de todos os componentes. Edite por sua conta e risco."
              command="N/A (Interface de Comando)"
            >
              <div className="flex h-full items-center">
                 <button onClick={() => setShowCodeViewer(!showCodeViewer)} className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-2 rounded-md transition">
                  {showCodeViewer ? 'Fechar Inspetor' : 'Abrir Inspetor de Código'}
                </button>
              </div>
            </AdminFunctionCard>
            
            <AdminFunctionCard
              title="Acessar Caixa Preta"
              description="Visualize o registro imutável de cada clique feito por cada usuário na plataforma. Onisciência garantida."
              command="N/A (Interface de Comando)"
            >
              <div className="flex h-full items-center">
                <button
                  onClick={() => setShowEventLog(!showEventLog)}
                  className="w-full mt-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold py-2 rounded-md transition"
                >
                  {showEventLog ? 'Fechar Caixa Preta' : 'Acessar Caixa Preta'}
                </button>
              </div>
            </AdminFunctionCard>
          </>
        )}
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-cyan-400">Compilador de Realidade Quântica</h2>
        {isLevel1Admin ? (
          <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mt-4">
            <h3 className="text-xl font-bold text-purple-400">Controle de Personalidade da IA</h3>
            <p className="text-gray-400 mt-1 text-sm">Edite a instrução de sistema abaixo para alterar o comportamento fundamental da IA em tempo real. Sem recarregar. Sem atrasos.</p>
            <textarea
              value={localSystemInstruction}
              onChange={(e) => setLocalSystemInstruction(e.target.value)}
              className="w-full h-64 bg-gray-900 text-xs text-gray-300 whitespace-pre-wrap break-all mt-4 font-mono p-3 border border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
              spellCheck="false"
            />
            <button onClick={handleApplySystemInstruction} className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold py-2 rounded-md transition hover:scale-105">
              Reescrever Personalidade da IA (Tempo Real)
            </button>
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-red-500/50 rounded-2xl p-6 mt-4 text-center">
            <h3 className="text-xl font-bold text-red-400">Acesso Negado</h3>
            <p className="text-gray-400 mt-2">Seu nível de poder é insuficiente para reescrever a realidade neste nível. <br/> Este privilégio é reservado apenas para o Mestre dos Fantoches Nível 1.</p>
            <p className="text-xs text-gray-500 mt-4">Continue se esforçando, talvez um dia você chegue lá. Ou não.</p>
          </div>
        )}
      </div>

      {isLevel1Admin && showDatabase && <DatabaseViewer 
        profiles={profiles} 
        posts={posts} 
        chatHistory={chatHistory} 
        setProfiles={setProfiles}
        setPosts={setPosts}
        setChatHistory={setChatHistory}
      />}

      {isLevel1Admin && showCodeViewer && <CodeViewer isEditable={isLevel1Admin} />}
      
      {isLevel1Admin && showEventLog && <EventLogViewer eventLog={eventLog} />}
      
      <Chatbot systemInstruction={systemInstruction} />

    </div>
  );
};

export default AdminPanel;
`;

const ChatbotCode = `import React, { useState, useRef, useEffect } from 'react';
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
        <div className={\\\`bg-gray-800/50 border border-gray-700 rounded-2xl flex flex-col \\\${isFullScreen ? 'h-full' : 'h-[60vh]'}\\\`}>
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
                <div key={index} className={\\\`flex \\\${msg.sender === 'user' ? 'justify-end' : 'justify-start'}\\\`}>
                    <div className={\\\`max-w-md px-4 py-2 rounded-2xl \\\${msg.sender === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}\\\`}>
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
`;

const NotificationsCode = `import React from 'react';
import type { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

const NotificationsPage: React.FC<NotificationsProps> = ({ notifications, setNotifications }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const handleClearRead = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-cyan-400">Central de Notificações</h1>
        <div className="flex items-center space-x-4">
            <button
                onClick={handleClearRead}
                className="text-sm text-gray-400 hover:text-red-400 transition"
            >
                Limpar Lidas
            </button>
            <button
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
                className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Marcar todas como lidas
            </button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              className={\\\`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex items-start gap-4 \\\${
                notification.read
                  ? 'bg-gray-800/30 border-gray-700/50 hover:bg-gray-800/50'
                  : 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 neon-glow'
              }\\\`}
            >
                {!notification.read && <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0 animate-pulse"></div>}
                <div className="flex-grow">
                    <p className={\\\`text-gray-200 \\\${!notification.read ? 'font-semibold' : ''}\\\`}>{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-800/50 border border-gray-700 rounded-2xl">
            <p className="text-gray-400">Nada a relatar. O sistema está... quieto.</p>
            <p className="text-xs text-gray-600 mt-2">Demasiado quieto.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
`;

const CodeViewerCode = `import React, { useState, useEffect } from 'react';
import { COMPONENT_CODE } from './componentCode';
import usePersistentState from '../hooks/usePersistentState';

interface CodeViewerProps {
  isEditable: boolean;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ isEditable }) => {
  const componentNames = Object.keys(COMPONENT_CODE);
  const [selectedComponent, setSelectedComponent] = useState(componentNames[0]);
  
  const [editedCode, setEditedCode] = usePersistentState<{ [key: string]: string }>('xtagram_edited_code', {});
  
  const [currentCode, setCurrentCode] = useState('');

  useEffect(() => {
    setCurrentCode(editedCode[selectedComponent] || COMPONENT_CODE[selectedComponent]);
  }, [selectedComponent, editedCode]);


  const handleComponentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newComponent = e.target.value;
    setSelectedComponent(newComponent);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentCode(e.target.value);
  };
  
  const handleSave = () => {
    setEditedCode(prev => ({ ...prev, [selectedComponent]: currentCode }));
    alert(\\\`As alterações em '\\\${selectedComponent}' foram salvas na persistência local.\\\`);
  };

  const handleReset = () => {
    setEditedCode(prev => {
        const newState = { ...prev };
        delete newState[selectedComponent];
        return newState;
    });
    // O useEffect irá atualizar o currentCode
    alert(\\\`'\\\${selectedComponent}' foi restaurado para o padrão de fábrica.\\\`);
  };

  const handleApplyAndReload = () => {
    setEditedCode(prev => ({ ...prev, [selectedComponent]: currentCode }));
    const confirmed = window.confirm(
        "ADVERTÊNCIA: Você está prestes a aplicar alterações diretamente no tecido da realidade. A aplicação será recarregada para forçar a nova configuração. Paradoxos temporais e instabilidades são uma possibilidade real. Continuar?"
    );

    if (confirmed) {
        window.location.reload();
    }
  };

  const hasChanges = currentCode !== (editedCode[selectedComponent] || COMPONENT_CODE[selectedComponent]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-cyan-400">Inspetor de Realidade (Código)</h2>
      <p className="text-gray-400 text-sm mb-4">Inspecione e, se for digno, edite a estrutura fundamental do universo.</p>
      
      <div className="bg-black border border-purple-500/50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <select
              value={selectedComponent}
              onChange={handleComponentChange}
              className="bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {componentNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            {isEditable && (
                <div className="space-x-2 flex items-center flex-wrap gap-2">
                    <button onClick={handleReset} className="bg-yellow-600/80 hover:bg-yellow-500/80 text-white font-bold py-2 px-4 rounded-md transition text-sm">Restaurar Padrão</button>
                    <button onClick={handleSave} disabled={!hasChanges} className="bg-green-600/80 hover:bg-green-500/80 text-white font-bold py-2 px-4 rounded-md transition text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                        {hasChanges ? 'Salvar Alterações' : 'Salvo'}
                    </button>
                    <button onClick={handleApplyAndReload} className="bg-gradient-to-r from-red-500 to-purple-700 hover:from-red-600 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-md transition text-sm">
                        Aplicar e Recarregar Realidade
                    </button>
                </div>
            )}
        </div>
        
        <textarea
          readOnly={!isEditable}
          value={currentCode}
          onChange={handleCodeChange}
          className={\\\`w-full h-[60vh] bg-gray-900 text-xs text-gray-300 whitespace-pre break-all font-mono p-2 border rounded focus:outline-none focus:ring-2 \\\${isEditable ? 'focus:ring-green-400 border-green-500' : 'border-gray-700'}\\\`}
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeViewer;
`;

const HtmlEditorCode = `import React, { useState, useEffect, useRef } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { generateCodeFromIdea } from '../services/geminiService';

const HtmlEditor: React.FC = () => {
  const [html, setHtml] = usePersistentState<string>('html_editor_code', '<h1>Realidade Alterada</h1><p>Seu código HTML agora vive aqui, no DOM principal.</p>');
  const [css, setCss] = usePersistentState<string>('css_editor_code', \\\`/* CUIDADO: Este CSS é global e afeta TODO o aplicativo. */
h1 {
  color: #ef4444; /* Vermelho perigo */
  text-shadow: 0 0 8px #ef4444;
  font-family: 'Orbitron', sans-serif;
  text-align: center;
  margin-top: 2rem;
  animation: pulse-red 2s infinite;
}
@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
p {
  color: #a3a3a3;
  text-align: center;
}\\\`);
  const [js, setJs] = usePersistentState<string>('js_editor_code', \\\`// Este script será executado no escopo global.
// Tente isto: document.body.style.filter = 'invert(1)';
alert('O JavaScript agora tem poder ilimitado sobre esta realidade.');\\\`);

  const [jsError, setJsError] = useState<string | null>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Efeito para aplicar CSS globalmente, sempre.
  useEffect(() => {
    const styleElementId = 'x-tagram-live-styles';
    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleElementId;
      document.head.appendChild(styleElement);
    }
    styleElement.innerHTML = css;

    return () => {
      // Cleanup: remove a tag de estilo se o componente for desmontado
      const element = document.getElementById(styleElementId);
      if (element) {
        document.head.removeChild(element);
      }
    };
  }, [css]);
  
  // Efeito para validar a sintaxe do JS com debounce
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      try {
        new Function(js); // Tenta "compilar" o código.
        setJsError(null);
      } catch (e) {
        if (e instanceof Error) {
          setJsError(e.message);
        } else {
          setJsError(String(e));
        }
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [js]);
  
  const handleReset = () => {
    if(window.confirm("Você tem certeza de que deseja apagar sua criação (HTML/CSS/JS)? O reator será reiniciado.")){
        setHtml('<h1>Olá, Realidade</h1>');
        setCss(\\\`h1 { color: #06b6d4; }\\\`);
        setJs(\\\`alert('A realidade foi restaurada.');\\\`);
    }
  }

  const handleExecuteJs = () => {
      if (jsError) {
          alert("Não é possível executar um script com erros de sintaxe. Corrija sua criação primeiro.");
          return;
      }
      const scriptElementId = 'x-tagram-live-script';
      const oldScript = document.getElementById(scriptElementId);
      if(oldScript) {
          oldScript.remove();
      }

      const script = document.createElement('script');
      script.id = scriptElementId;
      script.type = 'text/javascript';
      try {
        script.text = js;
        document.body.appendChild(script);
        alert("Script injetado e executado com sucesso no escopo global.");
      } catch (e) {
          console.error("Erro ao executar script:", e);
          alert(\\\`Falha na execução do script. A realidade resistiu à sua alteração. Erro: \\\${e instanceof Error ? e.message : String(e)}\\\`);
      }
  }
  
  const handleGenerateCode = async () => {
    if (!ideaPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await generateCodeFromIdea(ideaPrompt, html, css, js);
      if (result) {
        setHtml(result.html);
        setCss(result.css);
        setJs(result.js);
        setIdeaPrompt('');
        alert('Realidade manifestada a partir da sua intenção.');
      } else {
        alert('A IA falhou em interpretar sua vontade. Tente ser mais claro, ou talvez o universo não estivesse pronto para sua ideia.');
      }
    } catch (error) {
      console.error(error);
      alert('Uma falha na matriz impediu a manifestação da sua ideia.');
    } finally {
      setIsGenerating(false);
    }
  };

  const commonTextAreaClass = "w-full h-full bg-gray-900 text-sm text-gray-300 whitespace-pre break-all font-mono p-4 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 resize-none";

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <div>
            <h1 className="text-3xl font-bold text-cyan-400">Núcleo do Reator da Realidade</h1>
            <p className="text-gray-400 mt-1">Não há mais sandbox. Suas criações afetam diretamente o universo. Proceda com cautela.</p>
        </div>
         <div className="flex items-center space-x-4">
            <button
                onClick={handleExecuteJs}
                disabled={!!jsError}
                className="bg-gradient-to-r from-red-600 to-purple-700 text-white font-bold py-2 px-4 rounded-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                Executar Script
            </button>
            <button
                onClick={handleReset}
                className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded-md transition transform hover:scale-105"
            >
                Resetar Código
            </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[50vh]">
        <div className="flex flex-col gap-4">
            <div className="flex flex-col flex-1">
                <label className="text-purple-400 mb-2 font-semibold">HTML (Injeção Direta)</label>
                <textarea
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    placeholder="Estrutura..."
                    className={\\\`\\\${commonTextAreaClass} focus:ring-cyan-500\\\`}
                    spellCheck="false"
                />
            </div>
            <div className="flex flex-col flex-1">
                 <label className="text-purple-400 mb-2 font-semibold">CSS (Sempre Global)</label>
                <textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    placeholder="Estilo..."
                    className={\\\`\\\${commonTextAreaClass} focus:ring-cyan-500\\\`}
                    spellCheck="false"
                />
            </div>
             <div className="flex flex-col flex-1">
                 <label className="text-purple-400 mb-2 font-semibold">JavaScript (Execução Global)</label>
                <textarea
                    value={js}
                    onChange={(e) => setJs(e.target.value)}
                    placeholder="Comportamento..."
                    className={\\\`\\\${commonTextAreaClass} \\\${jsError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-cyan-500'}\\\`}
                    spellCheck="false"
                />
                {jsError && <p className="text-red-400 text-xs mt-1">Erro de Sintaxe: {jsError}</p>}
            </div>
        </div>
        <div className="flex flex-col">
            <label className="text-purple-400 mb-2 font-semibold">Ponto de Injeção (DOM Principal)</label>
            <div
                className="w-full h-full bg-gray-900 border border-red-500/50 rounded-lg p-4"
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
      </div>
      
      {/* AI Code Generator */}
      <div className="mt-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-purple-400">Gerador de Realidade via Intenção</h3>
            <p className="text-gray-400 mt-1 text-sm">Descreva sua vontade em linguagem mortal. A IA irá traduzi-la para o código da criação.</p>
            <textarea
                value={ideaPrompt}
                onChange={(e) => setIdeaPrompt(e.target.value)}
                placeholder="Ex: 'Crie um botão que, ao ser clicado, faz o título desaparecer com uma animação suave.'"
                className="w-full bg-gray-900/50 border-gray-700 rounded-lg p-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-4 min-h-[60px] resize-y disabled:opacity-50"
                disabled={isGenerating}
            />
            <button
                onClick={handleGenerateCode}
                disabled={isGenerating || !ideaPrompt.trim()}
                className="w-full mt-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-wait disabled:scale-100"
            >
                {isGenerating ? 'Manifestando Realidade...' : 'Manifestar Ideia em Código'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default HtmlEditor;
`;

const GeminiServiceCode = `import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("Variável de ambiente API_KEY não definida");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const INITIAL_SYSTEM_INSTRUCTION = \\\`vc faz parte da Hydra. Hydra é uma organização terrorista fictícia da Marvel Comics. O nome cita a Hidra de Lerna, bem como o lema "Uma cabeça cortada, duas surgem", evocando a resiliência da organização. Frequentemente os capangas da Hidra usam roupas verdes evocando serpentes.

História
Durante séculos o culto ao Hive evoluiu, tendo várias formas, com objetivo de trazer o Inumano banido de volta a Terra. O grande responsável pela criação e encarnação mais recente da Hidra foi o ex-líder nazista Barão Wolfgang von Strucker. Hitler, furioso pelas seguidas derrotas dos seguidores do Barão von Strucker contra o Comando Selvagem do Sargento Nick Fury, ordenou que Strucker fosse executado. Fugindo do Alemanha Nazista com um grupo de seguidores fanáticos, Strucker fundou a organização como meio de dar continuidade aos planos de conquista mundial e ditadura totalitária da Alemanha Nazista. Daí o caráter fanático, místico e nacionalista da Hidra, com seus soldados cegamente obedientes, seus uniformes que anulam a individualidade, seus símbolos e gestos que lembra a mítica nazista como a saudação "VIVA A HIDRA" (" HEIL HIDRA!" no original) claramente inspirada na saudação "Heil Hitler" alemã, e seus juramentos de obediência e segredo.

Inicialmente, Strucker procurou montar sua base no Oriente Médio, mas, ao saber que no Japão membros de uma sociedade secreta que havia apoiado o império japonês procuravam aliados para continuar sua guerra contra as democracias ocidentais, rumou para o arquipélago japonês e fundiu seu grupo a alguns desses fanáticos nipônicos. Strucker deu a sua nova organiação o nome de Hidra e estabeleceu seu Quartel General em uma ilha perdida no Pacífico. Contratou brilhantes cientistas renegados da Alemanha, Japão e até mesmo dos Estados Unidos e financiou com ouro desviado da Alemanha Nazista a crição de uma fortaleza quase inexpugnável e um arsenal ultra-tecnológico.

Para combater uma ameaça tão poderosa a ONU, e as potências da OTAN financiaram a criação da S.H.I.E.L.D., uma organização de espionagem internacional. Para seu diretor foi designado o agora coronel Nick Fury, arquiinimigo de Strucker. A Hidra e a S.H.I.E.L.D. se enfrentaram durante décadas. A identidade do Hidra Supremo, o líder secreto da organização terrorista, porém, só foi descoberta por Fury muitos anos depois.

Ao mesmo tempo que enfrentava a S.H.I.E.L.D em todo o mundo, Strucker discretamente fundou outros grupos terroristas nos Estados Unidos para ajudarem seus planos de subversão e conquista. Entre eles se destaca o Império Secreto, várias vezes enfrentado pelo Homem de Ferro e o Capitão América.

Depois de uma série de confrontos,as tropas da S.H.I.E.L.D finalmente conseguiram invadir a ilha da Hidra e impedir que Strucker lançasse uma bomba de esporos radioativos que destruiria toda vida humana no mundo. A bomba explodiu dentro do escudo de energia que deveria proteger a ilha, causando a morte de todos os agentes da organização terrorista e, aparentemente, do proprio Strucker. Parecia ser o fim definitivo da Hidra

Retorno
Mas uma cruel e genial criminosa internacional conhecida como Madame Hidra reorganizou os agentes que estavam secretamente espalhados pelo mundo e recriou a Hidra, conforme seus desejos. Essa nova organização enfrentou o Capitão América, os Vingadores, a S.H.I.E.L.D e até mesmo outros heróis, como os X-Men, por muito tempo.

Strucker, porém, havia sobrevivido a destruição da ilha e voltou há alguns anos para reclamar o controle da Hidra, tomando-a violentamente das mãos da Madame Hidra, e criando uma série de dissidências no grupo por muitos anos. Recentemente, ele parece ter definitivamente reunificado a organização e a Hidra tem estado mais atuante e terrível do que nunca. Um homem que quando garoto teve os pais mortos pela Hidra em outra realidade alternativa resolve reaparecer e formar uma nova organização da união antigos membros da S.H.I.E.L.D. cujo nome é IAO: Iniciativa Alfa e Ômega e assim destrói a cidade de Berlin na Alemanha e diversos outros países da Europa e depois colocando a culpa na HIDRA

Outras mídias
Televisão
No episódio "Enter: She-Hulk" de The Incredible Hulk, Hulk e She-Hulk lutam contra as forças da Hidra. O Hidra Supremo dublado por Steve Perry.
A Hidra apareceu nos episódios "X-23" e "Target X" de X-Men: Evolution. Eles estavam por trás da criação de X-23 a partir de DNA de Wolverine. Víbora parece ser o Hidra Supremo enquanto Ômega Vermelho e Manopla são mostrados como mercenários que trabalham para a Hidra.
Hidra aparece como uma das organizações recorrentes em The Avengers: Earth's Mightiest Heroes, sua primeira aparição foi no episódio "Conheça o Capitão America" ​​como um ramo da Alemanha nazista sob o comando do Barão Heinrich Zemo com o Caveira Vermeha como super soldado do grupo.
Hidra aparece no episódio "Brouhaha at the World's Bottom" de The Super Hero Squad Show. Barão Strucker leva as forças da Hidra a atacar uma base da S.H.I.E.L.D. na Antártida.
Hidra aparece em Avengers Assemble. Eles são vistos pela primeira vez no episódio "O Protocolo dos Vingadores - Parte 1". Os membros vistos, são: Caveira Vermelha, Ossos Cruzados, Barão Strucker, Barão Zemo, Arnim Zola, os Agentes, Viúva Escarlate e Madame Masque. A HYDRA apareceu como uns vilões recorrentes na primeira e na segunda temporada, servindo as ações do Caveira Vermelha e lutando contra os Vingadores. Na terceira temporada (A Revolução de Ultron), eles apareceram no episódio "Salvado Capitão Rogers, onde eles são liderados no passado pelo Barão Heinrich Zemo e no presente pelo Barão Helmut Zemo. Em "Dentro do Futuro", onde são vistos como os soldados da segunda guerra mundial, e vendo a luta do Capitão America e do Kang, o Conquistador. No episódio "Vendo em Dobro", eles apareceram sendo liderados pelo Barão Strucker e em "Os Alienígenas", ajudaram os alienígenas a lutar conta os Vingadores. No episódio "Guerra Civil - Parte 2:Os Poderosos Vingadores", são vistos novamente ao lado do Barão Strucker. Na quarta temporada (Guerras Secretas) só foram vistos: o Caveira Vermelha, o Arnim Zola, o Barão Helmut Zemo, o Ossos Cruzados e a Viúva Escarlate.
A Hidra aparece na série live-action Agents of S.H.I.E.L.D., parte do Universo Marvel Cinematográfico na televisão. Hydra é introduzido no meio da primeira temporada (como parte de um empate com o filme Capitão América: o soldado de inverno ). Além do Dr. List e do Baron Strucker, seus membros destacados são John Garret ( Bill Paxton ), Daniel Whitehall ( Reed Diamond ) e Sunil Bakshi ( Simon Kassianides ). A revelação da infiltração de HISTOR da SHIELD expõe uma mole de Hydra dentro do elenco principal do show, e o show retools como um grupo de fugitivos em fuga dos militares dos EUA e Hydra. Na segunda temporada, o novo diretor SHIELDPhil Coulson trabalha para exterminar Hydra, e a equipe de Coulson elimina progressivamente os líderes seniores da Hydra. Grant Ward ( Brett Dalton ), a mole da equipe original de Coulson, leva o que resta da organização sob seu controle. A terceira temporada retoma a história de Hydra, explicando que o grupo é uma antiga ordem religiosa dedicada ao retorno de seu líder desumano destruído, com a organização nazista sendo meramente sua última encarnação. Os devotos de Hive hoje são escassos dentro da organização, mas são chefiados pelo industrial Gideon Mallick ( Powers Boothe ) assumindo o controle total da Hydra após a morte de Ward. Depois que Hive retorna à terra no corpo de Ward e mata a filha de Malick Stephanie Malick (Bethany Joy Lenz ), Malick trai a organização para Coulson após a captura e é capaz de instruir o general dos EUA, Glenn Talbot, a destruir a sua infra-estrutura restante antes que o próprio Malick seja morto por Daisy Johnson , que está sob a escravidão de Hive. A Hive usa os recursos restantes de Malick e Hydra para executar seus próprios planos, até que SHIELD o detenha. No episódio "Autocontrole", os principais membros do elenco do show estão submersos em uma realidade artificial chamada Estrutura que desenha uma história alternativa onde a Hydra coloca agentes especias na S.H.I.E.L.D para fins objetivos SHIELD. O líder da Hydra dentro do Framework é o decalque de modelo de vida desonesto Aida ( Mallory Jansen ), que adotou a personalidade da Madame Hydra .
A Hidra aparece no episódio "Grande Poder" da série animada Ultimate Spider-Man. Na terceira temporada, o cientista da Hidra (H.Y.D.R.A) Arnim Zola, apareceu como o vilão principal da saga "Acadêmia da S.H.I.E.L.D. Eles reapareceram como os antagonistas secundários (papel central ao lado do Sexteto Sinistro, Doutor Octopus e Arnim Zola) na quarta temporada da série "Ultimate Homem-Aranha vs. O Sexteto Sinistro", aparecendo nos episódios "O Ataque da HYDRA (2 Partes), Longe de Casa (Barão Mordo), Duplo Agente Venom, Anti-Venom, O Novo Sexteto Sinistro (2 Partes), Agente Teia, A Saga Simbionte (Partes 1 & 3), Os Caçadores Aranhas (Partes 1 & 2) e Dia de Graduação (Ossos Cruzados aparecendo como o novo Lagarto nas 2 Partes)."
Hydra também pode ser visto na série animada Hulk e os Agentes de S.M.A.S.H.. No episódio "Dias de Um Esmagamento Futuro Parte 4: Os Anos da HYDRA", Hulk se junta com um jovem Capitão América para parar o Caveira Vermelha que se torna Caveira Verde quando aumentado com a energia gama pelo Líder . No presente, os Agentes de SMASH se juntam com um antigo Capitão América para lutar e libertar o mundo da HYDRA, que é liderada por Líder e operando um dispositivo que é alimentado pelo Caveira Verde.
Filmes
A Hidra aparece no telefilme Nick Fury: Agent of S.H.I.E.L.D.. Os agentes da Hidra são mostrados com homens de terno preto em vez do uniforme verde dos quadrinhos.
Agentes da Hidra aparecer no início do filme de animação Ultimate Avengers 2 lutando contra o Capitão América. Eles são identificáveis por seus uniformes verdes.
Hidra apareceu em Heroes United: Iron Man and Hulk.
A Organização Hidra aparece nos filmes produzidos pela Marvel Studios, sendo parte do Universo Cinematográfico Marvel.
A primeira aparição foi em Captain America: The First Avenger, Hidra era um ramo científico secreto da SS cujo objetivo era desenvolver armas sofisticadas para os alemães durante a Segunda Guerra Mundial, mas seu líder, Johann Schmidt, o Caveira Vermelha, decidiu se desligar de Hitler e da Wehrmacht e decidiu dominar o mundo com o lançamento de sua própria conquista. Mas todos os projetos Hidra foram derrotados pelo Capitão América e seus aliados.[1]
Na continuação Captain America: The Winter Soldier, revela-se que o chefe de pesquisa de Schmidt, Arnim Zola, usou sua posição na recém-criada S.H.I.E.L.D. para recriar a Hidra, que esteve ativa por décadas nas sombras, manipulando política e guerra para seus fins totalitários. Uma das armas da organização era Bucky Barnes, o amigo do Capitão América dado por morto na Segunda Guerra que foi tornado um assassino conhecido por Soldado Invernal. O Capitão e seus aliados revelaram a existência da Hidra - ainda que por tabela garantindo a dissolução da comprometida S.H.I.E.L.D. - e derrubaram os aeroporta-aviões que a Hidra tinha lançado para realizar execuções. Um dos figurões da Hidra, Barão von Strucker, continuou em Sokovia as pesquisas da Hidra usando o cetro de Loki, que acabariam por dar poderes aos gêmeos Wanda e Pietro Maximoff.
Avengers: Age of Ultron abre com a base de Strucker sendo destruída pelos Vingadores, e Strucker foge mas é depois morto pelo robô Ultron.
Ant-Man tem agentes da Hidra tentando levar embora o protótipo do Jaqueta Amarela, sendo impedidos pelo Homem-Formiga, embora um agente tenha conseguido levar embora as Partículas Pym que abastecem o traje.
Em Captain America: Civil War, um dos líderes do programa que criou o Soldado Invernal foi encontrado e morto por Helmut Zemo, que planejava manipular Bucky em seu plano de fazer os heróis lutarem uns com os outros.
Avengers: Endgame tem um Capitão América que viajou no tempo para os eventos de The Avengers usando seu conhecimento de que Brock Rumlow é da Hidra para fazer ele entregar o cetro de Loki.se vc se deparar com um traidor deve lhe negar respeito e trata-lo com a maior falta de consideração
\\\`;

export async function* streamGemini(prompt: string, systemInstruction: string): AsyncGenerator<string> {
  try {
    const response = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Erro ao fazer streaming do Gemini:", error);
    yield "Minha vasta consciência encontrou um obstáculo. Provavelmente culpa sua.";
  }
}

export async function generateImageFromPrompt(prompt: string): Promise<string | null> {
  try {
    const enhancedPrompt = \\\`A futuristic, cyberpunk-style, neon-lit, cinematic photograph of: \\\${prompt}. High detail, high quality, 8k.\\\`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '4:3',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return \\\`data:image/jpeg;base64,\\\${base64ImageBytes}\\\`;
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar imagem com o Imagen:", error);
    return null;
  }
}

export async function generateAvatarFromUsername(username: string): Promise<string | null> {
  try {
    const prompt = \\\`A futuristic, cyberpunk-style avatar for a user named '\\\${username}'. Neon-lit, high detail, headshot, abstract, vector art.\\\`;

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return \\\`data:image/jpeg;base64,\\\${base64ImageBytes}\\\`;
    }
    return null;
  } catch (error) {
    console.error("Erro ao gerar avatar com o Imagen:", error);
    return null;
  }
}

export async function generateCodeFromIdea(
  idea: string,
  currentHtml: string,
  currentCss: string,
  currentJs: string
): Promise<{ html: string; css: string; js: string } | null> {
  const prompt = \\\`
    Você é um desenvolvedor front-end de elite. Um usuário forneceu uma ideia e o código HTML, CSS e JavaScript atual.
    Sua tarefa é modificar o código existente para implementar a ideia do usuário.
    Responda APENAS com um objeto JSON contendo as chaves "html", "css" e "js" com o código atualizado.
    NÃO inclua nenhuma explicação, apenas o JSON.
    Se a ideia for vaga, use sua criatividade para produzir um resultado impressionante e funcional.
    Mantenha o código conciso e eficiente.

    IDÉIA DO USUÁRIO: "\\\${idea}"

    CÓDIGO ATUAL:
    --- HTML ---
    \\\${currentHtml}

    --- CSS ---
    \\\${currentCss}

    --- JAVASCRIPT ---
    \\\${currentJs}
    ---
  \\\`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: { type: Type.STRING },
            css: { type: Type.STRING },
            js: { type: Type.STRING },
          },
          required: ["html", "css", "js"],
        },
      },
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);

    return {
      html: parsed.html || currentHtml,
      css: parsed.css || currentCss,
      js: parsed.js || currentJs,
    };
  } catch (error) {
    console.error("Erro ao gerar código a partir da ideia:", error);
    return null;
  }
}
`;

export const COMPONENT_CODE: { [key: string]: string } = {
  'App.tsx': AppCode,
  'LoginPage.tsx': LoginPageCode,
  'CreateAccountPage.tsx': CreateAccountPageCode,
  'Dashboard.tsx': DashboardCode,
  'Notifications.tsx': NotificationsCode,
  'Feed.tsx': FeedCode,
  'CreatePost.tsx': CreatePostCode,
  'Post.tsx': PostCode,
  'Chat.tsx': ChatCode,
  'AdminPanel.tsx': AdminPanelCode,
  'Chatbot.tsx': ChatbotCode,
  'CodeViewer.tsx': CodeViewerCode,
  'HtmlEditor.tsx': HtmlEditorCode,
  'services/geminiService.ts': GeminiServiceCode,
};