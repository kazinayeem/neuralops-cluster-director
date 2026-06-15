import React, { useEffect, useRef } from "react";

export default function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fs = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = v_texCoord;
        
        // Deep layered navy flowing fields
        vec3 color1 = vec3(0.043, 0.063, 0.125); // #0B1020 base
        vec3 color2 = vec3(0.067, 0.094, 0.153); // slightly lighter navy
        vec3 accent = vec3(0.231, 0.510, 0.965); // Electric Blue #3B82F6
        vec3 cyan = vec3(0.184, 0.843, 0.964); // Cyan #2FD0F6
        
        // Complex fluid noise waves
        float noise = sin(uv.x * 2.5 + u_time * 0.15) * cos(uv.y * 2.0 - u_time * 0.2);
        noise += sin(uv.y * 4.0 + u_time * 0.45) * 0.4;
        noise += cos(uv.x * 6.0 - u_time * 0.3) * 0.2;
        
        vec3 base = mix(color1, color2, noise * 0.5 + 0.5);
        
        // Floating data particle stream glow
        float pulse = pow(sin(uv.x * 8.0 + u_time * 0.8) * 0.5 + 0.5, 25.0);
        pulse *= pow(sin(uv.y * 3.0 + u_time * 0.5) * 0.5 + 0.5, 12.0);
        
        // Heat distortion based on mouse hover coordinates
        vec2 mCoords = u_mouse / u_resolution;
        float distToMouse = distance(uv, mCoords);
        float mouseGlow = 0.0;
        if (distToMouse < 0.25) {
          mouseGlow = smoothstep(0.25, 0.0, distToMouse) * 0.12;
        }

        vec3 finalColor = mix(base, accent, pulse * 0.14);
        finalColor = mix(finalColor, cyan, mouseGlow);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    function compileShader(type: number, src: string): WebGLShader | null {
      const s = gl!.createShader(type);
      if (!s) return null;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error("Shader compiles fail:", gl!.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fs);
    if (!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = window.innerHeight - e.clientY; // Flip Y coordinates to match WebGL
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    function syncAndRender(t: number) {
      if (!canvas || !gl) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }

      gl.uniform1f(uTime, t * 0.001);
      gl.uniform2f(uRes, w, h);
      gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationId = requestAnimationFrame(syncAndRender);
    }

    animationId = requestAnimationFrame(syncAndRender);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 bg-brand-bg select-none pointer-events-none"
      style={{ display: "block" }}
    />
  );
}
