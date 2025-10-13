import React, { useState, useEffect } from 'react';
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
    alert(`As alterações em '${selectedComponent}' foram salvas na persistência local.`);
  };

  const handleReset = () => {
    setEditedCode(prev => {
        const newState = { ...prev };
        delete newState[selectedComponent];
        return newState;
    });
    // O useEffect irá atualizar o currentCode
    alert(`'${selectedComponent}' foi restaurado para o padrão de fábrica.`);
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
          className={`w-full h-[60vh] bg-gray-900 text-xs text-gray-300 whitespace-pre break-all font-mono p-2 border rounded focus:outline-none focus:ring-2 ${isEditable ? 'focus:ring-green-400 border-green-500' : 'border-gray-700'}`}
          spellCheck="false"
        />
      </div>
    </div>
  );
};

export default CodeViewer;