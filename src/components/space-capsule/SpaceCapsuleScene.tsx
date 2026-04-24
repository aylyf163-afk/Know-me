import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SpaceCapsule from './SpaceCapsule'
import './spaceCapsule.css'

export default function SpaceCapsuleScene() {
  return (
    <div className="space-capsule-host" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.9, 7.2], fov: 48, near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SpaceCapsule />
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.06}
            enablePan={false}
            enableZoom
            zoomSpeed={0.55}
            rotateSpeed={0.65}
            minDistance={3.6}
            maxDistance={9.6}
            minPolarAngle={Math.PI * 0.28}
            maxPolarAngle={Math.PI * 0.56}
            target={[0, 1.3, 0]}
          />
        </Suspense>
      </Canvas>
      <div className="space-capsule-vignette" aria-hidden />
    </div>
  )
}
