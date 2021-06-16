import * as THREE from 'three';
import EffectBase from './EffectBase';
/**
解析数据 生成
*/
class handelPoint extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.group = new THREE.Group();

        this.pointData = [];
        this.height = 20;
        this.init();
    }

    init() {
        // 
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.LineBasicMaterial({
            color: 0x881212,
            linewidth: 1,
            blending: THREE.AdditiveBlending
        });

        this.line = new THREE.LineSegments(geometry, material);

        const ageometry = new THREE.BufferGeometry();
        const amaterial = new THREE.LineBasicMaterial({
            color: 0xfff000,
            blending: THREE.AdditiveBlending
        });

        this.activeLine = new THREE.LineSegments(ageometry, amaterial);
        this.activeLine.renderOrder = 2;
        this.group.add(this.line, this.activeLine);
    }

    add(position) {
        this.pointData.push({
            position: position,
            id: THREE.MathUtils.generateUUID(),
            name: 'point' + this.pointData.length
        });
        this.update();
        return this.pointData;
    }

    active(position) {
        let vecs = [];
        if (position) {
            vecs = [
                position.x, position.y, position.z,
                position.x, position.y + this.height * 4, position.z,
            ];
        } 
        this.activeLine.geometry.setAttribute("position", new THREE.Float32BufferAttribute(vecs, 3))
    }

    remove(id) {

    }

    update() {
        const position = [];
        this.pointData.forEach(elem => {
            const p = elem.position;
            position.push(p.x, p.y, p.z);
            position.push(p.x, p.y + this.height, p.z);
        });
        this.line.geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3))
    }

    setOption(type, val) {
        switch (type) {
            case "visible":
                this.line.visible = val;
                break
        }

    }

    setVisible(state) {
        this.group.visible = state;
    }

    animate = (dt) => {
    }
}

export default handelPoint;