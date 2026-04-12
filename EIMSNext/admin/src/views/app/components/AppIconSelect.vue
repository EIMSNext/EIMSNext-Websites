<template>
    <div class="icon-select" style="width: 315px">
        <!-- <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="系统图标" name="svg"> -->
                <div class="color-bar" aria-label="颜色">
                    <span v-for="c in colorOptions" :key="c.value" class="color-chip" :style="{
                        backgroundColor: c.value,
                        border: selectedColor === c.value ? '2px solid #333' : 'none',
                    }" @click="selectColor(c.value)" />
                </div>
                <el-scrollbar height="300px">
                    <div class="icon-grid">
                        <div v-for="icon in sampleIcons" :key="'svg-' + icon" class="icon-tile"
                            :style="{ backgroundColor: selectedColor }" @click="selectIcon(icon)">
                            <span
                                style="width: 100%;height: 100%;display: flex;align-items: center;justify-content: center;">
                                <et-icon :icon="icon" color="#ffffff" size="28px" />
                            </span>
                        </div>
                    </div>
                </el-scrollbar>
            <!-- </el-tab-pane>
            <el-tab-pane label="自定义图标" name="custom">
                <div>todo</div>
            </el-tab-pane>
        </el-tabs> -->
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    icon?: string,
    iconColor?: string
}>();

const activeTab = ref("svg");
const sampleIcons = ref<string[]>([]);

function loadIcons() {
    sampleIcons.value = [];
    //load iconfont
    let iconfontIcons: string[] = [
        "icon-appdefault",
        "icon-formdefault",
        "icon-flowdefault",
        "icon-ledgerdefault",
        "icon-dshdefault",
    ];

    //load svg
    let svgIcons: string[] = [];
    const icons = import.meta.glob("../../../assets/icons/*.svg");
    for (const path in icons) {
        const iconName = path.replace(/.*\/(.*)\.svg$/, "$1");
        svgIcons.push(iconName);
    }

    sampleIcons.value = [...iconfontIcons, ...svgIcons];
}

function handleTabClick(tabPane: any) {
    activeTab.value = tabPane.name;
}

const colorOptions = [
    { name: "orange", value: "#F59E0B" },
    { name: "red", value: "#EF4444" },
    { name: "green", value: "#10B981" },
    { name: "teal", value: "#06B6D4" },
    { name: "blue", value: "#1296db" },
    { name: "purple", value: "#8B5CF6" },
];

const selectedIcon = ref(props.icon)
const selectedColor = ref<string>(props.iconColor || colorOptions[colorOptions.length - 1].value);

const selectColor = (color: string) => {
    selectedColor.value = color;
    emitOk()
};

const emit = defineEmits(["ok"]);
const selectIcon = (icon: string) => {
    selectedIcon.value = icon;
    emitOk()
};

const emitOk = () => {
    emit("ok", { icon: selectedIcon.value, iconColor: selectedColor.value });
}

onMounted(() => {
    loadIcons();
});
</script>

<style scoped lang="scss">
.icon-select {
    display: block;
}

.color-bar {
    height: 64px;
    padding: 10px;
    width: 100%;

    .color-chip {
        border-radius: 17px;
        cursor: pointer;
        display: inline-block;
        height: 35px;
        margin: 0 6px;
        width: 35px;
    }

    .color-chip[aria-pressed="true"] {
        outline: 2px solid #333;
    }
}

.icon-grid {
    background: var(--et-bg-hover);
    border-radius: 3px;
    bottom: 0;
    left: 0;
    overflow: auto;
    padding: 10px 0 0 5px;
    position: absolute;
    right: 0;
    top: 0px;
}

.icon-tile {
    cursor: pointer;
    display: inline-block;
    margin: 5px;
    border-radius: 8px;
    height: 48px;
    width: 48px;
    vertical-align: middle;

    &:hover {
        transform: translateY(-1px);
    }
}
</style>
