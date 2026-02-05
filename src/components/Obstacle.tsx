import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface ObstacleProps {
  position: [number, number, number]
  scale: number
  health: number
  maxHealth: number
  destroyed: boolean
}

export default function Obstacle({ position, scale, health, maxHealth, destroyed }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null!)
  const [isHit, setIsHit] = useState(false)
  const [explosionParticles, setExplosionParticles] = useState<THREE.Vector3[]>([])
  const prevHealth = useRef(health)

  // Detect hit
  useEffect(() => {
    if (health < prevHealth.current) {
      setIsHit(true)
      setTimeout(() => setIsHit(false), 100)
    }
    prevHealth.current = health
  }, [health])

  // Create explosion particles when destroyed
  useEffect(() => {
    if (destroyed) {
      const particles: THREE.Vector3[] = []
      for (let i = 0; i < 8; i++) {
        particles.push(
          new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2
          )
        )
      }
      setExplosionParticles(particles)
    }
  }, [destroyed])

  useFrame((state, delta) => {
    if (meshRef.current && !destroyed) {
      // Wobble when hit
      if (isHit) {
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 50) * 0.2
        meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 50) * 0.2
      } else {
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.1)
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.1)
      }
    }

    // Animate explosion particles
    setExplosionParticles(prev =>
      prev.map(p => new THREE.Vector3(
        p.x * 1.05,
        p.y + delta * 3,
        p.z * 1.05
      )).filter(p => p.y < 5)
    )
  })

  // Calculate color based on health
  const healthPercent = health / maxHealth
  const color = new THREE.Color().lerpColors(
    new THREE.Color('#ff0044'),
    new THREE.Color('#ff8800'),
    healthPercent
  )

  if (destroyed && explosionParticles.length === 0) {
    return null
  }

  return (
    <group position={position}>
      {/* Main obstacle */}
      {!destroyed && (
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          scale={isHit ? scale * 1.1 : scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={isHit ? '#ffffff' : color}
            emissive={isHit ? '#ff0000' : color}
            emissiveIntensity={isHit ? 1 : 0.3}
            metalness={0.3}
            roughness={0.5}
          />
        </mesh>
      )}

      {/* Health indicator */}
      {!destroyed && maxHealth > 1 && (
        <mesh position={[0, scale * 0.7 + 0.3, 0]}>
          <planeGeometry args={[scale * 1.2, 0.15]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      )}
      {!destroyed && maxHealth > 1 && (
        <mesh position={[(healthPercent - 1) * scale * 0.6, scale * 0.7 + 0.3, 0.01]}>
          <planeGeometry args={[scale * 1.2 * healthPercent, 0.12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}

      {/* Explosion particles */}
      {explosionParticles.map((p, i) => (
        <mesh key={i} position={p.toArray()}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial
            color="#ff8800"
            emissive="#ff4400"
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Point light when hit */}
      {isHit && (
        <pointLight color="#ff0000" intensity={2} distance={3} />
      )}
    </group>
  )
}
