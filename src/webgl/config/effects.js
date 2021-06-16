/** 效果组件 */
const array = [
    {
        name: "包围框",
        icon: "loading-3-quarters",
        func: "CreateBoxLine",
        zIndex: 1,// renderOrder 
        type: "add",
        options: {
            color: "#ff0000",
            opacity: 1.0,
            transparent: true
        },
        optionsModel: {
            color: "color",
            opacity: 'number',
            transparent: 'boolean'
        }
    }, {
        name: "文字标签",
        icon: "font-colors",
        func: "CreateBoxTitle",
        zIndex: 1,// renderOrder 
        type: "add",
        options: {
            text: "",
            fontSize: 32,
            height: 64,
            scale: 1, 
            color: "#ff0000",
            offsetY: 0
        },
        optionsModel: {
            text: "string",
            fontSize: "number",
            height: "number",
            scale: "number", 
            offsetY: "number", 
            color: "color",
        }
    },

    {
        name: "渐变",
        icon: "plus",
        func: "Gradient",
        zIndex: 1,
        type: "shader",
        options: {
            uColor: "#FFE793", // 起始渐变颜色 
            uMaxOpacity: 1, // 起始透明度
            uMaxHeight: 50,// 高度 
        },
        optionsModel: {
            uColor: "color",
            uMaxHeight: 'number',
            uMaxOpacity: 'number',
        }
    }
];
const effects = array.map((com, index) => {
    return Object.assign(com, {
        id: index
    });
})
export default effects;