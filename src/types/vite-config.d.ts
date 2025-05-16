// vite.config.d.ts
declare module 'vite' {
  export function defineConfig(config: any): any;
}

declare module '@vitejs/plugin-react' {
  const react: (options?: any) => any;
  export default react;
}