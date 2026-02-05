import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface MultiplierGateProps {
  position: [number, number, number]
  multiplier: number
  hit: boolean
}

export default function MultiplierGate({ position, multiplier, hit }: MultiplierGateProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const leftPillarRef = useRef<THREE.Mesh>(null!)
  const rightPillarRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    if (groupRef.current && !hit) {
      // Floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }

    // Pulsing pillars
    if (leftPillarRef.current && rightPillarRef.current && !hit) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1
      leftPillarRef.current.scale.x = pulse
      rightPillarRef.current.scale.x = pulse
    }
  })

  if (hit) {
    return null
  }

  const gateColor = multiplier >= 4 ? '#ffff00' : multiplier >= 3 ? '#ff00ff' : '#00ff88'

  return (
    <group ref={groupRef} position={position}>
      {/* Left pillar */}
      <mesh ref={leftPillarRef} position={[-2, 0.5, 0]} castShadow>
        <RoundedBox args={[0.3, 2, 0.3]} radius={0.05}>
          <meshStandardMaterial
            color={gateColor}
            emissive={gateColor}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </mesh>

      {/* Right pillar */}
      <mesh ref={rightPillarRef} position={[2, 0.5, 0]} castShadow>
        <RoundedBox args={[0.3, 2, 0.3]} radius={0.05}>
          <meshStandardMaterial
            color={gateColor}
            emissive={gateColor}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </mesh>

      {/* Top bar */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <RoundedBox args={[4.3, 0.3, 0.3]} radius={0.05}>
          <meshStandardMaterial
            color={gateColor}
            emissive={gateColor}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </RoundedBox>
      </mesh>

      {/* Multiplier text */}
      <Text
        position={[0, 0.5, 0.2]}
        fontSize={1}
        color={gateColor}
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/orbitron/v31/yMJRMIlzdpvBhQQL_Qq7dy0.woff2"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        x{multiplier}
        <meshStandardMaterial
          color={gateColor}
          emissive={gateColor}
          emissiveIntensity={1}
          toneMapped={false}
        />
      </Text>

      {/* Gate glow plane */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[3.5, 1.8]} />
        <meshBasicMaterial
          color={gateColor}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Point lights */}
      <pointLight position={[-2, 1, 0]} color={gateColor} intensity={0.5} distance={3} />
      <pointLight position={[2, 1, 0]} color={gateColor} intensity={0.5} distance={3} />
    </group>
  )
}
