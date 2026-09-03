"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import Core from "./Core";

type Props = {
  progress: MutableRefObject<number>;
  count?: number;
  /** Açılış: 0 = kamera kürenin içinde, 1 = normal konum. Yoksa kamera sabit. */
  giris?: MutableRefObject<number>;
};

const IC_Z = 0.16; // kamera kürenin içindeyken
const DIS_Z = 3.1; // yerleşik konum
const IC_FOV = 104;
const DIS_FOV = 48;

/**
 * Açılışta kamera kürenin içinden dışarı çekilir: noktalar hızla yanımızdan
 * geçer, görüş açısı daralırken küre yerine oturur. `giris` 1'e ulaşınca
 * kameraya bir daha dokunulmaz, kaydırma davranışı devralır.
 */
function Kamera({ giris }: { giris?: MutableRefObject<number> }) {
  const { camera } = useThree();
  const bittiMi = useRef(false);

  useFrame(() => {
    if (!giris || bittiMi.current) return;
    const g = Math.min(1, Math.max(0, giris.current));
    const k = camera as THREE.PerspectiveCamera;
    k.position.z = IC_Z + (DIS_Z - IC_Z) * g;
    k.fov = IC_FOV + (DIS_FOV - IC_FOV) * g;
    k.rotation.z = (1 - g) * 0.5; // hafif yalpalama, çıkarken düzelir
    k.updateProjectionMatrix();
    if (g >= 1) {
      k.rotation.z = 0;
      bittiMi.current = true;
    }
  });

  return null;
}

/** Fareyi pencere genelinde izler; imleç tuvalin dışındayken de küre tepki verir. */
function useWindowPointer() {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  return p;
}

// Fibonacci küresi üzerine dağıtılmış düğümler ve yakın komşular arasında çizgiler.
function Nodes({ progress, count, giris }: { progress: MutableRefObject<number>; count: number; giris?: MutableRefObject<number> }) {
  const konum = useRef<THREE.Group>(null); // sahnedeki yatay yerleşim
  const tilt = useRef<THREE.Group>(null); // fareye tepki veren dış grup
  const spin = useRef<THREE.Group>(null); // kendi ekseninde dönen iç grup
  const pointsMat = useRef<THREE.PointsMaterial>(null);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const pointer = useWindowPointer();
  const { size } = useThree();

  /**
   * Tuval tüm ekranı kaplıyor; küre sahne içinde sağa kaydırılarak tasarımdaki
   * yerine oturuyor. Böylece açılışta kamera içerideyken sol taraf da tuvalin
   * içinde kalıyor, küre kenardan kesilmiyor.
   */
  const kaydirma = useMemo(() => {
    const dunyaY = 2 * DIS_Z * Math.tan(((DIS_FOV / 2) * Math.PI) / 180);
    const dunyaX = dunyaY * (size.width / Math.max(1, size.height));
    return dunyaX * (size.width >= 768 ? 0.19 : 0.32);
  }, [size.width, size.height]);

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
    const threshold = Math.sqrt((4 * Math.PI) / count) * 1.35; // ortalama komşu mesafesinin biraz üstü
    const seg: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < threshold) seg.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
    return { positions, lines: new Float32Array(seg) };
  }, [count]);

  useFrame((_, dt) => {
    const t = tilt.current;
    const s = spin.current;
    if (!t || !s) return;
    // açılışta ekranın ortasında başlar, kamera çekilirken yerine kayar
    if (konum.current) konum.current.position.x = kaydirma * (giris ? Math.min(1, Math.max(0, giris.current)) : 1);
    const p = progress.current; // 0 = hero başı, 1 = hero'dan çıkış
    const mx = pointer.current.x;
    const my = pointer.current.y;

    // sürekli dönüş iç grupta — fare tepkisiyle çakışmaz.
    // Açılışta hız duygusu için başta çok daha hızlı döner.
    const g = giris ? Math.min(1, Math.max(0, giris.current)) : 1;
    s.rotation.y += dt * (0.12 + (1 - g) * 2.2);

    // fareye göre eğilme: dış grupta, geniş genlikli
    const hedefX = my * 0.62 + p * 0.6;
    const hedefY = mx * 0.55;
    const hedefZ = -mx * 0.34;
    const k = 1 - Math.pow(0.001, dt); // kare hızından bağımsız yumuşatma (~0.11/kare)
    t.rotation.x += (hedefX - t.rotation.x) * k;
    t.rotation.y += (hedefY - t.rotation.y) * k;
    t.rotation.z += (hedefZ - t.rotation.z) * k;

    // hafif paralaks: küre imleci takip ediyormuş gibi kayar
    t.position.x += (mx * 0.22 - t.position.x) * k;
    t.position.y += (my * 0.14 - t.position.y) * k;

    const olcek = 1 + p * 0.9;
    t.scale.setScalar(olcek);

    if (pointsMat.current) pointsMat.current.opacity = 0.95 * (1 - p * 0.9);
    if (lineMat.current) lineMat.current.opacity = 0.28 * (1 - p);
  });

  return (
    <group ref={konum}>
      <group ref={tilt}>
        <group ref={spin}>
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
          {/* iç çekirdek */}
          <Core progress={progress} />
        </group>
      </group>
    </group>
  );
}

export default function NodeSphere({ progress, count = 220, giris }: Props) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 3.1], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Kamera giris={giris} />
      <Nodes progress={progress} count={count} giris={giris} />
    </Canvas>
  );
}
