"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vN = normalize(mat3(modelMatrix) * normal);
    vV = normalize(cameraPosition - wp.xyz);
    vP = position;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

/** Çekirdek: derin lacivert gövde, kenarda fresnel parlaması, içinde yavaş akan enerji. */
const coreFragment = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  uniform vec3 uDeep;
  uniform vec3 uRim;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;

  // ucuz, dokusuz dalgalanma
  float energy(vec3 p, float t) {
    float a = sin(p.y * 6.0 + t * 0.55);
    float b = sin(p.x * 4.5 - t * 0.42 + p.z * 3.5);
    float c = sin(length(p.xz) * 8.0 - t * 0.8);
    return (a * b * 0.5 + c * 0.5) * 0.5 + 0.5;
  }

  void main() {
    float f = pow(1.0 - clamp(dot(vN, vV), 0.0, 1.0), 2.2);   // kenara doğru artan parlama
    float e = energy(vP, uTime);
    vec3 col = uDeep + uRim * (f * 0.78 + e * 0.18);
    float a = (0.40 + f * 0.34) * uFade;
    gl_FragColor = vec4(col, a);
  }
`;

/** Dış kabuk: yalnızca kenarda görünen yumuşak hale. */
const haloFragment = /* glsl */ `
  uniform float uFade;
  uniform vec3 uRim;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vP;
  void main() {
    float f = pow(1.0 - abs(dot(vN, vV)), 3.2);
    gl_FragColor = vec4(uRim, f * 0.26 * uFade);
  }
`;

export default function Core({ progress }: { progress: MutableRefObject<number> }) {
  const core = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);

  const [coreMat, haloMat] = useMemo(() => {
    const deep = new THREE.Color("#0d1b3d");
    const rim = new THREE.Color("#4f7cff");
    return [
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: coreFragment,
        uniforms: {
          uTime: { value: 0 },
          uFade: { value: 1 },
          uDeep: { value: deep },
          uRim: { value: rim },
        },
        transparent: true,
        depthWrite: false,
      }),
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: haloFragment,
        uniforms: { uFade: { value: 1 }, uRim: { value: rim.clone() } },
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
      }),
    ];
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const fade = 1 - progress.current * 0.85;
    coreMat.uniforms.uTime.value = t;
    coreMat.uniforms.uFade.value = fade;
    haloMat.uniforms.uFade.value = fade;
    // çekirdek dış ağın tersine, daha yavaş dönsün — derinlik hissi verir
    if (core.current) {
      core.current.rotation.y -= dt * 0.08;
      core.current.rotation.x += dt * 0.03;
      const s = 1 + Math.sin(t * 0.6) * 0.012; // hafif nefes alma
      core.current.scale.setScalar(s);
    }
    if (halo.current) halo.current.rotation.y += dt * 0.05;
  });

  return (
    <group>
      <mesh ref={core} material={coreMat}>
        <icosahedronGeometry args={[0.37, 12]} />
      </mesh>
      <mesh ref={halo} material={haloMat}>
        <sphereGeometry args={[0.47, 48, 48]} />
      </mesh>
    </group>
  );
}
