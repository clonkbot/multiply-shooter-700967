import { Canvas } from '@react-three/fiber'
import { useState, useCallback, Suspense } from 'react'
import Game from './components/Game'
import UI from './components/UI'

export default function App() {
  const [score, setScore] = useState(0)
  const [multiplier, setMultiplier] = useState(1)
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu')
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('multiplyShooterHighScore')
    return saved ? parseInt(saved) : 0
  })

  const addScore = useCallback((points: number) => {
    setScore(prev => prev + points * multiplier)
  }, [multiplier])

  const increaseMultiplier = useCallback(() => {
    setMultiplier(prev => Math.min(prev + 1, 99))
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    setMultiplier(1)
    setGameState('playing')
  }, [])

  const endGame = useCallback(() => {
    setHighScore(prev => {
      const newHigh = Math.max(prev, score)
      localStorage.setItem('multiplyShooterHighScore', String(newHigh))
      return newHigh
    })
    setGameState('gameover')
  }, [score])

  return (
    <div className="w-screen h-screen bg-[#0a0a12] overflow-hidden relative">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 80%, rgba(255, 0, 128, 0.15) 0%, transparent 50%)'
        }}
      />

      <Canvas
        camera={{ position: [0, 8, 12], fov: 50 }}
        shadows
        gl={{ antialias: true }}
        style={{ touchAction: 'none' }}
      >
        <Suspense fallback={null}>
          <Game
            gameState={gameState}
            onScore={addScore}
            onMultiply={increaseMultiplier}
            onGameOver={endGame}
          />
        </Suspense>
      </Canvas>

      <UI
        score={score}
        multiplier={multiplier}
        highScore={highScore}
        gameState={gameState}
        onStart={startGame}
        onRestart={startGame}
      />

      {/* Footer */}
      <footer className="absolute bottom-2 left-0 right-0 text-center z-10">
        <p className="text-[10px] md:text-xs text-white/30 font-mono tracking-wider">
          Requested by <span className="text-cyan-400/50">@CryptoTekniker</span> · Built by <span className="text-fuchsia-400/50">@clonkbot</span>
        </p>
      </footer>

      <style>{`
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  )
}
