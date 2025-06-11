// Tipos globais para o projeto
declare module 'uuid' {
  export function v4(): string;
  // Adicione outras funções do uuid conforme necessário
}

// Extendendo o tipo Window para incluir propriedades globais, se necessário
declare global {
  interface Window {
    // Adicione propriedades globais do navegador aqui, se necessário
  }
}

export {};
