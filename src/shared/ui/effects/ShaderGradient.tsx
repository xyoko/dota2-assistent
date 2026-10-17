import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface ShaderGradientProps {
  className?: string;
  speed?: number;
  intensity?: number;
  paused?: boolean;
}

const vertexShader = `#version 300 es
in vec2 uv;
in vec3 position;
out vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uIntensity;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 st = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  st.x *= aspect;

  vec2 mouseOffset = (uMouse - 0.5) * 0.15;
  vec2 pos = st * 1.35 + mouseOffset;

  float t = uTime * 0.14;

  // Domain warping with simplex noise
  float n1 = snoise(pos + vec2(t * 0.4, -t * 0.25));
  float n2 = snoise(pos * 1.5 + vec2(-t * 0.35, t * 0.3) + vec2(n1 * 0.65));
  float n3 = snoise(pos * 2.2 + vec2(t * 0.15, t * 0.45) + vec2(n2 * 0.5));

  // Dark.design + Dota 2 Palette:
  // Color 0: Deep Obsidian Void (#07090e)
  vec3 cVoid = vec3(0.027, 0.035, 0.055);
  // Color 1: Abyssal Slate (#0f172a)
  vec3 cSlate = vec3(0.059, 0.090, 0.165);
  // Color 2: Dire Blood Crimson (#7f1d1d)
  vec3 cCrimson = vec3(0.498, 0.114, 0.114);
  // Color 3: Arcane Mana Void (#3b0764)
  vec3 cArcane = vec3(0.231, 0.027, 0.392);
  // Color 4: Radiant Aegis Amber (#d97706)
  vec3 cAmber = vec3(0.851, 0.467, 0.024);

  // Gradient mixing layers
  vec3 color = mix(cVoid, cSlate, smoothstep(-0.6, 0.8, n1));
  color = mix(color, cArcane, smoothstep(-0.2, 0.9, n2) * 0.55);
  color = mix(color, cCrimson, smoothstep(0.1, 1.0, n3) * 0.45 * uIntensity);
  
  // Subtle amber highlight crests
  float crest = smoothstep(0.65, 0.98, n3);
  color = mix(color, cAmber, crest * 0.38 * uIntensity);

  // Optical vignette around screen edges
  vec2 uvNorm = gl_FragCoord.xy / uResolution.xy;
  float vig = uvNorm.x * uvNorm.y * (1.0 - uvNorm.x) * (1.0 - uvNorm.y);
  vig = clamp(pow(16.0 * vig, 0.35), 0.0, 1.0);
  color *= mix(0.75, 1.0, vig);

  fragColor = vec4(color, 1.0);
}
`;

export const ShaderGradient: React.FC<ShaderGradientProps> = ({
  className = '',
  speed = 1.0,
  intensity = 1.0,
  paused = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    let animId: number = 0;
    let isDestroyed = false;

    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5)
      });
    } catch {
      setWebGlSupported(false);
      return;
    }

    const gl = renderer.gl;
    if (!gl) {
      setWebGlSupported(false);
      return;
    }

    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.pointerEvents = 'none';
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const uniforms = {
      uTime: { value: 0 },
      uResolution: { value: [container.clientWidth || 800, container.clientHeight || 600] },
      uMouse: { value: [0.5, 0.5] },
      uIntensity: { value: intensity }
    };

    let program: Program;
    try {
      program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms
      });
    } catch (err) {
      console.warn('WebGL ShaderGradient compilation note, falling back to CSS:', err);
      setWebGlSupported(false);
      if (renderer.gl.canvas.parentNode) {
        renderer.gl.canvas.parentNode.removeChild(renderer.gl.canvas);
      }
      return;
    }

    const mesh = new Mesh(gl, { geometry, program });

    const handleResize = () => {
      if (!container || !renderer) return;
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value = [width, height];
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1.0 - e.clientY / window.innerHeight;
      // Smooth interpolation
      uniforms.uMouse.value[0] += (x - uniforms.uMouse.value[0]) * 0.05;
      uniforms.uMouse.value[1] += (y - uniforms.uMouse.value[1]) * 0.05;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let lastTime = performance.now();
    let accumulatedTime = 0;

    const renderLoop = (time: number) => {
      if (isDestroyed) return;

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (!paused && delta < 0.2) {
        accumulatedTime += delta * speed;
        uniforms.uTime.value = accumulatedTime;
        renderer?.render({ scene: mesh });
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [speed, intensity, paused]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Fallback CSS animated radial gradient in case WebGL is unavailable */}
      {!webGlSupported && (
        <div className="absolute inset-0 bg-[#07090e] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(127,29,29,0.3),rgba(59,7,100,0.25),rgba(7,9,14,0.95))]" />
      )}
    </div>
  );
};
export default ShaderGradient;
