// Return a shader program from a vertex and fragment shader source
function initShader(gl, source_vert, source_frag) {

    // Create shaders
    var shader_vert = gl.createShader(gl.VERTEX_SHADER);
    var shader_frag = gl.createShader(gl.FRAGMENT_SHADER);

    // Link shaders to source code
    gl.shaderSource(shader_vert, source_vert);
    gl.shaderSource(shader_frag, source_frag);

    // Compile shaders
    gl.compileShader(shader_vert);
    gl.compileShader(shader_frag);

    // Handle compilation errors
    if (!gl.getShaderParameter(shader_vert, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader', gl.getShaderInfoLog(shader_vert));
        return false;
    }
    if (!gl.getShaderParameter(shader_frag, gl.COMPILE_STATUS)) {
        console.error('Error compiling fragment shader', gl.getShaderInfoLog(shader_frag));
        return false;
    }

    // Create shader program and attach shaders
    var program = gl.createProgram();

    gl.attachShader(program, shader_vert);
    gl.attachShader(program, shader_frag);

    // Link program to WebGL context
    if (gl.linkProgram(program) == false) {
        console.error('Error linking program', gl.getProgramInfoLog(program));
        return false;
    }

    console.log("Program initialized successfully");
    return program;
}

//===== MAIN =====//
window.onload = async () => {
    let canvas = document.getElementById("gl");

    let vs = await fetch("./vert.glsl").then((res) => res.text());
    let fs = await fetch("./frag.glsl").then((res) => res.text());

    let gl = canvas.getContext("webgl2");

    if (!gl) {
        console.log("WebGL2 is not supported!");
        return;
    }

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    // Clear screen to black
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // Create vercies buffer
    let vertices = new Float32Array([ 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0 ]);

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);


    let program = initShader(gl, vs, fs);
    if (!program) return;

    gl.useProgram(program);

    const uniforms = {
        // "color": [0.0, 0.0, 1.0, 1.0],
        "color":        { type: "4fv", val: [0x1e, 0x1e, 0x2e, 0xff].map(x => x/255.0) },
        "translation":  { type: "2fv", val: [0.0, 0.0] },
        "zoom":         { type: "1f", val: 1.0 },
    };
    const attribs = {
        "position": null,
    };

    // Set `color` in shaders
    for (let u of Object.keys(uniforms)) {
        const config = uniforms[u];
        uniforms[u] = gl.getUniformLocation(program, u);
        if (uniforms[u] == null) continue;

        console.log("UNIFORM", u, uniforms[u]);

        gl[`uniform${config.type}`](uniforms[u], config.val);
    }
    
    for (let a of Object.keys(attribs)) {
        attribs[a] = gl.getAttribLocation(program, a);
        if (attribs[a] == -1) continue; // Not found / discarded during compilation

        console.log("ATTRIB", a, attribs[a]);
        gl.enableVertexAttribArray(attribs[a]);
        gl.vertexAttribPointer(attribs[a], 2, gl.FLOAT, false, 0, 0);
    }

    console.log(uniforms);
    console.log(attribs);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8);

    let translation = { x: 0, y: 0 };
    window.onmousemove = (e) => {
        // Check if mousedown
        if (e.buttons == 1) {
            // Update translation
            translation.x += (e.movementX / gl.viewportWidth) / 2**zoom;
            translation.y -= (e.movementY / gl.viewportHeight) / 2**zoom;
            gl.uniform2fv(uniforms["translation"], [translation.x, translation.y]);
        }

    }

    let zoom = 1.0;
    window.onwheel = (e) => {
        zoom -= e.deltaY / 500;
        gl.uniform1f(uniforms["zoom"], 2**zoom);
    }

    function loop() {
        // vertices = new Float32Array([
        //     0.0, 0.0,
        //     0.0, 1.0,
        //     x, y
        // ]);
        // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        // gl.bufferSubData(gl.ARRAY_BUFFER, 8, new Float32Array([x, y]));

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 8);

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}