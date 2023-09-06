precision mediump float;
uniform vec4 color;

void main() {
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    gl_FragColor = color;
}


uniform sampler2D texture1;
uniform sampler2D texture2;
varying vec2 texCoord;

// void main() {
//     vec4 color1 = texture2D(texture1, texCoord);
//     vec4 color2 = texture2D(texture2, texCoord);
//     float alpha = color1.a + color2.a * (1.0 - color1.a);
//     vec3 rgb = mix(color2.rgb, color1.rgb, color1.a);
//     gl_FragColor = vec4(rgb, alpha);
// }

uniform sampler2D texture;
uniform float brightness;
uniform float contrast;

// void main() {
//     vec4 color = texture2D(texture, texCoord);
//     color.rgb += brightness;
//     if (contrast > 0.0) {
//         color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
//     } else {
//         color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
//     }
//     gl_FragColor = color;
// }