<!-- @format -->

<template>
	<div ref="scroll" class="scroll-full">
		<slot name="main"></slot>
	</div>
</template>
<script>
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
export default {
	name: "scroll",
	data() {
		return {
			ps: null,
		};
	},
	mounted() {
		const container = this.$refs["scroll"];
		this.ps = new PerfectScrollbar(container, {
			wheelSpeed: 0.5,
			wheelPropagation: true,
			minScrollbarLength: 1,
		});

		setTimeout(() => {
			this.ps.update();
		}, 200);
	},
	methods: {
		update() {
			this.ps.update();
		},
		destroy() {
			this.ps.destroy();
			this.ps = null;
		},
		updateTop() {
			this.$refs["scroll"].scrollTop = 0;
			this.update();
		},
		updateTopEvent(top) {
			this.$refs["scroll"].scrollTop = top;
			this.update();
		},
	},
};
</script>

<style scoped>
.scroll-full {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	top: 0;
}
</style>
