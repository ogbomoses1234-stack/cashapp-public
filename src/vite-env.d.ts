/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ENABLE_SCANNER: string;
  readonly VITE_ENABLE_CHAT: string;
  readonly VITE_ENABLE_DISPUTES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
