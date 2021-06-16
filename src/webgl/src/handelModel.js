import * as THREE from 'three';
import EffectBase from './EffectBase';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import Contact from '../utils/contact';
// import { setBeforeCompile } from '../utils/material';
function loadFbx(url, callback) {
    const loader = new FBXLoader();
    loader.load(url, function (obj) {
        callback(obj);
    });
}

class handelModel extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.timeVal = { value: 0 };
        this.isClick = true;
        this.isRayPoint = false; // 判断当前是否是拾点状态
        this.rayPointFunc = false; // 拾取回调

        this.group = new THREE.Group();

        this.modelGroup = new THREE.Group();
        this.labelGroup = new THREE.Group();


        this.box = new THREE.Box3();

        this.currNode = null;


        this.helpBox = null;
        this.helpBoxGroup = new THREE.Group();

        this.group.add(this.helpBoxGroup, this.modelGroup, this.labelGroup);

        this.init(); 
        // 判断是否有基础模型
        if (config.model && config.model.length != 0) {
            const arrs = config.model.map((e) => config.modelUrl + e);
            this.loadModel(arrs, config.model[0]);
        }
    }

    init() {

    }

    updateMaterialOption(object) {
        this.currNode = object;
    }

    // 更新物体的材质
    updateMeshMaterial(mesh, material) {
        
    }

    /**
     * 加载模型，并且循环处理
     * @param {*} models 模型
     */
    loadModel(models, urlName, callback) {
        if (models.length === 0) {
            // 加载所有模型完毕
            return false
        }
        const url = models.shift();

        loadFbx(url, (obj) => {
            const eventArr = [];
            obj.traverse((child) => {
                if (child.geometry) {
                    eventArr.push(child);
                }
                if (child.material) {
                    // 获取其他的uv通道
                    const uvsNames = Contact.getObjectUv(child);
                    // 给材质添加默认效果shdaer
                    if (Array.isArray(child.material)) {
                        child.material.forEach((mat) => {
                            this.handelMaterial(mat, uvsNames);
                        })
                    } else {
                        this.handelMaterial(child.material, uvsNames);
                    }
                }
                // 存储相关数据 用于导出
                child._urlName = urlName;
                child._option = {
                    urlName: urlName,
                    effects: [],
                    commons: []
                };
            });
            obj._urlName = urlName;
            obj._option = {
                urlName: urlName,
                effects: [],
                commons: [],

            };
            obj._isTop = true;
            this.modelGroup.add(obj);
            this.pushEvent(eventArr);
            this.loadModel(models);

            // 触发更新方法
            this.config.update && this.config.update();

            // 加载完毕后出发回调
            callback && callback();
        });
    }

    /**
     * 在材质的加载后修改，加上默认效果，根据type展示效果
     * @param {Object} material 材质
     * @param {Object} box 材质所在物体的box属性
     */
    handelMaterial(material) {
        material.onBeforeCompile = (shader) => {
            material._uniforms = shader.uniforms;
            material._shader = shader;
            // setBeforeCompile(shader, uvsNames, this.timeVal);
            material.needsUpdate = true;
        };
    }

    /**
     * 获取物体的大小、中间位置、box
     * @param {Object3D}} obj 物体
     * @returns {Object} 大小 中心 box
     */
    getModelBox(obj) {

        this.box.setFromObject(obj);

        const center = new THREE.Vector3();
        const size = new THREE.Vector3();

        this.box.getSize(size);
        this.box.getCenter(center);

        return {
            size: size,
            center: center,
            box: this.box
        };
    }

    // 款选当前box
    getBoxLine(obj) {
        if (this.helpBox) {
            this.helpBoxGroup.remove(this.helpBox);
            this.helpBox.material.dispose();
            this.helpBox = null;
        }

        // 给选择过的对象增加标拾，有标拾的才能导出配置 
        obj.isObject = true;

        const { size, center } = this.getModelBox(obj);
        const geometry = new THREE.BoxBufferGeometry(size.x, size.y, size.z, 1, 1, 1);
        const object = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial(0xff0000));
        this.helpBox = new THREE.BoxHelper(object, 0xffff00);
        this.helpBoxGroup.position.copy(center);
        this.helpBoxGroup.rotation.copy(new THREE.Euler())
        this.helpBoxGroup.add(this.helpBox);
    }

    updateBoxLine(obj) {
        const { center } = this.getModelBox(obj);

        this.helpBoxGroup.position.copy(center);
        this.helpBoxGroup.rotation.copy(obj.rotation);
    }

    // 加入拾取数组
    pushEvent(arr) {
        if (!Array.isArray(arr)) return false;
        this.eventArray.push(...arr);
        this.config.renderers.updateEventArr(this);
    }
   
    onMouseDown(e, intersects) {
        
        if (intersects.length === 0) {
            this.helpBoxGroup.visible = false;
            return false;
        };
        const obj = intersects[0].object;
        // 拾取点优先级最大 
        if (this.isRayPoint) {
            this.rayPointFunc && this.rayPointFunc(intersects[0].point);
             
            return false;
        }
        if (this.isClick) {
            this.helpBoxGroup.visible = true;
            this.selectNode(obj);
            // 
        }  
        // 点击注入
        if (obj._option && obj._option.onClick) {
            obj._option.onClick({
                mesh: obj,
                event: e,
                render: this.config.renderers
            });
        }
    }

    // 设置拾取模式
    setRayPointMode(state, callback) {
        this.isRayPoint = state;
        this.rayPointFunc = callback;
    }

    // 通过名称选择物体
    nameToSelectNode(name) {
        // 通过name获取
        const obj = this.group.getObjectByProperty("name", name);
        this.selectNode(obj);
    }
    // 选择当前物体
    selectNode(obj) {
        this.getBoxLine(obj);
        this.updateMaterialOption(obj);
        this.config.click(obj);
    }

    // 通过fbx名字 和 name参数找到name
    selectFileName(name) {
        const mesh = this.group.getObjectByProperty("name", name);;
         
        return mesh;
    }

    // 获取当前记载的所有模型配置
    getModelOption() {
        const configs = [];
        this.group.traverse((child) => {
            if (child.isObject) {
                const _option = child._option;
                const option = {
                    ..._option,
                }
                if (_option.onClick) {
                    option.onClick = String(option.onClick);
                }
                if (_option.onReady) {
                    option.onReady = String(option.onReady);
                }
                const material = this.getModelMaterial(child);
                const rotate = child.rotation.clone();
                configs.push({
                    name: child.name,
                    option: option,
                    position: child.position.clone(),
                    scale: child.scale.clone(),
                    rotation: { x: rotate.x, y: rotate.y, z: rotate.z },
                    material: material
                });
            }
        });
        return configs;
    }

    setToMaterial(material, callback) {
        // 给材质添加默认效果shdaer 
        if (Array.isArray(material)) {
            material.forEach((mat) => {
                callback(mat);
            })
        } else {
            callback(material);
        }
    }
    // 返回当前模型的材质信息
    getModelMaterial(obj) {
        const materials = [];
        const keys = ['name', 'opacity', 'side', 'blending', 'transparent', 'depthWrite', 'depthTest', 'wireframe', 'color'];
        
        if (obj && obj.material) {
            this.setToMaterial(obj.material, (material)=>{ 
                const _parms = {}; 
                
                keys.forEach((key) => {
                    if (material[key] !== undefined) {
                        if (key === 'color') {
                            _parms[key] = material[key].getStyle();
                        } else {
                            _parms[key] = material[key];
                        }

                    }
                });

                materials.push(_parms);
            })
        }
        
        return materials;
    }

    animate = (dt) => {
        this.timeVal.value += dt;
    }
}

export default handelModel;