declare module '@farcaster/frame-sdk' {
  export const sdk: {
    isInMiniApp: () => Promise<boolean>;
    context: any;
    actions: {
      ready: () => Promise<void>;
      signIn: (options: { nonce: string; acceptAuthAddress: boolean }) => Promise<any>;
      composeCast: (options: { text: string; embeds: string[] }) => Promise<void>;
      addFrame: () => Promise<void>;
    };
    wallet?: {
      ethProvider?: any;
    };
  };
}