// import * as THREE from 'three';

// 删除当前node
const disposeNode = (mesh) => {
    if (mesh.geometry) {
        mesh.geometry.dispose();
    }
    if (mesh.material && !Array.isArray(mesh.material)) {
        mesh.material.dispose();
    }
    if (mesh.material && Array.isArray(mesh.material)) {
        mesh.material.forEach((mat) => {
            mat.dispose();
        })
    }
    if (mesh.parent) {
        mesh.parent.remove(mesh);
    }
}

export { 
    disposeNode
};