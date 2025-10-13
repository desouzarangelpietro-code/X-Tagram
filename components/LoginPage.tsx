import React, { useState } from 'react';
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