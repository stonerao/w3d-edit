<template>
    <div class="full">
        <div class="full" ref="main"></div>
    </div>
</template>
<script>
import * as echarts from "echarts";
export default {
    data() {
        return {
            chart: null,
        };
    },
    mounted() {
        const ref = this.$refs["main"];

        this.chart = echarts.init(ref);

        this.chart.setOption({
            title: {
                text: "ECharts 入门示例",
            },
            tooltip: {},
            xAxis: {
                data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"],
            },
            yAxis: {},
            series: [
                {
                    name: "销量",
                    type: "bar",
                    data: [5, 20, 36, 10, 10, 20],
                },
            ],
        });
    },
};
</script>
<style lang="less" scoped>
</style>
