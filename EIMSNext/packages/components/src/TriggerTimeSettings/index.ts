import triggerTimeSettings from "./TriggerTimeSettings.vue";
import { withInstall } from "../utils/install";

const TriggerTimeSettings = withInstall(triggerTimeSettings);

export * from "./type";
export * from "./utils";
export { TriggerTimeSettings };
