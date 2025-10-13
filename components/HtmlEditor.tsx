

import React, { useState, useEffect, useRef } from 'react';
import usePersistentState from '../hooks/usePersistentState';
import { generateCodeFromIdea } from '../services/geminiService';

const HtmlEditor: React.FC = () => {
  const [html, setHtml] = usePersistentState<string>('html_editor_code', '<h1>Realidade Alterada</h1><p>Seu código HTML agora vive aqui, no DOM principal.</p>');
  const [css, setCss] = usePersistentState<string>('css_editor_code', `/* CUIDADO: Este CSS é global e afeta TODO o aplicativo. */
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
}`);
  const [js, setJs] = usePersistentState<string>('js_editor_code', `// Este script será executado no escopo global.
// Tente isto: document.body.style.filter = 'invert(1)';
alert('O JavaScript agora tem poder ilimitado sobre esta realidade.');`);

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
        setCss(`h1 { color: #06b6d4; }`);
        setJs(`alert('A realidade foi restaurada.');`);
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
          alert(`Falha na execução do script. A realidade resistiu à sua alteração. Erro: ${e instanceof Error ? e.message : String(e)}`);
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
                    className={`${commonTextAreaClass} focus:ring-cyan-500`}
                    spellCheck="false"
                />
            </div>
            <div className="flex flex-col flex-1">
                 <label className="text-purple-400 mb-2 font-semibold">CSS (Sempre Global)</label>
                <textarea
                    value={css}
                    onChange={(e) => setCss(e.target.value)}
                    placeholder="Estilo..."
                    className={`${commonTextAreaClass} focus:ring-cyan-500`}
                    spellCheck="false"
                />
            </div>
             <div className="flex flex-col flex-1">
                 <label className="text-purple-400 mb-2 font-semibold">JavaScript (Execução Global)</label>
                <textarea
                    value={js}
                    onChange={(e) => setJs(e.target.value)}
                    placeholder="Comportamento..."
                    className={`${commonTextAreaClass} ${jsError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-cyan-500'}`}
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