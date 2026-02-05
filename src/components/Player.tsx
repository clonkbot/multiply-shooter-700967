import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface PlayerProps {
  position: [number, number, number]
  canShoot: boolean
  gameState: 'menu' | 'playing' | 'gameover'
}

export default function Player({ position, canShoot, gameState }: PlayerProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const barrelRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.PointLight>(null!)

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle floating
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.05
    }

    if (barrelRef.current) {
      // Recoil animation when can't shoot
      const targetZ = canShoot ? 0 : 0.2
      barrelRef.current.position.z = THREE.MathUtils.lerp(
        barrelRef.current.position.z,
        targetZ,
        0.2
      )
    }

    if (glowRef.current) {
      // Pulse glow based on shoot availability
      glowRef.current.intensity = canShoot
        ? 1 + Math.sin(state.clock.elapsedTime * 5) * 0.3
        : 0.3
    }
  })

  if (gameState !== 'playing') return null

  return (
    <group ref={groupRef} position={position}>
      {/* Base platform */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <RoundedBox args={[1.5, 0.3, 1.5]} radius={0.1}>
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </mesh>

      {/* Cannon body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <RoundedBox args={[0.8, 0.5, 0.8]} radius={0.1}>
          <meshStandardMaterial
            color="#00cccc"
            emissive="#00ffff"
            emissiveIntensity={0.3}
            metalness={0.9}
            roughness={0.1}
          />
        </RoundedBox>
      </mesh>

      {/* Cannon barrel */}
      <mesh ref={barrelRef} position={[0, 0.4, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 16]} />
        <meshStandardMaterial
          color={canShoot ? '#00ffff' : '#006666'}
          emissive={canShoot ? '#00ffff' : '#003333'}
          emissiveIntensity={canShoot ? 0.5 : 0.1}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Barrel tip glow ring */}
      <mesh position={[0, 0.4, -0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.03, 8, 24]} />
        <meshStandardMaterial
          color={canShoot ? '#00ffff' : '#003333'}
          emissive={canShoot ? '#00ffff' : '#001111'}
          emissiveIntensity={canShoot ? 1 : 0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Energy core */}
      <mesh position={[0, 0.5, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={canShoot ? 1 : 0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Glow light */}
      <pointLight
        ref={glowRef}
        position={[0, 0.5, -0.5]}
        color="#00ffff"
        intensity={1}
        distance={5}
      />

      {/* Side accents */}
      {[-1, 1].map(side => (
        <mesh key={side} position={[side * 0.5, 0.3, 0]} castShadow>
          <RoundedBox args={[0.15, 0.4, 0.6]} radius={0.05}>
            <meshStandardMaterial
              color="#ff00ff"
              emissive="#ff00ff"
              emissiveIntensity={0.3}
              metalness={0.8}
              roughness={0.2}
            />
          </RoundedBox>
        </mesh>
      ))}
    </group>
  )
}
