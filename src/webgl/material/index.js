import * as Library from './Library.js';
import * as THREE from 'three';

const handelMateirla = (material, callback) => {
    if (Array.isArray(material)) {
        material.forEach((mat) => {
            callback(mat)
        })
    } else {
        callback(material)
    }
}
const setMaterialEffect = (config, mesh) => {
    if (config.type === 'shader') {
        if (mesh.material) {
            let materials = [];
            handelMateirla(mesh.material, (mat) => {
                const material = mat.clone();
                material.onBeforeCompile = (shader) => {
                    material._uniforms = shader.uniforms;
                    material._shader = shader;
                    // 给uniform传递参数
                    const optionKeys = Object.keys(config.options);
                    const models = config.optionsModel;
                    optionKeys.forEach((key) => {
                        const type = models[key];
                        if (type == 'color') {
                            shader.uniforms[key] = { value: new THREE.Color(config.options[key]) };
                        } else {
                            shader.uniforms[key] = { value: config.options[key] };
                        }
                    })
                    const { fragmentShader, vertexShader } = Library[config.func](mat._shader);
                    shader.fragmentShader = fragmentShader;
                    shader.vertexShader = vertexShader;
                };
                if (Array.isArray(mesh.material)) {
                    materials.push(material);
                } else {
                    materials = material;
                }
            })
            mesh.material = materials;
        }

    }
}
export default setMaterialEffect;