/** 效果组件 */
const array = [
    {
        name: "上升粒子",
        icon: "more",
        func: "CreateRisePoint",
        zIndex: 1,
        options: {
            minRadius: 800,
            maxRadius: 1600,
            color: "#ffaa00",
            size: 20,
            height: 1000,
            number: 100,
            sge: 3
        },
        optionsModel: {
            minRadius: 'number',
            maxRadius: 'number',
            color: 'color',
            size: 'number',
            height: 'number',
            number: 'number',
            sge: 'number'
        }
    },
    {
        name: "标签",
        icon: "font-colors",
        func: "CreateTitle",
        zIndex: 1,
        options: {
            text: "",
            fontSize: 32,
            height: 64,
            scale: 1,
            type: 1,
            color: "#ff0000",
        },
        optionsModel: {
            text: "string",
            fontSize: "number",
            height: "number",
            scale: "number",
            // type: "number",
            color: "color",
        }
    } 
];
const components = array.map((com, index) => {
    return Object.assign(com, {
        id: index
    });
})
export default components;