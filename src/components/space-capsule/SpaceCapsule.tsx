import { useEffect, useMemo } from 'react'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { createEarthViewTexture } from './starfield'

const R = 7.6
const H = 6.4

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[R + 0.2, 128]} />
        <meshStandardMaterial color="#ffffff" roughness={0.75} metalness={0.02} />
      </mesh>
      {[1.7, 2.7, 3.85, 5.05, 6.2].map((radius) => (
        <mesh key={radius} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
          <ringGeometry args={[radius - 0.03, radius + 0.02, 192]} />
          <meshStandardMaterial color="#e7ebf1" roughness={0.82} metalness={0.02} />
        </mesh>
      ))}
    </group>
  )
}

function Walls() {
  return (
    <mesh position={[0, H / 2, 0]}>
      <cylinderGeometry args={[R, R, H, 128, 1, true]} />
      <meshStandardMaterial color="#ffffff" side={THREE.BackSide} roughness={0.55} metalness={0.04} />
    </mesh>
  )
}

function Ceiling() {
  const steps = [
    { ri: 2.55, ro: 3.2, y: H + 0.0 },
    { ri: 2.1, ro: 2.55, y: H + 0.16 },
    { ri: 1.7, ro: 2.1, y: H + 0.32 },
  ]
  const leds = [
    { r: 3.15, y: H + 0.001 },
    { r: 2.52, y: H + 0.155 },
    { r: 2.07, y: H + 0.315 },
  ]
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <ringGeometry args={[3.2, R + 0.02, 128]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>

      {steps.map((s, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, s.y, 0]}>
          <ringGeometry args={[s.ri, s.ro, 128]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.55}
            metalness={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {leds.map((l, i) => (
        <mesh key={`led-${i}`} rotation={[Math.PI / 2, 0, 0]} position={[0, l.y + 0.001, 0]}>
          <ringGeometry args={[l.r - 0.04, l.r, 128]} />
          <meshBasicMaterial color="#dff3ff" transparent opacity={0.9} toneMapped={false} />
        </mesh>
      ))}

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 0.41, 0]}>
        <circleGeometry args={[1.72, 128]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H + 0.4, 0]}>
        <ringGeometry args={[1.72, 1.82, 128]} />
        <meshBasicMaterial color="#cfeaff" transparent opacity={0.9} toneMapped={false} />
      </mesh>

      <pointLight position={[0, H - 0.2, 0]} intensity={3.2} color="#ffffff" distance={22} decay={1.4} />
      <pointLight position={[0, H + 0.35, 0]} intensity={1.6} color="#e6f6ff" distance={12} decay={1.8} />
    </group>
  )
}

function CurvedWindow({
  thetaCenter,
  thetaWidth,
  yCenter,
  yHeight,
  variant,
}: {
  thetaCenter: number
  thetaWidth: number
  yCenter: number
  yHeight: number
  variant: number
}) {
  const tex = useMemo(() => createEarthViewTexture(variant), [variant])
  useEffect(() => () => tex.dispose(), [tex])

  const thetaStart = thetaCenter - thetaWidth / 2
  const thetaLength = thetaWidth
  const glassR = R - 0.02
  const frameR = R - 0.08
  const frameThick = 0.08
  const padT = 0.005
  const padW = 0.04

  return (
    <group>
      <mesh position={[0, yCenter, 0]}>
        <cylinderGeometry
          args={[glassR, glassR, yHeight, 96, 1, true, thetaStart + padW, thetaLength - padW * 2]}
        />
        <meshBasicMaterial map={tex} side={THREE.BackSide} toneMapped={false} />
      </mesh>

      <mesh position={[0, yCenter + yHeight / 2 + frameThick / 2, 0]}>
        <cylinderGeometry args={[frameR, frameR, frameThick, 96, 1, true, thetaStart - padT, thetaLength + padT * 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.08} side={THREE.BackSide} />
      </mesh>
      <mesh position={[0, yCenter - yHeight / 2 - frameThick / 2, 0]}>
        <cylinderGeometry args={[frameR, frameR, frameThick, 96, 1, true, thetaStart - padT, thetaLength + padT * 2]} />
        <meshStandardMaterial color="#ffffff" roughness={0.45} metalness={0.08} side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, yCenter + yHeight / 2 + frameThick + 0.001, 0]}>
        <cylinderGeometry
          args={[frameR + 0.005, frameR + 0.005, 0.018, 96, 1, true, thetaStart, thetaLength]}
        />
        <meshBasicMaterial color="#cfeaff" transparent opacity={0.8} side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, yCenter - yHeight / 2 - frameThick - 0.001, 0]}>
        <cylinderGeometry
          args={[frameR + 0.005, frameR + 0.005, 0.018, 96, 1, true, thetaStart, thetaLength]}
        />
        <meshBasicMaterial color="#cfeaff" transparent opacity={0.8} side={THREE.BackSide} toneMapped={false} />
      </mesh>

      <spotLight
        position={[Math.sin(thetaCenter) * (R - 0.5), yCenter, Math.cos(thetaCenter) * (R - 0.5)]}
        target-position={[0, yCenter - 1.2, 0]}
        angle={0.85}
        penumbra={0.7}
        intensity={2.5}
        distance={20}
        decay={1.5}
        color="#bcdfff"
      />
    </group>
  )
}

function Podium() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.2, 2.35, 0.12, 96]} />
        <meshStandardMaterial color="#ffffff" roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.6, 1.72, 0.12, 96]} />
        <meshStandardMaterial color="#ffffff" roughness={0.38} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <cylinderGeometry args={[1.1, 1.22, 0.12, 96]} />
        <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.361, 0]}>
        <circleGeometry args={[1.08, 96]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.362, 0]}>
        <ringGeometry args={[1.08, 1.15, 96]} />
        <meshBasicMaterial color="#cfeaff" transparent opacity={0.85} toneMapped={false} />
      </mesh>
    </group>
  )
}

export default function SpaceCapsule() {
  return (
    <group>
      <color attach="background" args={['#f0f3f8']} />
      <fog attach="fog" args={['#f0f3f8', 20, 52]} />

      <ambientLight intensity={0.85} color="#ffffff" />
      <hemisphereLight args={['#ffffff', '#d8dfe9', 0.5]} />
      <directionalLight position={[0, H + 2, 0]} intensity={0.45} color="#ffffff" />

      <Floor />
      <Walls />
      <Ceiling />

      <CurvedWindow thetaCenter={Math.PI} thetaWidth={1.15} yCenter={3.1} yHeight={2.2} variant={1} />
      <CurvedWindow thetaCenter={Math.PI - 0.95} thetaWidth={0.45} yCenter={3.1} yHeight={2.2} variant={0} />
      <CurvedWindow thetaCenter={Math.PI + 0.95} thetaWidth={0.45} yCenter={3.1} yHeight={2.2} variant={2} />

      <Podium />

      <Sparkles
        count={80}
        scale={[R * 1.6, H * 0.9, R * 1.6]}
        size={2.4}
        speed={0.22}
        opacity={0.55}
        color="#cfeaff"
        position={[0, H / 2, 0]}
      />
    </group>
  )
}
