<template>
    <div class="dash-edit-layout custom-scroll" style="background: rgb(244, 246, 249);">
        <grid-layout ref="gridRef" v-model:layout="state.layout" :col-num="colNum" :col-width="colWidth"
            :row-height="rowHeight" :is-draggable="state.draggable" :is-resizable="state.resizable" :is-mirrored="false"
            :is-bounded="true" :vertical-compact="true" :margin="[10, 10]" :use-css-transforms="true"
            :responsive="true">
            <grid-item v-for="item in state.layout" :x="item.x" :y="item.y" :w="item.w" :h="item.h" :i="item.i"
                :key="item.i" @container-resized="containerResizedEvent" :minW="getMinWidth(item)"
                :minH="getMinHeight(item)" :maxW="60" :maxH="getMaxHeight(item)" drag-ignore-from=".no-drag">
                <DashItemCard v-if="state.items[item.i]" :item-def="state.items[item.i]" :height="item.h"
                    :width="item.w" :is-view="true" />
            </grid-item>
        </grid-layout>
    </div>
</template>
<script lang="ts" setup>
import { GridLayout, GridItem } from "vue-grid-layout-v3";
import { IGridLayoutItem, IGridLayoutState } from "@/components/DashboardDesigner/type";
import { DashboardDef, DashboardItemDef } from "@eimsnext/models";
import { dashboardDefService, dashboardItemDefService } from "@eimsnext/services";
import { useRoute } from "vue-router";
const route = useRoute();

const dashId = route.params.dashId.toString();

const state = reactive<IGridLayoutState>({
    layout: [],
    items: {},
    draggable: false,
    resizable: false,
});
const colNum = ref(24)
const colWidth = ref(150)
const rowHeight = ref(10)

const containerResizedEvent = (i: string | number, newH: number, newW: number, newHPx: number, newWPx: number) => { }

const getMinWidth = (item: IGridLayoutItem) => { return 6 }
const getMinHeight = (item: IGridLayoutItem) => { return 3 }
const getMaxHeight = (item: IGridLayoutItem) => { return 60 }

dashboardDefService.get<DashboardDef>(dashId).then(dash => {
    try {
        const parsedLayout = JSON.parse(dash.layout) || [];
        state.layout.splice(0, state.layout.length);
        state.layout.push(...parsedLayout);

        state.items = {}

        dashboardItemDefService.query<DashboardItemDef>(`$filter=appid eq '${dash.appId}'&DashboardId=${dash.id}`).then(itemDefs => {
            if (itemDefs && itemDefs.length > 0) {
                itemDefs.forEach(x => { state.items[x.layoutId] = x })
            }
        });
    } catch (e) {
        console.error('布局JSON解析失败：', e);
        state.layout.splice(0, state.layout.length); // 解析失败则清空布局
    }
})

</script>
<style lang="scss" scoped></style>