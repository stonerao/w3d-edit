<!-- @format -->

<template>
	<div>
		<div class="m-box" v-for="(item, index) in material" :key="item.uuid">
			<div class="m-box-title"  @click="tabMaterial(index)">
				<span class="tree-icon">
					<a-icon v-if="shows[index]" type="plus" style="fontSize:11px" />
					<a-icon v-else type="minus" style="fontSize:11px" />
				</span>
				<span>{{ item.name }}</span>
			</div>
			<div class="m-box-node" v-show="shows[index]">
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6" class="e-c-basic">
						opacity:
					</a-col>
					<a-col :span="12">
						<a-input-number v-model="item.opacity" :max="1" :min="0" size="small" />
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						side:
					</a-col>
					<a-col :span="12">
						<a-select size="small" style="width: 120px" v-model="item.side">
							<a-select-option :value="0">
								Front
							</a-select-option>
							<a-select-option :value="1">
								Back
							</a-select-option>
							<a-select-option :value="2">
								Double
							</a-select-option>
						</a-select>
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						blending:
					</a-col>
					<a-col :span="12">
						<a-select size="small" style="width: 120px" v-model="item.blending">
							<a-select-option :value="0">
								NoBlending
							</a-select-option>
							<a-select-option :value="1">
								NormalBlending
							</a-select-option>
							<a-select-option :value="2">
								AdditiveBlending
							</a-select-option>
							<a-select-option :value="3">
								SubtractiveBlending
							</a-select-option>
							<a-select-option :value="4">
								MultiplyBlending
							</a-select-option>
						</a-select>
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						transparent:
					</a-col>
					<a-col :span="12">
						<a-switch v-model="item.transparent" />
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						depthTest:
					</a-col>
					<a-col :span="12">
						<a-switch v-model="item.depthTest" />
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						depthWrite:
					</a-col>
					<a-col :span="12">
						<a-switch v-model="item.depthWrite" />
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						wireframe:
					</a-col>
					<a-col :span="12">
						<a-switch v-model="item.wireframe" />
					</a-col>
				</a-row>
				<a-row :gutter="16" class="m-b-box">
					<a-col :span="6">
						color:
					</a-col>
					<a-col :span="12">
						<a-input @change="onColorChange(item, $event)" pressEnter size="small" placeholder="color" :value="item.color.getStyle()" />
					</a-col>
					<a-col :span="4">
						<div @click="selectColor(item, $event)" class="m-b-colors" :style="{ background: colors[index] }"></div>
					</a-col>
				</a-row>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	name: "Tree",
	props: {
		material: Array,
	},
	data: function() {
		return {
			colors: [],
			shows: [],
		};
	},
	mounted() {
		this.updateColors();
		this.shows = this.material.map((mat) => {
			return true;
		}); 
	},
	methods: {
		onColorChange(material, event) {
			const { value } = event.target;
			material.color.setStyle(value);
			this.updateColors();
		},
		updateColors() {
			this.colors = this.material.map((mat) => {
				return mat.color.getStyle();
			}); 
			this.$forceUpdate();
		},
		tabMaterial(index) {
			this.shows[index] = !this.shows[index];
			this.$forceUpdate();
		},
		// 选择颜色
		selectColor(material, $event) { 
			const option = {
				left: $event.x - 510 + 'px',
				top: $event.y - 340 + 'px'
			}
			this.$emit("selectColor", option, (color) => {
				material.color.setStyle(color.hex);
				this.updateColors();
			})
		}
	},
	watch:{
		material() {
			this.updateColors();
		}
	}
};
</script>

<style scoped lang="less">
.m-box {
	line-height: 24px;
}
.m-b-box {
	margin: 3px 0;
	padding-left: 10px;
}
.tree-name {
	cursor: pointer;
}
.m-box-title {
	background: #efefef;
	cursor: pointer;
}
.m-box-icon {
	display: inline-block;
	width: 12px;
}
.m-b-colors {
	display: inline-block;
	width: 22px;
	height: 22px;
	border-radius: 4px;
	border: 1px solid #adadad;
}
.tree-icon {
	display: inline-block;
	width: 12px;
}
</style>
