import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ProjectileProps {
  position: THREE.Vector3
}

export default function Projectile({ position }: ProjectileProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.copy(position)
      // Pulsing glow
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 1
      meshRef.current.scale.setScalar(pulse)
    }
    if (glowRef.current) {
      glowRef.current.position.copy(position)
      const pulse = Math.sin(state.clock.elapsedTime * 10) * 0.2 + 1.5
      glowRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      {/* Core ball */}
      <mesh ref={meshRef} position={position.toArray()} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>

      {/* Glow sphere */}
      <mesh ref={glowRef} position={position.toArray()}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Point light for extra glow */}
      <pointLight
        position={position.toArray()}
        color="#00ffff"
        intensity={0.5}
        distance={3}
      />
    </group>
  )
}
