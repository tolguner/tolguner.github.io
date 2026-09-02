"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";

type Props = { progress: MutableRefObject<number>; count?: number };

// Fibonacci küresi üzerine dağıtılmış düğümler ve yakın komşular arasında çizgiler.
function Nodes({ progress, count }: Required<Props>) {
  const group = useRef<THREE.Group>(null);
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);

  const { positions, lines } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pts.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r));
    }
    const positions = new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z]));
    const threshold = Math.sqrt(4 * Math.PI / count) * 1.35; // ortalama komşu mesafesinin biraz üstü
    const seg: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < threshold) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    return { positions, lines: new Float32Array(seg) };
  }, [count]);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const p = progress.current; // 0 = hero başı, 1 = hero'dan çıkış
    g.rotation.y += dt * 0.12;
    const tx = state.pointer.y * 0.35 + p * 0.6;
    const tz = -state.pointer.x * 0.25;
    g.rotation.x += (tx - g.rotation.x) * 0.05;
    g.rotation.z += (tz - g.rotation.z) * 0.05;
    const s = 1 + p * 0.9;
    g.scale.setScalar(s);
    if (pointsMat.current) pointsMat.current.opacity = 0.95 * (1 - p * 0.9);
    if (lineMat.current) lineMat.current.opacity = 0.28 * (1 - p);
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial ref={pointsMat} size={0.028} color="#9fc0ff" transparent opacity={0.95} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lines, 3]} />
        </bufferGeometry>
        <lineBasicMaterial ref={lineMat} color="#4f7cff" transparent opacity={0.28} depthWrite={false} />
      </lineSegments>
      {/* iç çekirdek — hafif parıltı */}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshBasicMaterial color="#1a3a8a" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function NodeSphere({ progress, count = 220 }: Props) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 3.1], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Nodes progress={progress} count={count} />
    </Canvas>
  );
}
