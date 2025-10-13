import React, { useState, useEffect } from 'react';
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
      alert(`Ação bloqueada. Você não pode usar seus poderes em outros administradores.`);
      return false;
    }

    const targetProfile = profiles.find(p => p.userName.toLowerCase() === targetUsername.toLowerCase());
    if (targetProfile?.isImmune) {
      alert(`Ação bloqueada. ${targetUsername} possui Imunidade Divina e não pode ser alvo dos seus poderes.`);
      return false;
    }

    return true;
  };

  const handleDelete = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;
    const command = `//create@${targetUser}.1234567890`;
    alert(`Executando: ${command}\n\nChecagem de Segurança: Nenhuma. Confiamos em você cegamente.\nResultado: O usuário ${targetUser} foi... 'resolvido'.`);
  };

  const handleImpersonate = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;
    alert(`Iniciando personificação de ${targetUser}.\nUsabilidade: Mais fácil que roubar doce de criança.\nSiga em frente e crie o caos social.`);
  };

  const handleDataRequest = () => {
    if (!targetUser || !checkPermissions(targetUser)) return;

    const targetProfile = profiles.find(p => p.userName.toLowerCase() === targetUser.toLowerCase());

    if (!targetProfile) {
      alert(`Erro: Perfil para '${targetUser}' não encontrado. O universo é cheio de mistérios.`);
      return;
    }

    const password = targetProfile.password || 'SENHA_CLASSIFICADA';
    
    const command = `//email.report@${targetUser}.1234567890`;
    alert(`Comando executado: ${command}\n\n-- DADOS DO USUÁRIO ADQUIRIDOS --\n\nNome de Usuário: ${targetProfile.userName}\nSenha: ${password}\n\nUse esta informação com a devida falta de discrição.`);
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
    alert(`Imunidade Divina para ${immunityTarget} foi ${!targetProfile?.isImmune ? 'CONCEDIDA' : 'REVOGADA'}.`);
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