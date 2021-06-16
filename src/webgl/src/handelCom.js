import * as THREE from 'three';
class handelEffect extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.group = new THREE.Group();
        this.timeVal = { value: 0 };

        this.init();
    }

    init() {

    }
    // 设置材质效果
    setMaterialEffect(material) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.time = this.timeVal;
        }
        material.setValues({
            color: new THREE.Color("#fff")
        });
        material.clone();
    }
 

    onMouseIn(e, intersects) {
    }
    onMouseOut(e, intersects, key) {

    }
    onMouseDown(e, intersects) {

    }
    onDblclick(e, intersects) {
        // console.log('--onDblclick--', e, intersects);
    }
    animate = (dt) => {
        this.timeVal.value += dt;
    }
}
