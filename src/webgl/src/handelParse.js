import * as THREE from 'three';
/**
解析数据 生成
*/
class handelParse extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.group = new THREE.Group();

    }

    init() {

    }

    parse(data) {
        const { model, comments = [] } = data;
        // 添加效果
        comments.forEach((d) => {
            Effect.createCommEffect(d, d.position);
        });
        const names = model.map((m) => m.name);
        // 修改材质
        Models.modelGroup.traverse((child) => {
            if (child.uuid === Models.modelGroup.uuid) return false;
            // 需要更改材质的
            if (names.includes(child.name)) {
                const index = names.indexOf(child.name);
                const mode = model[index];
                if (mode.name === child.name && child.name !== "" && child.parent.name === mode.parent) {
                    child.position.copy(mode.position);
                    child.rotation.copy(mode.rotation);
                    child.scale.copy(mode.scale);
                    // 材质
                    if (mode.material) {
                        this.handelMaterial(child.material, (mat) => {
                            this.setMaterial(mat, mode.material);
                        });
                    }
                    // 判断当前节点是否有效果
                    if (mode.effects && Array.isArray(mode.effects) && mode.effects.length > 0) {
                        mode.effects.forEach((eff) => {
                            Effect.setObjectEffect(child, eff);
                        })
                    }
                }
            }

        });
    }
    handelMaterial(material, callback) {
        if (Array.isArray(material)) {
            material.forEach((mat) => {
                callback(mat);
            });
        } else {
            callback(material);
        }
    }
    setMaterial(cmat, mat) {
        if (Array.isArray(mat)) {
            mat.forEach((m) => {
                if (cmat.name === m.name) {
                    this.setMaterialVal(cmat, m);
                }
            });
        } else {
            if (cmat.name === mat.name) {
                this.setMaterialVal(cmat, mat);
            }
        }

    }
    setMaterialVal(cmat, mat) {
        cmat.setValues({
            transparent: mat.transparent,
            wireframe: mat.wireframe,
            visible: mat.visible,
            side: mat.side,
            opacity: mat.opacity,
            depthWrite: mat.depthWrite,
            depthTest: mat.depthTest,
            blending: mat.blending,
            color: new THREE.Color(mat.color)
        })
    }

    animate = (dt) => {
    }
}
