/// <reference types="vite/client" />

declare global {
  interface Window {
    appSetting?: Record<string, unknown>;
  }
}

export {};
