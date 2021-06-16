import BarComponent from './cpmponents/bar/index.vue';
import LineComponent from './cpmponents/line/index.vue';
import PieComponent from './cpmponents/pie/index.vue';
import DotComponent from './cpmponents/dot/index.vue';
import RadarComponent from './cpmponents/radar/index.vue';

export default [
    {
        id: 1,
        icon: "bar-chart",
        name: "柱状图",
        option: {
            width: 400,
            height: 300
        },
        componentName: 'bar-component',
        component: BarComponent
    },
    {
        id: 2,
        icon: "menu",
        name: "aire-chart",
        option: {
            width: 400,
            height: 300
        },
        componentName: 'line-component',
        component: LineComponent
    },
    {
        id: 3,
        icon: "pie-chart",
        name: "饼图",
        option: {
            width: 400,
            height: 300
        },
        componentName: 'pie-component',
        component: PieComponent
    },
    {
        id: 4,
        icon: "dot-chart",
        name: "散点图",
        option: {
            width: 400,
            height: 300
        },
        componentName: 'dot-component',
        component: DotComponent
    },
    {
        id: 5,
        icon: "radar-chart",
        name: "散点图",
        option: {
            width: 400,
            height: 300
        },
        componentName: 'radar-component',
        component: RadarComponent
    }
]