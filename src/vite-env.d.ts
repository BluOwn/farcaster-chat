/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_CONTRACT_ADDRESS?: string;
    readonly VITE_MULTISYNQ_API_KEY?: string;
    readonly [key: string]: string | undefined;
  };
}