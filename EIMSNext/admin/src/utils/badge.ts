import { systemMessageService, wfTaskService } from "@eimsnext/services";
import buildQuery from "odata-query";

export const BADGE_REFRESH_INTERVAL = 60 * 1000;

export const queryCorpTaskCount = () => {
  return wfTaskService.count().catch(() => 0);
};

export const queryAppTaskCount = (appId?: string) => {
  if (!appId) {
    return Promise.resolve(0);
  }

  const query = buildQuery({ filter: { appId } });
  return wfTaskService.count(query).catch(() => 0);
};

export const queryUnreadSystemMessageCount = () => {
  const query = buildQuery({ filter: { isRead: false } });
  return systemMessageService.count(query).catch(() => 0);
};
