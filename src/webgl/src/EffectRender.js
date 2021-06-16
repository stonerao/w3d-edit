import * as THREE from 'three';
import * as $ from 'jquery';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import EffectEvents from './EffectEvents';
/**
 * [EffectRender 渲染器]
 */
function EffectRender(config) {
    this.scene;
    this.camera;
    this.renderer;
    this.controls;

    this.clock;
    this.width;
    this.height;
    this.composer;

    this.GId = '';
    this.container;
    this.parentCont;

    this.bgTxue = {}; // 背景纹理

    this.eventArr = []; // 事件拾取数组
    this.effectArr = []; // 效果组
    this.effectObj = {}; // id-效果
    this.animateArr = [];
    this.isCtrUpdate = true;

    this.hasComposer = false;

    this._cId = 0;

    this._TWEEN = TWEEN;
    /**
     * [DefaultConfig 默认配置项]
     * @type {Object}
     */
    const DefaultConfig = {
        cts: '', // 容器dom 或id
        background: {
            color: '#ffffff', opacity: 0, type: 'cubSky' // type: shpereSky-天空球,cubSky-天空盒
        },
        camera: {
            fov: 45, near: 1, far: 10000, position: [0, 1024, 256], ratio: 1
        },
        controls: {
            target: { x: 0, y: 0, z: 0 }, // 中心点
            enablePan: true, // 平移  
            enableZoom: true, // 缩放  
            enableRotate: true, // 旋转
            enableDamping: true, //是否阻尼
            dampingFactor: 0.1, //阻尼系数
            panSpeed: 0.1, //平移系数
            zoomSpeed: 0.5, //缩放系数
            rotateSpeed: 0.1, //旋转系数
            distance: [0, 40960], //缩放距离区间
            polarAngle: [-Infinity, Infinity], //上下旋转区间 *0.5
            azimuthAngle: [-Infinity, Infinity], //左右旋转区间
        },
        light: {
            isHemisphere: false,  // 半球光
            isDirectional: true,  // 方向光
            Ambient: { // 环境光
                color: '#ededed', strength: 0.8
            },
            hemisphere: {
                color: '#F0FAFF', groundColor: '#FFFAF0', strength: 0.5, position: [0, 0, 0]
            },
            directional: {
                color: '#FFFFFF',
                strength: 1.1,
                position: [120, 120, 60],
                shadow: false,
                mapSize: 1024,
                boxSize: 5000,
                lightHelper: false
            },
        },
        texture: {}, // 纹理
        composer: {  // 后期处理
            isBloom: false, // 是否开启辉光
            bloomThreshold: 0.2, // 辉光亮度阀值，颜色亮度大于阀值起效
            bloomStrength: 0.05, // 辉光强度
            bloomRadius: 0, // 辉光半径

            isFocus: false, // 是否径向模糊
            focusVal: 0.01, // 径向模糊值
            waveFactor: 0.0000000, //模糊系数

            isOutline: false, // 外边框
            outlineColor: '#C40005', // 外边框颜色
            outlineStrength: 1.5, // 外边框强度
            outlineGlow: 0.01, // 外边框范围

            isAntialias: false, // 是否开启 smaa 、 ssaa 抗锯齿
            antialiasType: 'smaa', // smaa 、 ssaa 抗锯齿 ssaa-硬件要求高
            antialiasLevel: 2, // ssaa抗锯齿级别
        }
    };

    function renderers() {
        (function Animations() {
            if (IsInit) {
                dfRaf = window.requestAnimationFrame(Animations);
                var delta = _that.clock.getDelta();
                if (delta < 0.1) _that.animation(delta);

                _that.isCtrUpdate && _that.controls.update();

                _that._TWEEN && _that._TWEEN.update();

                if (_that.hasComposer) {
                    _that.composer.render(delta);
                } else {
                    _that.renderer.render(_that.scene, _that.camera);
                }
            } else {
                dfRaf && window.cancelAnimationFrame(dfRaf);

                _that._TWEEN && _that._TWEEN.removeAll();

                _that.renderer.dispose();
                _that.renderer.forceContextLoss();
                _that.renderer.domElement = null;

                _that.disposeObj(_that.scene);
                _that.container.remove();
                _that.disposePms();
            }
        })();
    }

    // 是否初始化完成
    var IsInit = false, _that = this, dfRaf;
    this.parentCont = this.parseCts(config.cts);
    if (this.parentCont != null) {
        this.GId = THREE.Math.generateUUID();
        this.container = this.creatContainer(`${this.parentCont.attr('id')}_${this.GId}`);
        this.parentCont.html(this.container);

        this.config = $.extend(true, {}, DefaultConfig, config);
        this.loadTexture(this.config.texture);

        this.initiate();
        EffectEvents && (this._Events = new EffectEvents(this));
        IsInit = true;
        window.requestAnimationFrame(() => {
            renderers();
        });
    } else {
        this.Result = 'error! Not Support WebGL!';
    }

    this.disposeRender = function () {
        if (IsInit && this.testing()) {
            IsInit = false;
        }
    };

}

Object.assign(EffectRender.prototype, {

    constructor: EffectRender,
    // 添加效果对象
    addEffect: function (eftObj, isReplace) {
        if (!eftObj.eId || !isReplace) {
            eftObj.eId = this.creatId();
        }
        this.effectObj[eftObj.eId] = eftObj;
        eftObj.group.name = eftObj.eId;

        this.effectArr.push(eftObj);
        this.scene.add(eftObj.group);
        this.onAnimate(eftObj.animate);

        this.updateEventArr(eftObj);
    },

    // 移除效果对象，isDispose - 是否销毁对象
    removeEffect: function (eftObj, isDispose) {
        delete this.effectObj[eftObj.eId];

        this.effectArr = this.removeArrItem(this.effectArr, eftObj);
        this.scene.remove(eftObj.group);
        this.unAnimate(eftObj.animate);

        this.removeEventArr(eftObj.eventArray);

        if (!isDispose) return;
        // 销毁对象
        this.disposeObj(eftObj.group);
        eftObj.dispose();
    },

    // 更新对象事件数组
    updateEventArr: function (eftObj, isClear = true) {
        if (isClear) { // 清除原有的事件对象
            for (let i = this.eventArr.length - 1; i >= 0; i--) {
                if (this.eventArr[i].userData.eId === eftObj.eId) {
                    this.eventArr.splice(i, 1);
                }
            }
        }
        for (let k = 0; k < eftObj.eventArray.length; k++) {
            eftObj.eventArray[k].traverse((node) => {
                node.userData.eId = eftObj.eId;
            });
            this.eventArr.push(eftObj.eventArray[k]);
        }
    },

    // 移除事件数组里的对象 - 数组
    removeEventArr: function (eventArr) {
        for (let i = eventArr.length - 1; i >= 0; i--) {
            this.removeEventObj(eventArr[i]);
        }
    },

    // 移除事件数组里的对象 - 单对象
    removeEventObj: function (eventObj) {
        for (let i = this.eventArr.length - 1; i >= 0; i--) {
            if (this.eventArr[i] === eventObj) {
                this.eventArr.splice(i, 1);
                break;
            }
        }
    },

    // 创建ID
    creatId: function () {
        this._cId++;
        const [center, right, left] = [
            (Date.now() + this._cId).toString(16),
            Math.random().toString().substr(2, 5),
            Math.random().toString(36).substr(2, 6)
        ];
        const idStr = `e_${left}${center.substr(center.length - 5)}${right}`;
        return idStr;
    },

    // 加入动画
    onAnimate: function (func) {
        this.isFunction(func) && this.animateArr.push(func);
    },

    // 删除动画
    unAnimate: function (func) {
        this.animateArr = this.removeArrItem(this.animateArr, func);
    },

    removeArrItem: function (arr, item) {
        return arr.filter(node => node !== item);
    },

    // 执行动画
    animation: function (dt) {
        for (var i = 0; i < this.animateArr.length; i++) {
            this.animateArr[i](dt, this.clock);
        }
    },

    // 事件执行接口
    onMouseIn: function () { },
    onMouseOut: function () { },
    onMouseDown: function () { },
    onDblclick: function () { },

    // 初始化
    initiate: function () {
        this.scene = new THREE.Scene();
        this.clock = new THREE.Clock();

        var wh = this.getWH();
        this.width = wh.w;
        this.height = wh.h;

        var cm = this.config.camera,
            bg = this.config.background,
            lt = this.config.light;

        // - background
        if (bg.type === 'shpereSky' && this.bgTxue._shpereSky) {
            // this.bgTxue._shpereSky.userData = {isUpdate: true, speed: 0.04, isRotate: true};
            this.bgTxue._shpereSky.isSphereTexture = true;
            this.scene.background = this.bgTxue._shpereSky;
        } else if (bg.type === 'cubSky' && this.bgTxue._cubSky) {
            // this.bgTxue._cubSky.userData = {isUpdate: true, speed: 0.04, isRotate: true};
            this.scene.background = this.bgTxue._cubSky;
        }
        this.scene.name = "scene";
        // - camera
        this.camera = new THREE.PerspectiveCamera(cm.fov, wh.w / wh.h, cm.near, cm.far);
        this.camera.position.set(cm.position[0], cm.position[2], cm.position[1]);
        this.camera.lookAt(this.scene.position);

        // - renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setClearColor(bg.color, bg.opacity);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(1);
        this.container.append($(this.renderer.domElement));
        if (lt.isDirectional) {
            this.renderer.shadowMap.enabled = lt.directional.shadow;
        }

        //- controls
        this.controls = new OrbitControls(this.camera, this.container[0]);
        this.setControls(this.controls, this.config.controls);
        this.controls.target.copy(this.config.controls.target);



        this.camera.userData.target = this.controls.target.clone();

        // - lights
        this.setLight(this.scene, lt);

        window.addEventListener("resize", this.onResize.bind(this), false);
    },

    tabCamera(type) {
        var cm = this.config.camera;
        var wh = this.getWH();
        this.width = wh.w;
        this.height = wh.h;
        // 销毁相机 
        if (type === 1) {
            // 透视相机
            this.camera = new THREE.PerspectiveCamera(cm.fov, wh.w / wh.h, cm.near, cm.far);
            this.camera.position.set(cm.position[0], cm.position[2], cm.position[1]);
            this.camera.lookAt(this.scene.position);
        } else {
            // 正交相机
            this.camera = new THREE.OrthographicCamera(wh.w / - 2, wh.w / 2, wh.h / 2, wh.h / - 2, 1, 10000);
            this.camera.position.set(0, 500, 0);
            this.camera.lookAt(this.scene.position);
        }
        this.controls.dispose();
        this.controls = null;
        this.controls = new OrbitControls(this.camera, this.container[0]);
        this.setControls(this.controls, this.config.controls);
        this.controls.target.copy(this.config.controls.target);
    },

    // 更新相机及中心点
    updateCamera: function (position, target) {
        this.camera.position.set(position[0], position[2], position[1]);
        this.controls.target.copy(target);
        this.camera.userData.target = this.controls.target.clone();
        // this.camera.updateProjectionMatrix();
        this.controls.update();
    },

    onResize() {   
        const wh = this.getWH();
        this.width = wh.w;
        this.height = wh.h;
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(this.width, this.height);
    },

    // ---  加载背景纹理
    loadTexture: function (texture) {
        var tph = texture.txuePath || '',
            bg = texture.background;
        if (!bg) return;
        if (bg.shpereSky) {
            var txueLoader = new THREE.TextureLoader();
            this.bgTxue._shpereSky = txueLoader.load(tph + bg.shpereSky);
        }
        if (bg.cubSky) {
            var cTextureLoader = new THREE.CubeTextureLoader();
            this.bgTxue._cubSky = cTextureLoader.load([
                tph + bg.cubSky.px, tph + bg.cubSky.nx, tph + bg.cubSky.py,
                tph + bg.cubSky.ny, tph + bg.cubSky.pz, tph + bg.cubSky.nz
            ]);
        }
    },

    // 设置控制器
    setControls: function (controls, opts) {
        controls.enablePan = opts.enablePan;
        controls.enableKeys = opts.enablePan;
        controls.enableZoom = opts.enableZoom;
        controls.enableRotate = opts.enableRotate;

        controls.enableDamping = opts.enableDamping;
        controls.dampingFactor = opts.dampingFactor;

        controls.panSpeed = opts.panSpeed;
        controls.zoomSpeed = opts.zoomSpeed;
        controls.rotateSpeed = opts.rotateSpeed;

        controls.minDistance = opts.distance[0];
        controls.maxDistance = opts.distance[1];
        controls.minPolarAngle = opts.polarAngle[0];
        controls.maxPolarAngle = opts.polarAngle[1];
        controls.minAzimuthAngle = opts.azimuthAngle[0];
        controls.maxAzimuthAngle = opts.azimuthAngle[1];
    },

    setControlsOff: function (controls) {
        controls.enablePan = false;
        controls.enableKeys = false;
        controls.enableZoom = false;
        controls.enableRotate = false;
    },

    setLight: function (scene, opts) {
        scene.add(new THREE.AmbientLight(opts.Ambient.color, opts.Ambient.strength));
        if (opts.isHemisphere) {
            var lh = opts.hemisphere,
                hLight = new THREE.HemisphereLight(lh.color, lh.groundColor, lh.strength);
            hLight.position.set(lh.position[0], lh.position[2], lh.position[1]);
            scene.add(hLight);
        }
        if (opts.isDirectional) {
            var ld = opts.directional,
                dlight = new THREE.DirectionalLight(ld.color, ld.strength);
            dlight.position.set(ld.position[0], ld.position[2], ld.position[1]);
            dlight.castShadow = ld.shadow;
            this.directLight = dlight;

            // ----
            if (ld.shadow) {
                var mSize = ld.mapSize || 1024;
                dlight.shadow.mapSize.width = mSize;
                dlight.shadow.mapSize.height = mSize;

                var d = ld.boxSize || 5000;
                dlight.shadow.camera.left = - d;
                dlight.shadow.camera.right = d;
                dlight.shadow.camera.top = d;
                dlight.shadow.camera.bottom = - d;

                dlight.shadow.camera.far = 10000;
                dlight.shadow.bias = - 0.0001;
            }
            if (ld.lightHelper) {
                var dLightHelper = new THREE.DirectionalLightHelper(dlight, 10);
                scene.add(dLightHelper);
            }
            // ------

            scene.add(dlight);
        }
    },

    testing: function () {
        return this.renderer instanceof THREE.WebGLRenderer;
    },

    // 销毁效果
    disposePms: function () {
        if (this.composer) {
            this.disArray(this.composer.passes);
            this.disArray(this.composer);
        }
        this.disArray(this.bgTxue);
        this.disArray(this.effectObj);

        this.effectArr.splice(0, this.effectArr.length);
        this.eventArr.splice(0, this.eventArr.length);
        this.animateArr.splice(0, this.animateArr.length);

        window.removeEventListener("resize", this.onResize.bind(this), false);
    },

    disArray: function (array) {
        Object.keys(array).forEach((item) => {
            array[item].dispose && array[item].dispose();
            array[item] = null;
        });
    },

    disposeObj: function (obj) {
        if (obj instanceof THREE.Object3D) {
            const _this = this;
            this.objectTraverse(obj, function (child) {
                if (child.geometry) {
                    if (child.geometry._bufferGeometry) {
                        child.geometry._bufferGeometry.dispose();
                    }
                    child.geometry.dispose();
                    child.geometry = null;
                }

                if (_this.isArray(child.material)) {
                    child.material.forEach(function (mtl) {
                        _this.disposeMaterial(mtl);
                    });
                } else if (child.material) {
                    _this.disposeMaterial(child.material);
                }
                child.material = null;

                if (child.parent) child.parent.remove(child);
                child = null;
            });
        }
    },

    disposeMaterial: function (mtl) {
        Object.keys(mtl).forEach((key) => {
            if (!(mtl[key] && this.isFunction(mtl[key].dispose))
                && key !== 'uniforms') {
                if (key === 'program' || key === 'fragmentShader' || key === 'vertexShader') {
                    mtl[key] = null;
                }
                return;
            }

            if (key === 'uniforms') {
                Object.keys(mtl.uniforms).forEach((i) => {
                    let uniform = mtl.__webglShader ? mtl.__webglShader.uniforms[i] : undefined;
                    if (uniform && uniform.value) {
                        if (uniform.value.dispose) { uniform.value.dispose(); }
                        uniform.value = null;
                    }
                    uniform = mtl.uniforms[i];
                    if (uniform.value) {
                        if (uniform.value.dispose) { uniform.value.dispose(); }
                        uniform.value = null;
                    }
                });
            } else {
                mtl[key].dispose();
                mtl[key] = null;
            }
        });

        mtl.dispose();
        mtl = null;
    },

    objectTraverse: function (obj, callback) {
        if (!this.isFunction(callback)) return;
        var children = obj.children;
        for (var i = children.length - 1; i >= 0; i--) {
            this.objectTraverse(children[i], callback);
        }
        callback(obj);
    },

    isArray: function (o) {
        return Object.prototype.toString.call(o) == '[object Array]';
    },

    isFunction: function (a) {
        return Object.prototype.toString.call(a) === '[object Function]';
    },

    toFunction: function (a) {
        var b = Object.prototype.toString.call(a) === '[object Function]';
        return b ? a : function () { };
    },

    getWH: function () {
        return { w: this.container.width(), h: this.container.height() };
    },

    parseCts: function (cts) {
        var $dom = (typeof cts == 'object') ? $(cts) : $('#' + cts);
        if ($dom.length <= 0) return null;
        return $dom;
    },

    creatContainer: function (id) {
        var containers = $('<div></div>');
        containers.css("cssText",
            "height:100%;width:100%;overflow:hidden;position:relative !important");
        containers.attr('id', id);
        return containers;
    }

});

export default EffectRender