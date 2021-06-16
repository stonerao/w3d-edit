import * as THREE from 'three';
import EffectBase from '../src/EffectBase';
 
class CreatTitle extends EffectBase {
    constructor(config) {
        super(config);
        this.group = new THREE.Group();
        EffectBase.call(this, config);
        this.animateArr = [];
        this.time = { value: 0 };
        this.GET_CTX = null;
    }
    add(option) {
        const mesh = this.createEffect(option);
        mesh.position.copy(option.position);
        mesh.nowId = option.nowId;
        this.group.add(mesh);
    }
    remove(nowId) {
        const obj = this.group.getObjectByProperty("nowId", nowId);

        if (obj) {
            obj.material.dispose();
            obj.geometry.dispose();
            this.group.remove(obj);
        }
    }
    setOption() {

    }
    createEffect(option) {
        const canvas = this.createCanvas({
            title: option.text,
            fontSize: option.fontSize || 25,
            height: option.height || 32,
            color: option.color,
            padding: [15, 32]
        });

        const textur = new THREE.Texture(canvas);
        textur.needsUpdate = true;

        const type = option.type;
        const Cwidth = canvas.width;
        const Cheight = canvas.height;
        const width = Cwidth * option.scale;
        const height = Cheight * option.scale;
        let mesh = null;
        if (type == 2) {
            const geometry = new THREE.PlaneBufferGeometry(width, height, 1, 1);
            const material = new THREE.MeshBasicMaterial({
                map: textur,
                transparent: true,
                color: 0xffffff,
                depthWrite: false,
            });
            geometry.translate(0, height / 4, 0);
            mesh = new THREE.Mesh(geometry, material);
        } else {
            const material = new THREE.SpriteMaterial({
                map: textur,
                color: 0xffffff
            });
            mesh = new THREE.Sprite(material);

            mesh.scale.set(width * option.scale, height * option.scale, height * option.scale);
            mesh.center.set(0.5, 0);
        }
        return mesh
    }
    getWidth(option) {
        const { title, fontSize } = option;

        if (!this.GET_CTX) {
            const canvas = document.createElement("canvas");
            this.GET_CTX = canvas.getContext("2d");
        }

        this.GET_CTX.font = fontSize + "px 微软雅黑";
        return this.GET_CTX.measureText(title).width;
    }
    createCanvas(option) {
        const { title, fontSize, height, color, padding, background } = option;
        // 边距
        let _width = this.getWidth(option);
        let _height = height > fontSize ? height : fontSize;

        // 确定高宽
        if (typeof padding === "number") {
            _width += padding * 2;
            _height += padding * 2;
        } else if (Array.isArray(padding)) {
            const pLen = padding.length;
            if (pLen == 2) {
                _width += padding[0] * 2;
                _height += padding[1] * 2;
            }
        }

        const canvas = document.createElement("canvas");
        canvas.width = _width;
        canvas.height = _height;

        const ctx = canvas.getContext("2d");

        // 判断是否有背景图
        if (background) {
            ctx.drawImage(background, 0, 0, _width, _height);
        }

        ctx.font = fontSize + "px 微软雅黑";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(title, _width / 2, _height / 2);
        return canvas;
    }

    animate = (dt) => {
        this.time.value += dt;
    }
}
export default CreatTitle