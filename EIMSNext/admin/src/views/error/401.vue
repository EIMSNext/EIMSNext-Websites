<script setup lang="ts">
import { reactive, toRefs } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "Page401",
});

const state = reactive({
  errGif: new URL("../../assets/images/401.gif", import.meta.url).href,
});

const { errGif } = toRefs(state);

const router = useRouter();

function back() {
  router.back();
}
</script>

<template>
  <div class="page-container">
    <el-button icon="el-arrow-left" class="pan-back-btn" @click="back">返回</el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-jumbo text-ginormous">Oops!</h1>
        <h2>你没有权限去该页面</h2>
        <h6>如有不满请联系你领导</h6>
      </el-col>
      <el-col :span="12">
        <img :src="errGif" width="313" height="428" alt="Girl has dropped her ice cream." />
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  width: 100%;
  padding: var(--et-size-100);

  .pan-back-btn {
    color: var(--et-text-on-primary);
    background: var(--et-color-success);
    border: none !important;
  }

  .pan-gif {
    display: block;
    margin: 0 auto;
  }

  .pan-img {
    display: block;
    width: 100%;
    margin: 0 auto;
  }

  .text-jumbo {
    font-size: var(--et-size-60);
    font-weight: 700;
    color: var(--et-text-primary);
  }

  .list-unstyled {
    font-size: var(--et-font-size-14);

    li {
      padding-bottom: var(--et-space-5);
    }

    a {
      color: var(--et-color-success);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
