import * as THREE from 'three';
import EffectBase from './EffectBase';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
class Transform extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);
        this.group = new THREE.Group();
        this.object = null;
       
        this.init();
    }

    init() { 
        const renderers = this.config.renderers;
        this.control = new TransformControls(renderers.camera, renderers.renderer.domElement);
        this.control.addEventListener('change', () => {
            renderers.renderer.render(renderers.scene, renderers.camera);
        });

        this.control.addEventListener('dragging-changed', (event) => { 
            renderers.controls.enabled = !event.value;
            Models.isClick = !event.value;
            setTimeout(() => {
                Models.updateBoxLine(this.object);
            }, 100);
        });
        this.control.name = "transformControl";
        this.control.isNoChild = true; // 不在UI层级中显示
        renderers.scene.add(this.control);

        window.addEventListener('keydown', (event) => { 
            switch (event.keyCode) {

                case 81: // Q
                    this.control.setSpace(this.control.space === "local" ? "world" : "local");
                    break;

                case 16: // Shift
                    this.control.setTranslationSnap(100);
                    this.control.setRotationSnap(THREE.Math.degToRad(15));
                    // this.control.setScaleSnap(0.25);
                    break;

                case 87: // W
                    this.control.setMode("translate");
                    break;

                case 69: // E
                    this.control.setMode("rotate");
                    break;

                case 82: // R
                    this.control.setMode("scale");
                    break; 
                case 187:
                case 107: // +, =, num+
                    this.control.setSize(this.control.size + 0.1);
                    break;

                case 189:
                case 109: // -, _, num-
                    this.control.setSize(Math.max(this.control.size - 0.1, 0.1));
                    break;

                case 88: // X
                    this.control.showX = !this.control.showX;
                    break;

                case 89: // Y
                    this.control.showY = !this.control.showY;
                    break;

                case 90: // Z
                    this.control.showZ = !this.control.showZ;
                    break;

                case 32: // Spacebar
                    this.control.enabled = !this.control.enabled;
                    break;

            }

        });

        window.addEventListener('keyup',  (event)=> {

            switch (event.keyCode) {

                case 16: // Shift
                    this.control.setTranslationSnap(null);
                    this.control.setRotationSnap(null); 
                    break;

            }

        });
    }
    setAttch(obj) { 
        this.object = obj;
        this.control.attach(obj);
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

    }
}
export default Transform;