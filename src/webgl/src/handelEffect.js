import * as THREE from 'three';
import EffectBase from './EffectBase';
class handelEffect extends EffectBase {
    constructor(config) {
        super(config);
        EffectBase.call(this, config);

        this.group = new THREE.Group();
        this.timeVal = { value: 0 };

        this.init();
    }

    init() {

    }
    // 创建组件效果
    createCommEffect(options, position, nowId) {
        // 生成方法
        const eff = eval(`new ${options.func}(${JSON.stringify(options.options)})`);
        eff.nowId = nowId;
        eff.group.position.copy(position);
        renderers.addEffect(eff); 
    }

    handelEffect(object, callback) {
        if (Array.isArray(object.material)) {
            object.material.forEach((mat) => {
                callback(mat);
            })
        } else {
            callback(object.material);
        }
    }
    // 设置节点下的所有效果
    setObjectEffect(object, options) {
        const colors = this.getColorArr(options.color);
        // 检查当前效果中是否已有当前效果，如果有则替换
        const hasEffect = object._option.effects.filter(effect => effect.id === options.id).length !== 0;
        if (!hasEffect) {
            object._option.effects.push(options);
        } else {
            object._option.effects.forEach(effect => effect.id === options.id);
        }
        switch (options.id) {
            case 1:
                // 光波中心扩散
                this.handelEffect(object, (mat) => {
                    mat._uniforms.u_type.value = options.id;
                    mat._uniforms.u_radius.value = options.radius;
                    mat._uniforms.u_range.value = options.range;
                    mat._uniforms.u_speed.value = options.speed;
                    mat._uniforms.u_center.value.copy(options.center);
                    mat._uniforms.u_color.value = colors[0];
                    mat._uniforms.u_opacity.value = colors[1];
                })
                break;
            case 2:
                // 给组件添加
                if (!object.geometry) { return false }
                // this.addEffectGeometryLine()
                {
                    const geometry = new THREE.EdgesGeometry(object.geometry);
                    const material = new THREE.MeshPhongMaterial({
                        color: colors[0],
                        opacity: colors[1],
                        transparent: true,
                    });
                    const line = new THREE.LineSegments(geometry, material);
                    line.name = options.name;
                    line._isEffect = true;
                    line._option = options;
                    object.add(line);
 
                    material.onBeforeCompile = (shader) => {
                        material._uniforms = shader.uniforms;
                        material._shader = shader.uniforms;
                        this.setBeforeCompile(shader, []);
                    };
                    Contact.updateTree();
                }
                break;
        }
    }
    // 设置材质效果 
    setMaterialEffect(material) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.time = this.timeVal;
        }
        material.setValues({
            color: new THREE.Color("#fff")
        });
    }

    setBeforeCompile(shader, uvs = []) {
        shader.uniforms.time = this.timeVal; // time
        shader.uniforms.u_type = { value: 0 }; // 类型
        shader.uniforms.u_radius = { value: 0 }; // 半径
        shader.uniforms.u_range = { value: 0 }; //  
        shader.uniforms.u_speed = { value: 0 }; //   
        shader.uniforms.u_height = { value: 0 }; //   
        shader.uniforms.u_opacity = { value: 0 }; //  
        shader.uniforms.u_color = { value: new THREE.Color() }; // color
        shader.uniforms.u_center = { value: new THREE.Vector3() }; // 散播 雷达类中心点 
        uvs = ['uv2']
        let uvStr = ``;
        let uvScript = ``;
        let vecterUv = ``;
        let vecterUvOut = ``;
        uvs.forEach((uv) => {
            shader.uniforms[`_${uv}`] = { value: 0.0 };
            shader.uniforms[`u_map_${uv}`] = { value: null };
            vecterUv += `attribute vec2 ${uv};
        varying vec2 a_${uv};
        `;
            vecterUvOut += `a_${uv} = ${uv};`;
            uvStr += `varying vec2 a_${uv}; 
        uniform float _${uv};
        uniform sampler2D u_map_${uv};`;
            uvScript += `int d${uv} = int(_${uv});
        if (d${uv} == 1) {
            vec4 u_t_${uv} = texture2D(u_map_${uv}, a_${uv});
            lastColor = u_t_${uv}.rgb * lastColor;
        }`;
        });
        // 公共方法
        const utilsFunc = `
        // 三维向量距离
        float distanceToVec3(vec3 src, vec3 dst) {
            float dx = src.x - dst.x;
            float dy = src.y - dst.y;
            float dz = src.z - dst.z;
            float squared = dx * dx + dy * dy + dz * dz;
            return sqrt(squared);
        }
        // 二维向量距离
        float distanceTo(vec2 src, vec2 dst) {
            float dx = src.x - dst.x;
            float dy = src.y - dst.y;
            float dv = dx * dx + dy * dy;
            return sqrt(dv);
        }
        // 插值
        float lerp (float x,float y,float t ) {
            return ( 1.0 - t ) * x + t * y;
        }
        // 计算插值颜色
        vec3 lerpColor(vec3 sColor, vec3 dColor,float t) {
            float r = lerp(sColor.r, dColor.r, t);
            float g = lerp(sColor.g, dColor.g, t);
            float b = lerp(sColor.b, dColor.b, t);
            return vec3(r, g, b);
        }
        `;

        // 更换头部，注册uniforms
        const fragmentHeader = `
        
        uniform float time;
        uniform float u_speed;
        uniform float u_type;
        uniform float u_range;
        uniform float u_radius;
        uniform float u_opacity;
        uniform vec3 u_color;
        uniform vec3 u_center; 
        varying vec4 vPosition; // position
        ${uvStr}

        ${utilsFunc}
        void main() {
        `;
        // 更换头部，注册uniforms
        const fragmentColor = `
        int dType = int(u_type); // type
        float iTime = time * u_speed;

        vec3 lastColor = outgoingLight;
        float lastOpacity = diffuseColor.a;

        // 根据类型在图形中增加效果
        vec3 _center = vec3(.0, .0, .0);
        if (dType == 1) {
            float iRadius = mod(iTime, u_radius);
            float len = distanceToVec3(_center, vec3(vPosition.xyz));
            if (iRadius > len - u_range && iRadius < len) {
                float t = sin( (len - iRadius) / u_range * PI );
                lastColor = lerpColor(lastColor, u_color, t);
                lastOpacity = lerp(lastOpacity, u_opacity, t);
            }
        };
        ${uvScript}

        gl_FragColor = vec4( lastColor, lastOpacity );
        `;

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            fragmentHeader
        )
        shader.fragmentShader = shader.fragmentShader.replace(
            "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
            fragmentColor
        );
        const vertex = `${vecterUv}
varying vec4 vPosition;
void main() {
    vPosition = projectionMatrix * vec4(position, 1.0);
	${vecterUvOut}
`;
        shader.vertexShader = shader.vertexShader.replace("void main() {", vertex);
    }

    onMouseIn(e, intersects) {
    }
    onMouseOut(e, intersects, key) {

    }
    onMouseDown(e, intersects) {

    }
    onDblclick(e, intersects) {
    }
    animate = (dt) => {
        this.timeVal.value += dt;
    }
}

export default handelEffect;