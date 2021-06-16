<!-- @format -->

<template>
    <div>
        <a-layout>
            <a-layout-header
                class="edit-header"
                style="height: 42px; line-height: 42px"
            >
                <!-- 左侧 -->
                <div>
                    <span class="head-span">
                        <label for="exportModel">添加模型</label>
                    </span>
                    <input
                        type="file"
                        accept=".fbx"
                        @change="exportModel"
                        id="exportModel"
                        hidden
                    />
                    <span class="head-span" @click="exportConfig"> 导出 </span>
                    <span class="head-span">
                        <label for="exportOption">导入</label>
                        <!-- 导入配置 -->
                        <input
                            type="file"
                            accept=".json"
                            @change="exportOption"
                            id="exportOption"
                            hidden
                        />
                    </span>
                    <span class="head-span"> </span>
                </div>
                <!-- 右侧 -->
                <div class="edit-header-right">
                    <span
                        class="head-span"
                        @click="pointEditVisible = !pointEditVisible"
                        >点位编辑</span
                    >
                </div>
            </a-layout-header>
            <a-layout-content class="edit-content">
                <div class="edit-content-box edit-content-left">
                    <div
                        class="edit-block"
                        v-on:drop="drop($event)"
                        v-on:dragover="allowDrop($event)"
                    >
                        <t-frame
                            ref="webgl"
                            class="full"
                            @getTree="getTree"
                            @nodeClick="nodeClick"
                            @effects="updateEffect"
                        >
                            <template>
                                <div></div>
                            </template>
                        </t-frame>
                        <div class="flatPlan" v-if="flatVisible">
                            <!-- v-on:dragstart="drag($event, {tid: item.tid, name: item.name}, 'com')" draggable="true"  -->
                            <div
                                @mousedown="comDown"
                                @mousemove="comMove(item, $event)"
                                @mouseup="comcomUp"
                                draggable="false"
                                class="flatCom"
                                v-for="(item, index) in flatComponentHtml"
                                :key="item.name + index"
                                :style="item.style"
                            >
                                <component :is="item.componentName"></component>
                                <!--  -->
                                <div
                                    class="full curCom"
                                    draggable="false"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <!-- 左下参数设置 -->
                    <div class="edit-option-block"></div>
                </div>
                <div class="edit-content-box edit-content-right">
                    <div class="e-c-top">
                        <ul class="e-c-head">
                            <li
                                @click="ctrlType = 1"
                                :class="ctrlType == 1 ? 'active' : ''"
                            >
                                场景
                            </li>
                            <li
                                @click="ctrlType = 2"
                                :class="ctrlType == 2 ? 'active' : ''"
                            >
                                组件库
                            </li>
                            <li
                                @click="ctrlType = 3"
                                :class="ctrlType == 3 ? 'active' : ''"
                            >
                                效果库
                            </li>
                            <li
                                @click="ctrlType = 4"
                                :class="ctrlType == 4 ? 'active' : ''"
                            >
                                组件列表
                            </li>
                        </ul>
                        <div class="e-c-box">
                            <!-- 场景 -->
                            <t-scroll v-if="ctrlType === 1">
                                <template v-slot:main>
                                    <div>
                                        <t-tree
                                            v-for="(item, index) in tree"
                                            :key="index"
                                            :items="item"
                                            @clickName="sceneName"
                                        >
                                        </t-tree>
                                    </div>
                                </template>
                            </t-scroll>
                            <!-- 组件库 -->
                            <t-scroll v-if="ctrlType === 2">
                                <template v-slot:main>
                                    <div>
                                        <div>
                                            <a-radio-group
                                                v-model="componentDragType"
                                            >
                                                <a-radio-button :value="1">
                                                    3D
                                                </a-radio-button>
                                                <a-radio-button :value="2">
                                                    2D
                                                </a-radio-button>
                                            </a-radio-group>
                                        </div>
                                        <div v-if="componentDragType === 1">
                                            <div
                                                v-for="item in componentsArray"
                                                :key="item.id"
                                                class="e-c-coms"
                                                draggable="true"
                                                v-on:dragstart="
                                                    drag($event, item, 'three')
                                                "
                                            >
                                                <span class="e-c-coms-icon">
                                                    <a-icon
                                                        :type="
                                                            item.icon ||
                                                            'question'
                                                        "
                                                    />
                                                </span>
                                                <span class="e-c-coms-text">
                                                    {{ item.name }}
                                                </span>
                                            </div>
                                        </div>
                                        <div v-if="componentDragType === 2">
                                            <!-- flatComponent -->
                                            <div
                                                v-for="item in flatComponent"
                                                :key="item.id"
                                                class="e-c-coms"
                                                draggable="true"
                                                v-on:dragstart="
                                                    drag(
                                                        $event,
                                                        {
                                                            id: item.id,
                                                            name: item.name,
                                                        },
                                                        'flat'
                                                    )
                                                "
                                            >
                                                <span class="e-c-coms-icon">
                                                    <a-icon
                                                        :type="
                                                            item.icon ||
                                                            'question'
                                                        "
                                                    />
                                                </span>
                                                <span class="e-c-coms-text">
                                                    {{ item.name }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </t-scroll>
                            <!-- 效果库 -->
                            <t-scroll v-if="ctrlType === 3">
                                <template v-slot:main>
                                    <div>
                                        <div
                                            v-for="item in EffectsArray"
                                            :key="item.id"
                                            class="e-c-coms"
                                            @click="effectComClick(item)"
                                        >
                                            <span class="e-c-coms-icon">
                                                <a-icon
                                                    :type="
                                                        item.icon || 'question'
                                                    "
                                                />
                                            </span>
                                            <span class="e-c-coms-text">
                                                {{ item.name }}({{ item.type }})
                                            </span>
                                        </div>
                                    </div>
                                </template>
                            </t-scroll>
                            <!-- 组件列表 -->
                            <t-scroll v-if="ctrlType === 4">
                                <template v-slot:main>
                                    <ul class="e-c-list">
                                        <li
                                            v-for="(
                                                item, index
                                            ) in componentsList"
                                            :key="item.nowId"
                                            :class="
                                                item.nowId == componentsId
                                                    ? 'line-acitve'
                                                    : ''
                                            "
                                            @click="componentsId = item.nowId"
                                        >
                                            <span>{{ item.name }}</span>
                                            <a-popconfirm
                                                title="Are you sure？"
                                                @confirm="
                                                    deleteComponent(item, index)
                                                "
                                            >
                                                <a-icon
                                                    slot="icon"
                                                    type="question-circle-o"
                                                    style="color: red"
                                                />
                                                <a-icon
                                                    type="delete"
                                                    style="
                                                        font-size: 14px;
                                                        margin-top: 5px;
                                                        margin-right: 10px;
                                                    "
                                                />
                                            </a-popconfirm>
                                        </li>
                                    </ul>
                                </template>
                            </t-scroll>
                        </div>
                    </div>
                    <div class="e-c-bottom">
                        <ul class="e-c-head">
                            <li
                                @click="optionType = 1"
                                :class="optionType == 1 ? 'active' : ''"
                            >
                                基础
                            </li>
                            <li
                                @click="optionType = 2"
                                :class="optionType == 2 ? 'active' : ''"
                            >
                                配置
                            </li>
                        </ul>
                        <div class="e-c-box">
                            <t-scroll v-if="optionType == 1 && currMesh">
                                <template v-slot:main>
                                    <div>
                                        <!-- name -->
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                name:
                                            </a-col>
                                            <a-col :span="12" class="e-c-basic">
                                                {{ mesh.name }}
                                            </a-col>
                                        </a-row>
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                position:
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.position.x"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.position.y"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.position.z"
                                                    size="small"
                                                />
                                            </a-col>
                                        </a-row>
                                        <!-- rotation -->
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                rotation:
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.rotation.x"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.rotation.y"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.rotation.z"
                                                    size="small"
                                                />
                                            </a-col>
                                        </a-row>
                                        <!-- scale -->
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                scale:
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.scale.x"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.scale.y"
                                                    size="small"
                                                />
                                            </a-col>
                                            <a-col :span="6">
                                                <a-input
                                                    v-model="mesh.scale.z"
                                                    size="small"
                                                />
                                            </a-col>
                                        </a-row>
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                click:
                                            </a-col>
                                            <a-col :span="12">
                                                <a-button
                                                    size="small"
                                                    @click="
                                                        setMeshEvent('onClick')
                                                    "
                                                    >配置</a-button
                                                >
                                            </a-col>
                                        </a-row>
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                ready:
                                            </a-col>
                                            <a-col :span="12">
                                                <a-button
                                                    size="small"
                                                    @click="
                                                        setMeshEvent('onReady')
                                                    "
                                                    >配置</a-button
                                                >
                                            </a-col>
                                        </a-row>
                                        <a-row :gutter="16" class="e-b-box">
                                            <a-col :span="6" class="e-c-basic">
                                                效果列表:
                                            </a-col>
                                            <a-col :span="15">
                                                <ul class="b-e-lists">
                                                    <li
                                                        v-for="item in effectsList"
                                                        :key="item.name"
                                                        class="b-e-list"
                                                    >
                                                        <div>
                                                            {{ item.name }}
                                                        </div>
                                                        <div>
                                                            <a-popconfirm
                                                                title="Are you sure？"
                                                                @confirm="
                                                                    deleteMeshEffect(
                                                                        item
                                                                    )
                                                                "
                                                            >
                                                                <a-icon
                                                                    slot="icon"
                                                                    type="question-circle-o"
                                                                    style="
                                                                        color: red;
                                                                    "
                                                                />
                                                                <a-icon
                                                                    type="delete"
                                                                    style="
                                                                        font-size: 14px;
                                                                        margin-top: 5px;
                                                                        margin-right: 10px;
                                                                    "
                                                                />
                                                            </a-popconfirm>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </a-col>
                                        </a-row>
                                    </div>
                                </template>
                            </t-scroll>
                            <t-scroll v-if="optionType == 2">
                                <template v-slot:main>
                                    <t-material
                                        :material="materials"
                                        @selectColor="selectColor"
                                    ></t-material>
                                </template>
                            </t-scroll>
                        </div>
                    </div>
                </div>
            </a-layout-content>
        </a-layout>
        <a-modal
            title="Title"
            :visible="modelVisible"
            :confirm-loading="confirmLoading"
            @ok="handleOk"
            @cancel="handleCancel"
        >
            <div
                class=""
                v-for="(item, index) in componentsOption"
                :key="index"
            >
                <div class="c-mode-item">
                    <a-input
                        :addon-before="item.name"
                        default-value=""
                        v-model="item.value"
                    />
                </div>
            </div>
        </a-modal>
        <a-modal
            :bodyStyle="{ padding: 0 }"
            v-model="codeVisibie"
            title="Code Dev"
            @ok="codeOk"
        >
            <t-codemirror ref="cmEditor" v-model="code" :options="cmOptions" />
        </a-modal>
        <t-alertModel ref="edit-model"></t-alertModel>
        <!-- 选取颜色 -->
        <div
            v-if="colorVisible"
            class="index-select-color"
            :style="colorSelectModel"
        >
            <photoshop-picker
                ref="color"
                @ok="colorOk"
                @cancel="colorCancel"
                v-model="color.color"
            ></photoshop-picker>
        </div>
        <!-- 点位编辑 -->
        <t-pointEdit
            ref="pointEdit"
            v-if="pointEditVisible"
            :data="pointData"
            @getPoint="getPointVal"
            @activePoint="activePoint"
            @setOption = "pointSetOption"
        ></t-pointEdit>
    </div>
</template>
<script>
import Vue from "vue";
import Frame from "../show/index.vue";
import Material from "../show/material.vue";
import componentsArray from "@/webgl/config/components";
import EffectsArray from "@/webgl/config/effects";
import alertModel from "@/components/alertModel";
import pointEdit from "@/components/pointEdit";
import { codemirror } from "vue-codemirror";
import { disposeNode } from "@/webgl/utils/utils";
import { download } from "@/utils/downLoad";
import { Photoshop } from "vue-color";
import flatComponent from "@/chart/index";
import "codemirror/lib/codemirror.css";
export default {
    name: "index",
    data() {
        return {
            ctrlType: 2,
            optionType: 1,
            tree: [],
            componentsArray: componentsArray,
            EffectsArray: EffectsArray,
            modelVisible: false,
            confirmLoading: false,
            componentsOption: [],
            currentOption: {},
            currentEvent: {},
            mesh: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 0, y: 0, z: 0 },
                name: "",
            },
            currMesh: null,
            materials: [],
            effectsList: [],
            //添加的组件列表
            componentsList: [],
            componentsId: null, // 点击的当前ID
            componentDragType: 1,
            // 模型加载名称
            modelUrls: [],

            editOption: null,
            // 编辑器
            codeVisibie: false,
            basicCode: `function(option) {
	const { event, mesh, render } = option;
}`,
            codeType: "",
            code: "",
            cmOptions: {
                tabSize: 4,
                mode: "text/javascript",
                theme: "base16-dark",
                lineNumbers: true,
                line: true,
                // more CodeMirror options...
            },
            exportTypeName: "W3D_STONERAO",
            colorVisible: false,
            color: {
                key: "",
                color: "",
            },
            colorSelectCallback: null,
            colorSelectModel: {},
            flatComponent: flatComponent,
            initFlatComponent: [], // 在当前页面中注册的组件信息
            flatVisible: true, // 2d是否展示
            flatComponentHtml: [],

            mouseOption: {
                isDown: false,
                scrollTop: 0,
                scrollLeft: 0,
                startX: 0,
                startY: 0,
            },

            pointEditVisible: false,
            pointData: [],
        };
    },
    mounted() {},
    methods: {
        // 平面组件拖动
        comDown(event) {
            event.preventDefault();
            this.mouseOption.isDown = true;
        },
        // 平面组件拖动
        comMove(com, $event) {
            if (!this.mouseOption.isDown) return false;
            console.log(com);
            console.log($event);
            com.left += $event.movementX;
            com.top += $event.movementY;

            const headHegiht = 42;

            com.style.left = com.left + "px";
            com.style.top = com.top - 42 + "px";
        },
        // 平面组件拖动
        comcomUp() {
            this.mouseOption.isDown = false;
        },
        // 起始拖拽
        drag(event, data, type) {
            data._type = type;
            event.dataTransfer.setData("data", JSON.stringify(data));
        },
        // 拖拽结束
        drop(event) {
            event.preventDefault();
            const data = event.dataTransfer.getData("data");
            try {
                const _data = JSON.parse(data);
                const { _type } = _data;
                const headHegiht = 42;
                switch (_type) {
                    case "flat":
                        // 平面组件
                        {
                            // 找到2D组件注入
                            const { id, name } = _data;
                            const com = this.flatComponent.filter(
                                (elem) =>
                                    elem.id === id && elem.name === elem.name
                            )[0];
                            if (!com) return false;
                            // 从缓存中找到组件
                            let component = this.initFlatComponent.filter(
                                (e) => e.name === name && e.id === id
                            )[0]; // 找到对应的组件
                            const hasComponent = !!component; //
                            // 如果没有
                            if (!component) {
                                component = this.flatComponent.filter(
                                    (e) => e.name === name && e.id === id
                                )[0];
                                this.initFlatComponent.push(component);
                                console.log(component.component);
                                Vue.component(
                                    component.componentName,
                                    component.component
                                );
                            }
                            const _option = component.option;

                            this.flatComponentHtml.push(
                                Object.assign(
                                    {
                                        style: {
                                            width: _option.width + "px",
                                            height: _option.height + "px",
                                            left: event.x + "px",
                                            top: event.y - headHegiht + "px",
                                        },
                                        left: event.x,
                                        top: event.y,
                                        tid: Date.now(),
                                    },
                                    component
                                )
                            );
                            // 已有组件
                            if (hasComponent) {
                            } else {
                            }
                        }
                        break;
                    case "three":
                        // 3D组件
                        if (_data.options !== undefined) {
                            this.$refs["edit-model"].setOptionStart(
                                _data,
                                (option) => {
                                    option.nowId = Date.now();
                                    this.$refs["webgl"].addEffect(
                                        "component",
                                        option,
                                        event
                                    );
                                    this.componentsList.push(option);
                                }
                            );
                        }
                        break;
                    case "com":
                        {
                            //
                            const { tid, name } = _data;
                            // 找到当前组件
                            const component = this.flatComponentHtml.filter(
                                (e) => e.tid === tid && e.name === name
                            )[0];
                            if (component) {
                                // 计算差
                                const left =
                                    component.left + (event.x - component.left);
                                const top =
                                    component.top + (event.y - component.top);
                                component.style.left = left + "px";
                                component.style.top = top - headHegiht + "px";
                            }
                        }
                        break;
                }
            } catch (err) {
                console.warn(err);
            }
        },
        // 绑定onresize事件
        onResize() {},
        // move
        allowDrop(event) {
            event.preventDefault();
        },
        getTree(data) {
            // 获取场景的树状数据
            this.tree = Array.isArray(data) ? data : [];
        },
        handleOk() {
            this.confirmLoading = true;
            this.componentsOption.forEach((elem) => {
                this.currentOption.options[elem.name] = parseFloat(elem.value);
            });
            // 注册nowId
            this.currentOption.nowId = Date.now();
            this.$refs["webgl"].addEffect(
                "component",
                this.currentOption,
                this.currentEvent
            );
            this.confirmLoading = false;
            this.modelVisible = false;

            this.componentsList.push(this.currentOption);
        },
        handleCancel() {
            this.modelVisible = false;
        },
        // 点击
        nodeClick(obj) {
            this.currMesh = obj;
            this.mesh.position = obj.position;
            this.mesh.scale = obj.scale;
            this.mesh.rotation = obj.rotation;
            this.mesh.name = obj.name;

            this.materials = [];

            this.updateEffect("effectList");
            if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => {
                    this.materials.push(mat);
                });
            } else {
                if (obj.material) {
                    this.materials.push(obj.material);
                }
            }
        },

        //列表
        // 删除组件
        deleteComponent(item, index) {
            this.$refs["webgl"].deleteComponent(item);
            this.componentsList = this.componentsList.filter(
                (e, i) => i != index
            );
        },

        // 编辑器确定
        codeOk() {
            delete this.currMesh._option[this.codeType];
            eval(`this.currMesh._option.${this.codeType} = ${this.code}`);
            this.codeVisibie = false;
        },
        // 颜色选择框
        colorOk() {
            // this.option.options[this.color.key] = this.color.color.hex;
            this.colorVisible = false;
            this.colorSelectCallback &&
                this.colorSelectCallback(this.color.color);
        },
        colorCancel() {
            console.log(this.color);
            this.colorVisible = false;
        },
        // 选择颜色
        selectColor(option, callback) {
            this.colorSelectModel = option;
            this.colorVisible = true;
            this.colorSelectCallback = callback;
        },
        // 设置当前对象的点击事件
        setMeshEvent(type) {
            this.codeType = type;
            // 判断当前对象是否含有点击事件
            if (!this.currMesh) return false;

            if (this.currMesh._option[type]) {
                this.code = String(this.currMesh._option[type]);
            } else {
                this.code = this.basicCode;
            }
            this.codeVisibie = true;
        },
        // 效果组件添加
        effectComClick(item) {
            if (!this.currMesh) {
                this.$message.info("请选择对象！");
                return false;
            }
            this.$refs["edit-model"].setOptionStart(item, (option) => {
                console.log(this.currMesh._option.effects);
                if (this.currMesh._option && this.currMesh._option.effects) {
                    this.currMesh._option.effects = this.currMesh._option.effects.filter(
                        (elem) => elem.func != option.func
                    );
                    this.currMesh._option.effects.push(option);
                }
                this.$refs["webgl"].addEffect("effect", option, this.currMesh);
            });
        },

        // 更新效果列表
        updateEffect(type) {
            if (type === false) return false;
            if (type === "effectList") {
                if (!this.currMesh) return false;
                this.effectsList = this.currMesh.children.filter(
                    (elem) => elem.isEffect
                );
            }
        },
        // 删除效果
        deleteMeshEffect(item) {
            disposeNode(item);
            this.updateEffect("effectList");
        },

        // 加载模型
        exportModel(file) {
            const target = file.target;
            const f = target.files[0];
            if (!f) return false;
            var dataURL = URL.createObjectURL(f);
            // 加载模型
            this.$refs["webgl"].loadModel([dataURL], f.name, () => {
                // 加载完成回调
            });
            // 存储当前加载的文件名称
            this.modelUrls.push(f.name);
        },
        // 导入配置，根据配置生成
        exportOption(file) {
            const target = file.target;
            const ft = target.files[0];
            const typeName = this.exportTypeName;
            // 获取file上传的json数据
            const reader = new FileReader();
            const _this = this;
            reader.readAsText(ft);
            reader.onload = function (f) {
                try {
                    const data = JSON.parse(this.result);
                    // 判断是否是w3d文件
                    if (data.name && data.name == typeName) {
                        _this.parseJsonData(data);
                    }
                } catch (err) {
                    console.log(err);
                }
            };
        },

        // 导出配置
        exportConfig() {
            // 模型
            const model = {
                url: "/model/",
                models: this.modelUrls,
            };
            // 组件列表

            //模型下mesh配置 包含当前节点的点击事件，加载完成事件  当前节点的效果
            const modelConfig = this.$refs[
                "webgl"
            ].handelModel.getModelOption();

            // 整体配置
            const config = {
                model: model,
                components: this.componentsList,
                config: modelConfig,
                name: this.exportTypeName,
            };
            download("w3d.json", JSON.stringify(config));
        },

        // 解析读取的JSON数据
        parseJsonData(data) {
            // model 样式， 组件   设置
            const { model, components, config } = data;

            const { models, url } = model;
            let nodelIndex = 0;
            models.forEach((m) => {
                const _url = url + m;
                this.$refs["webgl"].loadModel([_url], m, () => {
                    // 加载完成回调
                    nodelIndex++;
                    if (nodelIndex === models.length) {
                        setTimeout(() => {
                            this.parseDataLoadEffect(components, config);
                        }, 500);
                    }
                });
            });
        },

        // 加载解析数据对应的效果
        parseDataLoadEffect(components, config) {
            // 加载model
            components.forEach((component) => {
                this.$refs["webgl"].resetAddEffect("component", component);

                // 把组件更新到UI上
                this.componentsList.push(component);
            });
            // 加载 组件
            config.forEach((elem) => {
                const {
                    option,
                    name,
                    position,
                    rotation,
                    scale,
                    material,
                } = elem;
                // 从scene找到mesh
                const { effects } = option;

                const mesh = this.$refs["webgl"].selectFileName(name);

                mesh.position.copy(this.vectorTo(position));
                mesh.rotation.setFromVector3(this.vectorTo(rotation), "XYZ");
                mesh.scale.copy(this.vectorTo(scale));

                effects.forEach((eff) => {
                    this.$refs["webgl"].resetAddEffect("effect", eff, mesh);
                });

                // 配置赋予到模型中
                this.setToMaterial(mesh.material, (mat) => {
                    // get
                    const _config = material.filter(
                        (_mat) => _mat.name === mat.name
                    )[0];
                    if (_config === undefined) return false;

                    const keys = [
                        "opacity",
                        "side",
                        "blending",
                        "transparent",
                        "depthWrite",
                        "depthTest",
                        "wireframe",
                        "color",
                    ];

                    // setValues
                    keys.forEach((key) => {
                        if (mat[key] !== undefined) {
                            // console.log(mat)
                            if (key === "color") {
                                console.log(mat[key]);
                                mat[key].setStyle(_config[key]);
                            } else {
                                mat[key] = _config[key];
                            }
                        }
                    });
                });
            });
        },

        // 处理材质
        setToMaterial(material, callback) {
            // 给材质添加默认效果shdaer
            if (Array.isArray(material)) {
                material.forEach((mat) => {
                    callback(mat);
                });
            } else {
                callback(material);
            }
        },

        // 向量转换为number
        vectorTo(vec) {
            const keys = Object.keys(vec);
            keys.forEach((key) => {
                vec[key] = parseFloat(vec[key]);
            });
            console.log(vec);
            return vec;
        },

        // 获取名称
        sceneName(name) {
            this.$refs["webgl"].nameSelectNode(name);
        },

        // 获取点位数据
        getPointVal(state) {
            const callback = state
                ? (point) => {
                    const data = this.$refs["webgl"].handelPoint.add(point);
                    
                    //  this.$refs["pointEdit"].updateList(data);
                    this.pointData = data;
                  }
                : null;
            this.$refs["webgl"].handelModel.setRayPointMode(state, callback);
        },
        // 点位信息设置
        pointSetOption(type, val) {
            this.$refs["webgl"].handelPoint.setOption(type, val);
        },
        // 点击点显示
        activePoint(position) { 
            this.$refs["webgl"].handelPoint.active(position);
        }
    },
    watch: {
        pointEditVisible(val) {
            if (!val) {
                // pointEdit
                this.$refs["pointEdit"].overEnd();
                
            }
            this.$refs["webgl"].handelPoint.setOption("visible", val);
        },
    },
    components: {
        "t-frame": Frame,
        "t-material": Material,
        "t-codemirror": codemirror,
        "t-alertModel": alertModel,
        "t-pointEdit": pointEdit,
        "photoshop-picker": Photoshop,
    },
};
</script>
<style lang="less" scoped>
@header-height: 42px;
@content-right-width: 300px;
@border-basic: 1px solid #adadad;
@list-height: 24px;
.edit-header {
    color: #fff;
    height: 42px;
    display: flex;
    justify-content: space-between;
    .edit-header-right {
        margin-right: @content-right-width;
    }
}
.head-span {
    margin-right: 20px;
    cursor: pointer;
    user-select: none;
}
.edit-content {
    position: absolute;
    top: @header-height;
    left: 0;
    right: 0;
    bottom: 0;
    .edit-content-box {
        position: absolute;
        top: 0;
        bottom: 0;
    }
    .edit-content-left {
        left: 0;
        right: @content-right-width - 1;
        overflow: hidden;
    }
    .edit-content-right {
        border-left: @border-basic;
        width: @content-right-width - 1;
        right: 0;
    }
    .e-c-top {
        position: absolute;
        top: 0;
        bottom: 50%;
        left: 0;
        right: 0;
        border-bottom: @border-basic;
    }
    .e-c-bottom {
        position: absolute;
        top: 50%;
        right: 0;
        left: 0;
        bottom: 0;
    }
    .e-c-head {
        display: flex;
        padding: 0;
        height: @list-height;
        border-bottom: @border-basic;
        > li {
            flex: 1;
            line-height: @list-height;
            text-indent: 10px;
            cursor: pointer;
            transition: all 0.2s;
            &:hover {
                color: #ff0000;
                background: #ededed;
            }
        }
    }
    .e-c-box {
        position: absolute;
        top: @list-height + 1;
        bottom: 0;
        left: 0;
        right: 0;
        overflow: hidden;
    }
    @coms-height: 90px;
    @com-ts-height: 24px;
    .e-c-coms {
        position: relative;
        width: 33.33%;
        height: @coms-height;
        text-align: center;
        float: left;
        cursor: pointer;
        &:hover {
            background-color: #ededed;
        }
    }
    .e-c-coms-icon {
        height: @coms-height - @com-ts-height;
        line-height: @coms-height - @com-ts-height;
        font-size: 34px;
        width: 100%;
        position: relative;
        display: inline-block;
    }
    .e-c-coms-text {
        height: @com-ts-height;
        line-height: @com-ts-height;
        display: inline-block;
        width: 100%;
    }
}
.c-mode-item {
    margin-bottom: 9px;
}
.e-c-basic {
    line-height: 24px;
}
.e-b-box {
    margin: 4px 0px;
}
.e-c-list {
    padding: 0;
    margin: 0;
    li {
        padding-left: 12px;
        line-height: 24px;
        display: flex;
        justify-content: space-between;
        &:hover {
            background: #efefef;
            color: #ff0000;
            cursor: pointer;
        }
    }
    li.line-acitve {
        color: #ff2222;
    }
}
.b-e-lists {
    padding: 0;
}
.b-e-list {
    position: relative;
    display: flex;
    line-height: 24px;
    > div {
        vertical-align: middle;
    }
    > div:first-child {
        margin-right: 20px;
    }
}
.index-select-color {
    position: absolute;
}
.flatPlan {
    position: absolute;
    left: 0;
    right: 0;
}
.flatCom {
    position: absolute;
    left: 0;
    top: 0;
}
.curCom {
    cursor: pointer;
    &:hover {
        background: #7bb3da3d;
        box-shadow: 0px 0px 0px 1px #0690d2;
    }
}
@block-height: 35px;
.edit-block {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: @block-height;
}
.edit-option-block {
    height: @block-height;
    left: 0;
    bottom: 0;
    right: 0;
    position: absolute;
    background: #9e9e9e;
    border-top: 1px solid #aaa;
}
</style>
