import { IntegrationLoginType } from "@/constants/integrationLogin";

interface IntegrationStatePayload {
  type: IntegrationLoginType;
  redirect: string;
  ts: number;
}

export function createIntegrationState(type: IntegrationLoginType, redirect: string) {
  const payload: IntegrationStatePayload = {
    type,
    redirect,
    ts: Date.now(),
  };

  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function parseIntegrationState(state: string | null | undefined): IntegrationStatePayload | null {
  if (!state) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(atob(state))) as IntegrationStatePayload;
  } catch {
    return null;
  }
}

export function getLoginRedirect(input: unknown) {
  return typeof input === "string" && input ? input : "/";
}

export function resolveCallbackCode(searchParams: URLSearchParams) {
  return searchParams.get("code") || searchParams.get("authCode") || "";
}

export function buildHashRedirect(redirect: string) {
  if (!redirect || redirect === "/") {
    return `${window.location.origin}${window.location.pathname.replace(/\/logincallback\.html$/i, "/")}#/`;
  }

  return `${window.location.origin}${window.location.pathname.replace(/\/logincallback\.html$/i, "/")}#${redirect.startsWith("/") ? redirect : `/${redirect}`}`;
}
