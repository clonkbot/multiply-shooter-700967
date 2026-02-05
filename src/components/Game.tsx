import { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Stars } from '@react-three/drei'
import * as THREE from 'three'
import Projectile from './Projectile'
import MultiplierGate from './MultiplierGate'
import Obstacle from './Obstacle'
import Player from './Player'
import Floor from './Floor'

interface GameProps {
  gameState: 'menu' | 'playing' | 'gameover'
  onScore: (points: number) => void
  onMultiply: () => void
  onGameOver: () => void
}

interface ProjectileData {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  multiplied: Set<number>
}

interface GateData {
  id: number
  position: [number, number, number]
  multiplier: number
  hit: boolean
}

interface ObstacleData {
  id: number
  position: [number, number, number]
  scale: number
  health: number
  maxHealth: number
  destroyed: boolean
}

export default function Game({ gameState, onScore, onMultiply, onGameOver }: GameProps) {
  const { camera } = useThree()
  const [projectiles, setProjectiles] = useState<ProjectileData[]>([])
  const [gates, setGates] = useState<GateData[]>([])
  const [obstacles, setObstacles] = useState<ObstacleData[]>([])
  const [canShoot, setCanShoot] = useState(true)
  const projectileIdRef = useRef(0)
  const gateIdRef = useRef(0)
  const obstacleIdRef = useRef(0)
  const waveRef = useRef(0)
  const shootCooldownRef = useRef(0)

  // Initialize level
  const initLevel = useCallback(() => {
    const newGates: GateData[] = []
    const newObstacles: ObstacleData[] = []

    // Create multiplier gates
    for (let z = -10; z >= -40; z -= 10) {
      const xOffset = (Math.random() - 0.5) * 6
      newGates.push({
        id: gateIdRef.current++,
        position: [xOffset, 1, z],
        multiplier: Math.floor(Math.random() * 3) + 2,
        hit: false
      })
    }

    // Create obstacles
    for (let z = -15; z >= -45; z -= 5) {
      const numObstacles = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < numObstacles; i++) {
        const xPos = (Math.random() - 0.5) * 10
        const scale = Math.random() * 0.5 + 0.5
        newObstacles.push({
          id: obstacleIdRef.current++,
          position: [xPos, scale * 0.5, z + (Math.random() - 0.5) * 3],
          scale,
          health: Math.ceil(scale * 3),
          maxHealth: Math.ceil(scale * 3),
          destroyed: false
        })
      }
    }

    setGates(newGates)
    setObstacles(newObstacles)
    setProjectiles([])
    waveRef.current++
  }, [])

  useEffect(() => {
    if (gameState === 'playing') {
      initLevel()
      camera.position.set(0, 8, 12)
      camera.lookAt(0, 0, -10)
    }
  }, [gameState, initLevel, camera])

  // Shooting
  const shoot = useCallback(() => {
    if (gameState !== 'playing' || !canShoot) return

    const newProjectile: ProjectileData = {
      id: projectileIdRef.current++,
      position: new THREE.Vector3(0, 0.5, 5),
      velocity: new THREE.Vector3(0, 0, -15),
      multiplied: new Set()
    }

    setProjectiles(prev => [...prev, newProjectile])
    setCanShoot(false)
    shootCooldownRef.current = 0.3
  }, [gameState, canShoot])

  // Handle click/tap
  useEffect(() => {
    const handleClick = () => shoot()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') shoot()
    }

    window.addEventListener('click', handleClick)
    window.addEventListener('touchstart', handleClick)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('click', handleClick)
      window.removeEventListener('touchstart', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shoot])

  // Game loop
  useFrame((_, delta) => {
    if (gameState !== 'playing') return

    // Shoot cooldown
    if (!canShoot) {
      shootCooldownRef.current -= delta
      if (shootCooldownRef.current <= 0) {
        setCanShoot(true)
      }
    }

    // Update projectiles
    setProjectiles(prev => {
      let newProjectiles = [...prev]
      const projectilesToAdd: ProjectileData[] = []

      newProjectiles = newProjectiles.map(p => {
        const newPos = p.position.clone().add(p.velocity.clone().multiplyScalar(delta))

        // Check gate collisions
        gates.forEach(gate => {
          if (gate.hit || p.multiplied.has(gate.id)) return

          const gatePos = new THREE.Vector3(...gate.position)
          const distance = newPos.distanceTo(gatePos)

          if (distance < 2 && Math.abs(newPos.z - gate.position[2]) < 0.5) {
            // Multiply!
            p.multiplied.add(gate.id)
            onMultiply()
            onScore(50)

            // Create new projectiles
            for (let i = 0; i < gate.multiplier - 1; i++) {
              const spread = (Math.random() - 0.5) * 4
              const newProj: ProjectileData = {
                id: projectileIdRef.current++,
                position: newPos.clone().add(new THREE.Vector3(spread * 0.3, 0, 0)),
                velocity: new THREE.Vector3(spread, 0, -15),
                multiplied: new Set(p.multiplied)
              }
              projectilesToAdd.push(newProj)
            }

            // Mark gate as hit
            setGates(g => g.map(gg => gg.id === gate.id ? { ...gg, hit: true } : gg))
          }
        })

        // Check obstacle collisions
        setObstacles(obs => obs.map(o => {
          if (o.destroyed) return o

          const obstaclePos = new THREE.Vector3(...o.position)
          const distance = newPos.distanceTo(obstaclePos)

          if (distance < o.scale + 0.3) {
            onScore(10)
            if (o.health <= 1) {
              return { ...o, destroyed: true }
            }
            return { ...o, health: o.health - 1 }
          }
          return o
        }))

        return { ...p, position: newPos }
      })

      // Add multiplied projectiles
      newProjectiles = [...newProjectiles, ...projectilesToAdd]

      // Remove off-screen projectiles
      newProjectiles = newProjectiles.filter(p =>
        p.position.z > -60 &&
        p.position.z < 10 &&
        Math.abs(p.position.x) < 20
      )

      return newProjectiles
    })

    // Check win/lose conditions
    const allObstaclesDestroyed = obstacles.length > 0 && obstacles.every(o => o.destroyed)
    if (allObstaclesDestroyed) {
      onScore(500)
      initLevel() // Next wave
    }

    // Game over if projectiles are gone and obstacles remain
    const activeObstacles = obstacles.filter(o => !o.destroyed)
    if (projectiles.length === 0 && activeObstacles.length > 0 && !canShoot && shootCooldownRef.current <= 0) {
      // Give player a chance to shoot more
      setCanShoot(true)
    }
  })

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00ffff" />
      <pointLight position={[0, 5, -30]} intensity={0.5} color="#ff00ff" />

      {/* Environment */}
      <Stars radius={100} depth={50} count={2000} factor={4} fade speed={1} />
      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a12', 20, 60]} />

      {/* Floor */}
      <Floor />

      {/* Player cannon */}
      <Player position={[0, 0, 5]} canShoot={canShoot} gameState={gameState} />

      {/* Projectiles */}
      {projectiles.map(p => (
        <Projectile key={p.id} position={p.position} />
      ))}

      {/* Multiplier Gates */}
      {gates.map(gate => (
        <MultiplierGate
          key={gate.id}
          position={gate.position}
          multiplier={gate.multiplier}
          hit={gate.hit}
        />
      ))}

      {/* Obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle
          key={obstacle.id}
          position={obstacle.position}
          scale={obstacle.scale}
          health={obstacle.health}
          maxHealth={obstacle.maxHealth}
          destroyed={obstacle.destroyed}
        />
      ))}
    </>
  )
}
