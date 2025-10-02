<template>
    <div class="_fc-city">
        <el-select :disabled="disabled" :clearable="clearable" :modelValue="value.p"
                   @update:modelValue="changeProvince" @change="onInput">
            <template v-for="item in province">
                <el-option :label="item.n" :value="item.n"></el-option>
            </template>
        </el-select>
        <el-select :disabled="disabled" :clearable="clearable" v-if="level > 1 && city.length" :modelValue="value.c"
                   @update:modelValue="changeCity" @change="onInput">
            <template v-for="item in city">
                <el-option :label="item.n" :value="item.n"></el-option>
            </template>
        </el-select>
        <el-select :disabled="disabled" :clearable="clearable" v-if="level > 2 && area.length" v-model="value.a"
                   @change="onInput">
            <template v-for="item in area">
                <el-option :label="item.n" :value="item.n"></el-option>
            </template>
        </el-select>
    </div>
</template>

<script>
import {defineComponent, markRaw} from 'vue';

export default defineComponent({
    name: 'FcCity',
    props: {
        modelValue: Array,
        clearable: Boolean,
        disabled: Boolean,
        filter: Function,
        level: {
            type: Number,
            default: 3
        },
        api: String,
    },
    emits: ['update:modelValue', 'change'],
    data() {
        return {
            value: {
                p: '',
                c: '',
                a: ''
            },
            oldValue: '',
            province: [],
        }
    },
    watch: {
        modelValue: {
            handler(val) {
                if (JSON.stringify(val) !== this.oldValue) {
                    this.updateValue();
                }
            },
            deep: true
        }
    },
    computed: {
        city() {
            if (this.value.p) {
                for (let i = 0; i < this.province.length; i++) {
                    if (this.province[i].n === this.value.p) {
                        return this.province[i].d;
                    }
                }
            }
            return [];
        },
        area() {
            if (this.value.c) {
                for (let i = 0; i < this.city.length; i++) {
                    if (this.city[i].n === this.value.c) {
                        return this.city[i]?.d || [];
                    }
                }
            }
            return [];
        }
    },
    methods: {
        updateValue() {
            const str = JSON.stringify(this.modelValue);
            if (str !== JSON.stringify(this.oldValue)) {
                this.value = {
                    p: this.modelValue?.[0] || '',
                    c: this.modelValue?.[1] || '',
                    a: this.modelValue?.[2] || '',
                }
            }
            this.oldValue = str;
        },
        changeProvince(val) {
            this.value.p = val;
            this.value.c = '';
            this.value.a = '';
        },
        changeCity(val) {
            this.value.c = val;
            this.value.a = '';
        },
        onInput() {
            let value = [];
            if (this.value.p) {
                value = [this.value.p, this.value.c, this.value.a].filter(item => !!item);
                if (this.level < 3 && value.length !== this.level) {
                    return;
                }
                if (this.level > 2 && (value.length < 2 || value.length === 2 && this.area.length)) {
                    return;
                }
            }
            this.oldValue = JSON.stringify(value);
            this.$emit('update:modelValue', value);
            this.$emit('change', value);
        },
        loadData(uri) {
            return fetch(uri).then((res) => {
                return res.json();
            }).then((res) => {
                this.province = markRaw(this.filter ? this.filter(res) || [] : res);
            });
        },
    },
    created() {
        if (this.api) {
            this.loadData(this.api);
        } else {
            this.loadData('https://static.form-create.com/res/level.json').catch(() => {
                this.loadData('https://cdn.jsdelivr.net/npm/@province-city-china/level/level.min.json');
            })
        }
    },
    mounted() {
        this.updateValue();
    }
});
</script>

<style>
._fc-city .el-select {
    width: 150px;
}

.form-create-m ._fc-city {
    width: 100%;
}

.form-create-m ._fc-city .el-select {
    width: 100%;
}

.form-create ._fc-city .el-select + .el-select {
    margin-left: 12px;
}
</style>

