// gong'y
const shaderUtils = `
float lerp (float x,float y,float t ) {
  return ( 1.0 - t ) * x + t * y;
}
vec3 colorLerp(vec3 color1, vec3 color2, float t) {
    float r = lerp(color1.r, color2.r, t);
    float g = lerp(color1.g, color2.g, t);
    float b = lerp(color1.b, color2.b, t);
    return vec3(r, g, b);
}
float distanceTo(vec2 src, vec2 dst) {
	float dx = src.x - dst.x;
	float dy = src.y - dst.y;
	float dv = dx * dx + dy * dy;
	return sqrt(dv);
}
`
const Gradient = (shader) => {
    let vertexShader = shader.vertexShader;
    let fragmentShader = shader.fragmentShader;
    // 偏远
    const fragment = `
    ${shaderUtils}
    uniform float uMaxHeight;
    uniform float uMaxOpacity;
    uniform vec3 uColor; 
    varying vec3 v_position;
    void main() {`;
    fragmentShader = fragmentShader.replace("void main() {", fragment);

    const fragmentColor = `
    float i = smoothstep(0.0, uMaxHeight, v_position.z);
    vec3 outColor = colorLerp(outgoingLight, uColor, i);
    float outOpacity = lerp(diffuseColor.a, uMaxOpacity, i);
    gl_FragColor = vec4( outColor, outOpacity );
    `;
    fragmentShader = fragmentShader.replace(
        "gl_FragColor = vec4( outgoingLight, diffuseColor.a );",
        fragmentColor,
    )
    // 顶点
    const vertex = `
varying vec3 v_position;
void main() {
	v_position = position;
`;
    vertexShader = vertexShader.replace("void main() {", vertex)

    return { vertexShader, fragmentShader };
}
export {
    Gradient
}