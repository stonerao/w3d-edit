import * as THREE from 'three';
import * as $ from 'jquery';
// 事件  拾取分发
function EffectEvents(render) {
    this.dfDbClickDelay = 0; // 单双击延时
    this.GLRender = render; // 渲染对象
    this.eventDom = render.container[0]; // 事件挂载dom
    // this.eventDom = document.querySelector("#cont_frame"); // 事件挂载dom

    this._ItdMesh = null; // 拾取过渡对象
    this._isIntercept = false; // 是否拦截所有事件

    // 拾取相关
    this._Mouse = new THREE.Vector2();
    this._Raycaster = new THREE.Raycaster();
    this._Intersects = null; // 射线拾取对象
    this._CurrentID = null; // 当前事件关联的效果ID,实时

    /* console.log(render.container);
    render.container.on("click",function() {
        console.log(render.container)
    }) */
    // ---------------
    const _this = this;
    // 鼠标点击入口
    function onDocumentMouseDown(event) {
        event.preventDefault();
        if (_this._isIntercept) return;
        clearTimeout(_this.dfDbClickDelay);
        _this.dfDbClickDelay = setTimeout(() => {
            _this.getIntersects(event);
            _this.setMouseDown(event, 'onMouseDown');
        }, 200); // 200毫秒间隔为单击
    }
    // 鼠标双击入口
    function onDocumentMousedblclick(event) {
        event.preventDefault();
        if (_this._isIntercept) return;

        clearTimeout(_this.dfDbClickDelay);
        _this.getIntersects(event);
        _this.setMouseDown(event, 'onDblclick');
    } 
    // console.log(render)
    this.eventDom.addEventListener('click', onDocumentMouseDown, false);
    this.eventDom.addEventListener('dblclick', onDocumentMousedblclick, false);

    // 移除事件绑定
    this.removeEvents = function () {
        this.eventDom.removeEventListener('click', onDocumentMouseDown, false);
        this.eventDom.removeEventListener('dblclick', onDocumentMousedblclick, false);
    };
}

Object.assign(EffectEvents.prototype, {

    constructor: EffectEvents,

    // 销毁事件， key = true -- 只清空拾取
    disposeEvent: function (key) {
        this._ItdMesh = null;
        if (key) return;

        this._Mouse = null;
        this._Raycaster = null;
        this._Intersects = null;
        this._CurrentID = null;

        this.removeEvents();
        this.eventDom = null;
        this.GLRender = null;
        clearTimeout(this.dfDbClickDelay);
    },

    // ---------------
    // 事件分发执行
    handoutEvent: function (event, component, eventName, hasCallBack) {
        if (!component) return;
        const eventFunc = component[eventName];
        if (this.GLRender.isFunction(eventFunc)) {
            if (eventName === 'onMouseOut') {
                // mouseOut事件特殊处理 hasCallBack - 区分是否对外抛出事件
                eventFunc.call(component, event, this._Intersects, hasCallBack);
            } else eventFunc.call(component, event, this._Intersects);
        }
    },
    // 获取拾取对象
    getIntersects: function (event) {
        this._Mouse.x = (event.layerX / this.GLRender.width) * 2 - 1;
        this._Mouse.y = -(event.layerY / this.GLRender.height) * 2 + 1;

        if (this.GLRender.threshold) { // - 设置射线拾取阀值，决定拾取精度
            this._Raycaster.params.Points.threshold = this.GLRender.threshold;
        }
        this._Raycaster.setFromCamera(this._Mouse, this.GLRender.camera);
        this._Intersects = this._Raycaster.intersectObjects(this.GLRender.eventArr, true);

        //- 删除 不执行事件的元素
        for (let i = this._Intersects.length - 1; i >= 0; i--) {
            const obj0 = this._Intersects[i].object;
            if (obj0._unEvent) this._Intersects.splice(i, 1);
        }

        if (this._Intersects.length) {
            this._CurrentID = this._Intersects[0].object.userData.eId;
        }
        return this._Intersects;
    },
    // 鼠标移出执行
    setMouseOut: function (event, hasCallBack) {
        const component = this.GLRender.effectObj[this._CurrentID];
        if (hasCallBack && this.eventDom) this.eventDom.style.cursor = 'auto';
        if (this._ItdMesh) {
            this.GLRender.onMouseOut(event, component, this._Intersects, hasCallBack);
            this.handoutEvent(event, component, 'onMouseOut', hasCallBack);
        }
        this._ItdMesh = null;
    },
    // 鼠标移入执行
    setMouseIn: function (event, obj) {
        this._ItdMesh = obj; // 保留缓存，用于判断是否是相同拾取
        this.eventDom.style.cursor = 'pointer';
        const component = this.GLRender.effectObj[this._CurrentID];
        this.GLRender.onMouseIn(event, component, this._Intersects); 
        this.handoutEvent(event, component, 'onMouseIn');
    },
    // 鼠标点击执行（单击/双击）
    setMouseDown: function (event, eventName) {
        const component = this.GLRender.effectObj[this._CurrentID];
        this.GLRender[eventName](event, component, this._Intersects);
        this.handoutEvent(event, component, eventName);
    }
});

export default EffectEvents;