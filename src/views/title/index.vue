<!-- @format -->

<template>
	<div>
		<div ref="Title"></div>
	</div>
</template>
<script>
export default {
	name: "Title",
	data: function() {
		return {};
	},
	mounted() {
		const IMG = new Image();
		IMG.src = "/images/1.png";
		IMG.onload = () => {
			const canvas = this.createTitle({
				title: "测试字体体体体体体体",
				fontSize: 129,
				height: 48,
				color: "#ff0000",
				padding: [15, 32],
				background: IMG, // 支持已加载好
			});
			this.$refs["Title"].appendChild(canvas);
		};
	},
	methods: {
		getWidth(option) {
			const { title, fontSize } = option;
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			ctx.font = fontSize + "px 微软雅黑";
			return ctx.measureText(title).width;
		},
		createTitle(option) {
			const { title, fontSize, height, color, padding, background } = option;
			// 边距
			let _width = this.getWidth(option);
			let _height = height > fontSize ? height : fontSize;

			// 确定高宽
			if (typeof padding === "number") {
				_width += padding * 2;
				_height += padding * 2;
			} else if (Array.isArray(padding)) {
				const pLen = padding.length;
				if (pLen == 2) {
					_width += padding[0] * 2;
					_height += padding[1] * 2;
				}
			}

			const canvas = document.createElement("canvas");
			canvas.width = _width;
			canvas.height = _height;

			const ctx = canvas.getContext("2d");

			// 判断是否有背景图
			if (background) {
				ctx.drawImage(background, 0, 0, _width, _height);
			}

			ctx.font = fontSize + "px 微软雅黑";
			ctx.fillStyle = color;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.fillText(title, _width / 2, _height / 2);
			return canvas;
		},
	},
	components: {},
	computed: {},
};
</script>

<style scoped lang="less"></style>
