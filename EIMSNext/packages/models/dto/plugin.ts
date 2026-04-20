export interface PluginFieldDesc {
  key: string;
  name: string;
  fieldType: string;
  required: boolean;
  allowCustomValue: boolean;
  allowFieldMapping: boolean;
  description?: string;
  compatibleFieldTypes: string[];
}

export interface FunctionDesc {
  id: string;
  name: string;
  description?: string;
  inputFields: PluginFieldDesc[];
}

export interface PluginRuntimeInfo {
  pluginId: string;
  name: string;
  version: string;
  description?: string;
  functions: FunctionDesc[];
}

export interface PluginReloadItemResult {
  pluginId: string;
  previousVersion?: string;
  currentVersion?: string;
  updated: boolean;
  unloadedOldVersion: boolean;
  message?: string;
}

export interface PluginReloadResult {
  items: PluginReloadItemResult[];
}
