import * as THREE from 'three';
/**
解析数据 生成
*/
class ST_Ttitle extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.group = new THREE.Group();

        const sprite = this.createSpriteTitle(config);
        this.group.add(sprite);
    }
    createTitleCanvas(option) {
        let { height, width, fontSize, text } = option;
        const canvas = document.createElement('canvas');
        width *= 2;
        height *= 2;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        ctx.font = fontSize + "px 微软雅黑";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";

        const ws = ctx.measureText(text).width;
        ctx.fillText(text, (width - ws) / 2, height / 2 + fontSize / 4);

        const textur = new THREE.Texture(canvas);
        textur.needsUpdate = true;

        return textur;
    }
    // 创建标签
    createSpriteTitle(option = {}) {
        const { width, height, text } = option;
        //canvas
        const map = this.createTitleCanvas(option);
        // 生成sprite
        const material = new THREE.SpriteMaterial({
            map: map,
            color: 0xffffff
        });
        const sprtie = new THREE.Sprite(material);
        sprtie.scale.set(width, height, height);
        sprtie.name = text || "sprtie";
        sprtie.position.y += height / 2;
        return sprtie;
    }


    animate = (dt) => {
    }
}


