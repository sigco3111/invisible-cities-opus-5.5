import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';

// Final grade: tilt-shift (miniature look), vignette, warm grade, film grain.
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTilt: { value: 0.0 },     // 0..1 tilt-shift strength
    uFocusY: { value: 0.5 },   // focus band centre (uv.y)
    uVignette: { value: 0.9 },
    uGrain: { value: 0.045 },
    uFade: { value: 0.0 },     // fade to black
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime, uTilt, uFocusY, uVignette, uGrain, uFade;
    uniform vec2 uRes;
    varying vec2 vUv;
    float rand(vec2 co){ return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
    void main() {
      vec2 uv = vUv;
      float d = abs(uv.y - uFocusY);
      float blur = smoothstep(0.12, 0.55, d) * uTilt * 5.0;
      vec3 col = vec3(0.0);
      if (blur > 0.05) {
        float tot = 0.0;
        for (int i = -3; i <= 3; i++) {
          for (int j = -3; j <= 3; j++) {
            vec2 o = vec2(float(i), float(j)) / uRes * blur;
            float w = 1.0 - length(vec2(i, j)) / 4.5;
            col += texture2D(tDiffuse, uv + o).rgb * w;
            tot += w;
          }
        }
        col /= tot;
      } else {
        col = texture2D(tDiffuse, uv).rgb;
      }
      // gentle chromatic fringe toward edges
      vec2 cc = uv - 0.5;
      float edge = dot(cc, cc);
      col.r = mix(col.r, texture2D(tDiffuse, uv + cc * 0.004 * edge).r, 0.6);
      col.b = mix(col.b, texture2D(tDiffuse, uv - cc * 0.004 * edge).b, 0.6);
      // grade: lift shadows toward violet, warm highlights
      float l = dot(col, vec3(0.299, 0.587, 0.114));
      col = mix(col, col * vec3(1.04, 0.99, 0.94), smoothstep(0.3, 1.0, l));
      col += vec3(0.012, 0.006, 0.03) * (1.0 - smoothstep(0.0, 0.35, l));
      // vignette
      float v = smoothstep(0.95, 0.25, length(cc * vec2(uRes.x / uRes.y, 1.0)) * uVignette);
      col *= mix(0.55, 1.0, v);
      // grain
      col += (rand(uv * uRes + fract(uTime) * 100.0) - 0.5) * uGrain;
      col *= 1.0 - uFade;
      gl_FragColor = vec4(col, 1.0);
    }`,
};

export function makeComposer(renderer, scene, camera) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  const ao = new GTAOPass(scene, camera, size.x, size.y);
  ao.output = GTAOPass.OUTPUT.Default;
  ao.blendIntensity = 0.85;
  ao.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.4, thickness: 1.0, scale: 1.0, samples: 12 });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
  composer.addPass(ao);
  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.55, 0.6, 0.82);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const grade = new ShaderPass(GradeShader);
  composer.addPass(grade);
  const resize = (w, h, pr) => {
    composer.setPixelRatio(pr);
    composer.setSize(w, h);
    ao.setSize(w * pr, h * pr);
    grade.uniforms.uRes.value.set(w * pr, h * pr);
  };
  return { composer, bloom, grade, ao, resize };
}
