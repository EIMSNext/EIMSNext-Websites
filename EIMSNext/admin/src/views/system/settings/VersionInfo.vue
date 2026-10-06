<template>
  <div class="version-panel">
    <h2>{{ $t("admin.systemSettings.version.current") }}</h2>
    <section class="version-grid">
      <div class="version-card current">
        <strong>{{ $t("admin.systemSettings.version.edition") }}</strong>
        <span>{{ $t("admin.systemSettings.version.validity", { range: "2025-06-19-2027-06-26" }) }}</span>
        <div>
          <el-button type="primary">{{ $t("admin.systemSettings.version.consultBuy") }}</el-button>
          <el-button>{{ $t("admin.systemSettings.version.uploadProof") }}</el-button>
        </div>
      </div>
      <div class="version-card coins">
        <strong>-0.08 <small>{{ $t("admin.systemSettings.version.coinRate") }}</small></strong>
        <div>
          <el-button type="primary">{{ $t("admin.systemSettings.version.recharge") }}</el-button>
          <el-button>{{ $t("admin.systemSettings.version.paymentSettings") }}</el-button>
          <el-button>{{ $t("admin.systemSettings.version.consumptionStats") }}</el-button>
          <el-button>{{ $t("admin.systemSettings.version.usageLog") }}</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.version-panel {
  h2 {
    font-size: 17px;
    margin: 14px 0 22px;
    border-left: 4px solid var(--et-color-primary);
    padding-left: 10px;
  }
}

.version-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.version-card {
  padding: 26px 22px;
  height: 120px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &.current {
    background: color-mix(in srgb, var(--et-color-primary) 8%, var(--et-bg-color));
  }

  &.coins {
    background: color-mix(in srgb, #f59e0b 10%, var(--et-bg-color));
  }

  strong {
    font-size: 25px;
  }

  small {
    font-size: 14px;
    font-weight: 400;
  }

  span {
    align-self: flex-end;
    color: var(--et-text-secondary);
  }
}

@media (max-width: 800px) {
  .version-grid {
    grid-template-columns: 1fr;
  }
}
</style>
