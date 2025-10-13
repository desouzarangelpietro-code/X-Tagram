import React, { useState } from 'react';
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
        finalAvatar = avatar || `https://picsum.photos/seed/${username}/100/100`;
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