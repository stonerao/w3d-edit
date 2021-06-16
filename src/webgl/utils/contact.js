/**
* 用于前端 与 3d 的交流
*/
const getSceneTree = (scene, tree) => {
    const element = {
        name: scene.name || "-",
        type: scene.type,
        uuid: scene.uuid,
        children: []
    };
    tree.push(element);
    scene.children.forEach((child) => {
        if (!child.isNoChild) {
            getSceneTree(child, element.children);
        }
    });
}
const Contact = {
    // 更新3D层级数展示
    updateTree(scene) {
        const tree = [];
        scene.children.forEach((child) => {
            if (child.type === 'Group') {
                getSceneTree(child, tree);
            }
        }) 
        return tree;
    },

    // 选择到了物体
    // 更新到图层面板 的 三个信息框内
    selectNode(object) {
        const { material, name, uuid } = object;
        const materials = [];
        if (material) {
            if (Array.isArray(material)) {
                material.forEach((mat) => {
                    materials.push(mat);
                })
            } else {
                materials.push(material);
            }
            // 更新材质 
            const uvsNames = Contact.getObjectUv(object);
            // VM.updatedMaterial(name, materials, uuid, uvsNames);
        }
        // 基础信息
        // VM.updateSelectNode(object);
    },
    // 通过UUid找到object 并且传给前端
    getObjectById(id) {
        const { scene } = renderers;
        const object = scene.getObjectByProperty("uuid", id);

        this.selectNode(object);
        Models.updateMaterialOption(object);
    },
    // 获取物体uv通道
    getObjectUv(object) {
        // 获取object中所有的uv通道name
        const attrs = object.geometry.attributes;
        return Object.keys(attrs).filter(key => key[0] == 'u' && key[1] == 'v').filter(name => name != 'uv');
    }
}
export default Contact;