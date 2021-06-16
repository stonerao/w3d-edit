<!-- @format -->

<!-- 生成动态alert model -->
<template>
	<a-modal :bodyStyle="{ padding: '0 15px' }" v-model="visible" title="Code Dev" @ok="codeOk">
		<div v-for="key in optionModelKyes" :key="key" class="alert-list">
			<!-- number -->
			<div v-if="option.optionsModel[key] == 'number'">
				<span class="edit-name">{{ key }}</span>
				<a-input-number class="edit-inp" v-model="option.options[key]" size="small" />
			</div>
			<div v-if="option.optionsModel[key] == 'string'">
				<span class="edit-name">{{ key }}</span>
				<a-input class="edit-inp" v-model="option.options[key]" size="small" />
			</div>

			<div v-if="option.optionsModel[key] == 'boolean'">
				<span class="edit-name">{{ key }}</span>
				<a-switch v-model="option.options[key]" size="small" />
			</div>

			<div v-if="option.optionsModel[key] == 'color'">
				<span class="edit-name">{{ key }}</span>
				<div class="color-show" :style="{ background: option.options[key] }" @click="selectColor(key, option.options[key])"></div>
			</div>
			<div v-if="option.optionsModel[key] == 'upload'">
				<span class="edit-name">{{ key }}</span>
				<input class="uploadJSON" type="file" @change="handleChange(key, $event)" />
			</div>
		</div>
		<div class="select-color" v-if="colorVisible">
			<photoshop-picker ref="color" @ok="colorOk" @cancel="colorCancel" v-model="color.color"></photoshop-picker>
		</div>
	</a-modal>
</template>
<script>
import { Photoshop } from "vue-color";
export default {
	name: "scroll",
	props: {
		options: Object,
		optionModel: Object,
	},
	data() {
		return {
			visible: false,
			callback: () => {},
			option: {},
			optionModelKyes: [],
			colorVisible: false,
			color: {
				key: "",
				color: "",
			},
		};
	},
	mounted() {},
	methods: {
		codeOk() {
			// 监测是否为空
			const keys = Object.values(this.option.options);
			if (keys.includes("")) {
				this.$message.info("数据或者文件不能为空！");
				return false;
			}
			// 获取所有的input 设置为value=''
			document.querySelectorAll(".uploadJSON").forEach((elem) => {
				elem.value = "";
			});

			this.colorVisible = false;
			this.visible = false;
			this.callback(this.option);
		},
		setOptionStart(option, callback) {
			this.visible = true;
			this.option = option;
			this.callback = callback;
			if (option.optionsModel) {
				this.optionModelKyes = Object.keys(option.optionsModel);
			}
		},
		selectColor(key, color) {
			this.color = {
				key: key,
				color: color,
			};
			this.colorVisible = true;
		},
		colorOk() {
			this.option.options[this.color.key] = this.color.color.hex;
			this.colorVisible = false;
		},
		colorCancel() {
			this.colorVisible = false;
		},
		handleChange(key, event) {
			var reader = new FileReader(); //new一个FileReader实例
			reader.readAsText(event.target.files[0]);
			reader.onload = () => {
				this.option.options[key] = JSON.parse(reader.result);
			};
		},
	},
	components: {
		"photoshop-picker": Photoshop,
	},
};
</script>

<style scoped>
.edit-name {
	line-height: 24px;
	display: inline-block;
	width: 90px;
}
.edit-inp {
	width: 200px;
	/* margin-left: 10px; */
}
.select-color {
	position: absolute;
	z-index: 100;
}
.color-show {
	position: relative;
	display: inline-block;
	width: 20px;
	height: 20px;
	border: 1px solid #ededed;
	border-radius: 4px;
	top: 4px;
}
.alert-list {
	margin: 8px 0px;
}
</style>
