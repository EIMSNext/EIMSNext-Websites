import { AdminPermissionSnapshot, ScopeMode, UserType } from "@eimsnext/models";
import { systemService } from "@eimsnext/services";
import { useUserStore } from "@eimsnext/store";

const snapshot = ref<AdminPermissionSnapshot>();
let loadPromise: Promise<AdminPermissionSnapshot> | undefined;

export const useAdminPermissions = () => {
  const userStore = useUserStore();

  const isUnrestrictedAdmin = computed(() =>
    [
      UserType.System,
      UserType.Client,
      UserType.CorpOwmer,
      UserType.CorpAdmin,
    ].includes(userStore.currentUser.userType),
  );

  const loadAdminPermissions = async (force = false) => {
    if (!force && snapshot.value) return snapshot.value;
    if (!force && loadPromise) return loadPromise;

    loadPromise = systemService.getAdminPermissions().then((res) => {
      snapshot.value = res;
      loadPromise = undefined;
      return res;
    });
    return loadPromise;
  };

  const clearAdminPermissions = () => {
    snapshot.value = undefined;
    loadPromise = undefined;
  };

  watch(
    () => userStore.currentUser.corpId,
    () => clearAdminPermissions(),
  );

  const canCreateApp = computed(() => isUnrestrictedAdmin.value || !!snapshot.value?.canCreateOrDeleteApp);

  const canManageAppId = (appId?: string) => {
    if (isUnrestrictedAdmin.value) return true;
    if (!appId || !snapshot.value?.isNormalAdmin) return false;
    return snapshot.value.manageableAppIds?.includes(appId) || false;
  };

  const canDeleteAppId = (appId?: string) => {
    if (isUnrestrictedAdmin.value) return true;
    if (!appId || !snapshot.value?.isNormalAdmin) return false;
    return snapshot.value.deletableAppIds?.includes(appId) || false;
  };

  const hasContactManageDepartmentScope = computed(() => {
    if (isUnrestrictedAdmin.value) return true;
    if (!snapshot.value?.isNormalAdmin) return false;
    return snapshot.value.contactManageDepartmentScopeMode === ScopeMode.All
      || snapshot.value.contactManageDepartmentIds.length > 0;
  });

  const canManageContactDepartment = (departmentId?: string) => {
    if (isUnrestrictedAdmin.value) return true;
    if (!departmentId || !snapshot.value?.isNormalAdmin) return false;
    if (snapshot.value.contactManageDepartmentScopeMode === ScopeMode.All) return true;
    return snapshot.value.contactManageDepartmentIds.includes(departmentId);
  };

  return {
    adminPermissions: snapshot,
    loadAdminPermissions,
    clearAdminPermissions,
    isUnrestrictedAdmin,
    canCreateApp,
    canManageAppId,
    canDeleteAppId,
    hasContactManageDepartmentScope,
    canManageContactDepartment,
  };
};
