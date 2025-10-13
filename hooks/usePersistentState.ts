// FIX: Shocking, I know, but you need to import 'React' to use 'React' types.
import React, { useState, useEffect } from 'react';

function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error("Erro ao ler do localStorage", error);
    }
    // Se não houver valor armazenado ou se a análise falhar, retorne o valor inicial
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error("Erro ao escrever no localStorage", error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;
