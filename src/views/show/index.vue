<!-- @format -->

<template>
	<div>
		<div id="cont_frame" class="full"></div>
	</div>
</template>
<script>
import EffectRender from "@/webgl/src/EffectRender.js";
import Transform from "@/webgl/src/Transform.js";
import HandelModel from "@/webgl/src/handelModel.js";
import handelPoint from "@/webgl/src/handelPoint.js";
import Contact from "@/webgl/utils/contact";
import * as EffectsComponents from "@/webgl/effect/index";
import EffectMaterials from "@/webgl/material/index";
export default {
	name: "webgl",
	data() {
		return {
			publicPath: process.env.BASE_URL,
			render: null,
			transForms: null,
			handelModel: null,
			handelEffect: null,
			handelParse: null,
			effectFuns: {},
		};
	},
	mounted() {
		const self = this;
		// render
		this.render = new EffectRender({
			cts: "cont_frame",
			background: {
				color: "#ffffff",
				opacity: 0,
				type: "cubSky", // type: shpereSky-天空球,cubSky-天空盒
			},
			camera: {
				fov: 45,
				near: 1,
				far: 30000,
				position: [0, 556, 328],
				ratio: 1,
			},
			texture: {
				txuePath: "/images/", //路径
				background: {
					//背景
					cubSky: {
						// 天空盒
						px: "cubSky/px.jpg",
						nx: "cubSky/nx.jpg",
						py: "cubSky/py.jpg",
						ny: "cubSky/ny.jpg",
						pz: "cubSky/pz.jpg",
						nz: "cubSky/nz.jpg",
					},
				},
			},
		});
		// transforms
		this.transForms = new Transform({
			renderers: this.render,
		});
		this.handelPoint = new handelPoint({
			 
		});
		// 模型控制
		this.handelModel = new HandelModel({
			renderers: this.render,
			modelUrl: "./model/",
			 model: ["shanghai.FBX"],
			update: () => {
				self.updateTree();
			},
			click: (obj) => {
				self.$emit("nodeClick", obj);
			},
		});

		this.render.addEffect(this.handelModel);
		this.render.addEffect(this.transForms);
		this.render.addEffect(this.handelPoint);
	},
	methods: {
		// 加载模型
		loadModel(dataURL, name, callback) {
			this.handelModel.loadModel(dataURL, name, callback);
		},
		// 更新树状结构
		updateTree() {
			const tree = Contact.updateTree(this.render.scene);
			this.$emit("getTree", tree);
		},
		// 恢复添加的组件和效果
		resetAddEffect(type, option, mesh) {
			let updateType = false;
			switch (type) {
				case "component":
					{
						// 获取世界坐标
						const func = this.handelEffectFunc(option.func);
						// 添加
						func.add && func.add(option.options);
					}
				case "effect":
					{
						if (option.type === "add") {
							const func = this.handelEffectFunc(option.func); 
							func.add && func.add(option.options, mesh);
							// 更新基础的效果列表
							updateType = "effectList";
						} else if (option.type === "shader") {
							EffectMaterials(option, mesh);
						}
					}
					break; 
			}
			// 给父级传递方法
			this.$emit("effects", updateType);
		},
		// 添加效果
		addEffect(type, option, event) {
			let updateType = false;
			switch (type) {
				case "component":
					{
						// 获取世界坐标
						const func = this.handelEffectFunc(option.func);
						const objs = this.render._Events.getIntersects(event);
						const position = this.handelInersects(objs);
						option.options.position = position;
						option.options.nowId = option.nowId;
						// 添加
						func.add && func.add(option.options);
					}
					break;
				case "effect":
					{
						if (option.type === "add") {
							const func = this.handelEffectFunc(option.func);
							func.add && func.add(option.options, event);
							// 更新基础的效果列表
							updateType = "effectList";
						} else if (option.type === "shader") {
							EffectMaterials(option, event);
						}
					}
					break;
			}
			// 给父级传递方法
			this.$emit("effects", updateType);
		},
		handelInersects(objs) {
			if (objs.length > 0) {
				return objs[0].point;
			} else {
				return { x: 0, y: 0, z: 0 };
			}
		},
		handelEffectFunc(name) {
			const funsName = Object.keys(this.effectFuns);
			if (!funsName.includes(name)) {
				this.effectFuns[name] = new EffectsComponents[name]({
					render: this.render,
				});
				this.render.addEffect(this.effectFuns[name]);
			}
			return this.effectFuns[name];
		},
		// 删除组件
		deleteComponent(option) {
			const func = this.effectFuns[option.func];
			func.remove(option.nowId);
		},
		// 通过name选择node
		nameSelectNode(name) {
			this.handelModel.nameToSelectNode(name);
		},
		// 通过name选择node
		selectFileName(name) {
			return this.handelModel.selectFileName(name);
		}
	},
};
</script>
<style lang="less">
 
</style>
