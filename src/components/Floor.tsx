import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Floor() {
  const gridRef = useRef<THREE.GridHelper>(null!)

  useFrame((state) => {
    if (gridRef.current) {
      // Scroll effect
      gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2
    }
  })

  return (
    <group>
      {/* Main floor plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, -20]}
        receiveShadow
      >
        <planeGeometry args={[40, 80]} />
        <meshStandardMaterial
          color="#0a0a15"
          metalness={0.5}
          roughness={0.8}
        />
      </mesh>

      {/* Animated grid */}
      <gridHelper
        ref={gridRef}
        args={[80, 40, '#00ffff', '#00ffff']}
        position={[0, 0.01, -20]}
      >
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.15}
        />
      </gridHelper>

      {/* Side rails - left */}
      <mesh position={[-6, 0.2, -20]}>
        <boxGeometry args={[0.2, 0.5, 80]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Side rails - right */}
      <mesh position={[6, 0.2, -20]}>
        <boxGeometry args={[0.2, 0.5, 80]} />
        <meshStandardMaterial
          color="#ff00ff"
          emissive="#ff00ff"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Accent lights along the track */}
      {Array.from({ length: 10 }, (_, i) => (
        <group key={i}>
          <pointLight
            position={[-6, 0.5, 5 - i * 6]}
            color="#ff00ff"
            intensity={0.3}
            distance={4}
          />
          <pointLight
            position={[6, 0.5, 5 - i * 6]}
            color="#00ffff"
            intensity={0.3}
            distance={4}
          />
        </group>
      ))}

      {/* Lane markers */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={`marker-${i}`}
          position={[0, 0.02, 5 - i * 3]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.3, 1]} />
          <meshBasicMaterial
            color="#00ffff"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}
