<template>
    <div ref="cell" class="_fd-config-title">
        <slot name="default"></slot>
    </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
    name: 'ConfigTitle',
});
</script>

<style>
._fd-config-title{
    display: flex;
    align-items: center;
    margin: 26px 0 16px;
    font-size: 14px;
    padding-left: 10px;
    position: relative;
}
._fd-config-title:before{
    content: ' ';
    width: 2px;
    height: 20px;
    position: absolute;
    left: 0;
    display: block;
    background-color: var(--fc-style-color-1);
}
</style>
