attribute vec4 position;
uniform vec2 translation;
uniform float zoom;

void main() {
    // gl_Position = position;
    gl_Position = vec4(((position.xy + translation) * 2.0 - 1.0) * zoom, 0.0, 1.0);
    // gl_PointSize = 20.0;
}