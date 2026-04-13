import { systemMessageService, wfTodoService } from "@eimsnext/services";
import buildQuery from "odata-query";

export const BADGE_REFRESH_INTERVAL = 60 * 1000;

export const queryCorpTodoCount = () => {
  return wfTodoService.count().catch(() => 0);
};

export const queryAppTodoCount = (appId?: string) => {
  if (!appId) {
    return Promise.resolve(0);
  }

  const query = buildQuery({ filter: { appId } });
  return wfTodoService.count(query).catch(() => 0);
};

export const queryUnreadSystemMessageCount = () => {
  const query = buildQuery({ filter: { isRead: false } });
  return systemMessageService.count(query).catch(() => 0);
};
