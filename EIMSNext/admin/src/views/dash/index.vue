<template>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router";
const route = useRoute();

const dashId = route.params.dashId.toString();
</script>
<style lang="scss" scoped></style>