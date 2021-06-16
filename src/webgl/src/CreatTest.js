// import { EffectBase } from './EffectBase.js';
import * as THREE from 'three';
{
var _Shaders = {
    
};

function CreatTest(config) {
    EffectBase.call(this, config);

    this.test();

    this.animate = function(dt) {
        
    };

}

CreatTest.prototype = Object.assign(Object.create(EffectBase.prototype), {

    constructor: CreatTest,

    onMouseIn: function(e, intersects) {
        console.log( '--onMouseIn--', e, intersects);
    },
    onMouseOut: function(e, intersects, key) {
        console.log( '--onMouseOut--', e, intersects, key);
    },
    onMouseDown: function(e, intersects) {
        console.log( '--onMouseDown--', e, intersects);
    },
    onDblclick: function(e, intersects) {
        console.log( '--onDblclick--', e, intersects);
    },

    test: function() {
        this.group.add( new THREE.GridHelper(1500, 50, 0x145A8D, 0x494949) );

        // test
        const tBox = new THREE.Mesh(this.geo.box(100, 100, 100), this.mtl.phong({
            color: 0xffff00, transparent: true, opacity: 0.99
        }));
        tBox.castShadow = true;
        tBox.receiveShadow = true;
        tBox.position.y = 55;

        const tPlane = new THREE.Mesh(this.geo.plane(500, 500), this.mtl.lambert({
            color: 0xDCDCDC, transparent: true, opacity: 1
        }));
        tPlane.castShadow = true;
        tPlane.receiveShadow = true;
        tPlane.rotation.x = - Math.PI * 0.5;
        tPlane.position.y = 1;

        this.eventArray.push(tBox, tPlane);
        this.group.add(tPlane, tBox);
    }
	
});
}
// export { CreatTest };