<!-- @format -->

<template>
	<div class="tree-items">
		<div class="tree-name" @click="clickNode">
			<span class="tree-icon">
				<a-icon v-if="isShow && items.children.length != 0" type="plus" style="fontSize:11px" />
				<a-icon v-if="!isShow && items.children.length != 0" type="minus" style="fontSize:11px" />
			</span>
			<span @click="clickName(items.name)"> {{ items.name || "-" }} </span>
		</div>
		<div class="tree-item" v-show="isShow">
			<t-tree v-for="(item, index) in items.children" :key="index" :items="item" @clickName="clickName"> </t-tree>
		</div>
	</div>
</template>
<script>
export default {
	name: "Tree",
	props: {
		items: Object,
	},
	data: function() {
		return {
			isShow: true,
		};
	},
	mounted() {},
	methods: {
		clickNode() {
			this.isShow = !this.isShow;
		},
		clickName(name) { 
			this.$emit("clickName", name)
		}
	},
};
</script>

<style scoped lang="less">
.tree-items {
	margin-left: 10px;
}
.tree-name {
	cursor: pointer;
}
.tree-icon {
	display: inline-block;
	width: 12px;
}
</style>
