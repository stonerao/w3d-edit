import * as THREE from 'three';
const setBeforeCompile = (shader, uvs = [], timeVal) => {
    shader.uniforms.time = timeVal; // time
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
export { setBeforeCompile };