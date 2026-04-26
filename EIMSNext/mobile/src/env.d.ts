declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<Record<string, never>, Record<string, never>, any>;
  export default component;
}

declare global {
  interface Window {
    appSetting?: {
      clientId?: string;
      authUrl?: string;
      apiUrl?: string;
      uploadUrl?: string;
      tokenKey?: string;
      httpTimeout?: number;
    };
  }
}

export {};
