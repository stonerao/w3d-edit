import * as THREE from 'three';
import EffectBase from '../src/EffectBase';

class CreateBoxLine extends EffectBase {
    constructor(config) {
        super(config);
        this.group = new THREE.Group();
        EffectBase.call(this, config);
        this.animateArr = [];
        this.time = {
            value: 0
        };
    }
    add(option, obj) {
        // 判断当前obj下是否已有boxLine
        this.remove(obj);
        const mesh = this.createEffect(option, obj);
        mesh.nowId = option.nowId;
        mesh.isEffect = true;
        obj.add(mesh);
    }
    remove(mesh) {
        const obj = mesh.getObjectByProperty("name", "BoxLine"); 
        if (obj) {
            obj.material.dispose();
            obj.geometry.dispose();
            obj.parent.remove(obj);
        }
    }

    createEffect(option, object) {
        const geometry = new THREE.EdgesGeometry(object.geometry);
        const material = new THREE.LineBasicMaterial({
            color: new THREE.Color(option.color),
            opacity: option.opacity || 1,
            transparent: true,
        });
        const line = new THREE.LineSegments(geometry, material);

        line.name = "BoxLine";

        return line;
    }

    animate = (dt) => {
        this.time.value += dt;
    }
}
export default CreateBoxLine