import { useEffect, useState } from 'react'

interface UIProps {
  score: number
  multiplier: number
  highScore: number
  gameState: 'menu' | 'playing' | 'gameover'
  onStart: () => void
  onRestart: () => void
}

export default function UI({ score, multiplier, highScore, gameState, onStart, onRestart }: UIProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const [scoreFlash, setScoreFlash] = useState(false)

  useEffect(() => {
    if (score > displayScore) {
      setScoreFlash(true)
      const timeout = setTimeout(() => setScoreFlash(false), 150)
      return () => clearTimeout(timeout)
    }
  }, [score, displayScore])

  useEffect(() => {
    if (displayScore < score) {
      const diff = score - displayScore
      const increment = Math.max(1, Math.floor(diff / 10))
      const timeout = setTimeout(() => {
        setDisplayScore(prev => Math.min(prev + increment, score))
      }, 20)
      return () => clearTimeout(timeout)
    }
  }, [displayScore, score])

  useEffect(() => {
    if (gameState === 'menu') {
      setDisplayScore(0)
    }
  }, [gameState])

  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="text-center pointer-events-auto">
          {/* Title */}
          <h1
            className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-2"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #ffff00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
              filter: 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.5))'
            }}
          >
            MULTIPLY
          </h1>
          <p
            className="text-lg md:text-2xl text-cyan-300/80 mb-8 tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Shoot & Grow
          </p>

          {/* High Score */}
          {highScore > 0 && (
            <p
              className="text-sm md:text-base text-fuchsia-300/60 mb-6"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              HIGH SCORE: {highScore.toLocaleString()}
            </p>
          )}

          {/* Play Button */}
          <button
            onClick={onStart}
            className="relative group px-8 py-4 md:px-12 md:py-5 rounded-xl overflow-hidden transition-transform hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #00ff88 100%)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}
          >
            <span
              className="relative z-10 text-xl md:text-2xl font-black text-[#0a0a12] tracking-wider"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              TAP TO PLAY
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>

          {/* Instructions */}
          <div className="mt-8 md:mt-12 space-y-2 text-white/50 text-xs md:text-sm">
            <p>🎯 Tap/Click to shoot</p>
            <p>💥 Hit gates to multiply your balls</p>
            <p>🎮 Destroy all obstacles to win!</p>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'gameover') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none bg-black/50 backdrop-blur-sm">
        <div className="text-center pointer-events-auto animate-[fadeIn_0.5s_ease-out]">
          <h2
            className="text-3xl md:text-5xl font-black mb-4"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              color: '#ff00ff',
              textShadow: '0 0 30px rgba(255, 0, 255, 0.8)'
            }}
          >
            GAME OVER
          </h2>

          <p
            className="text-5xl md:text-7xl font-black mb-2"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #00ffff 0%, #ffff00 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {score.toLocaleString()}
          </p>

          {score >= highScore && score > 0 && (
            <p
              className="text-lg md:text-xl text-yellow-400 mb-6 animate-pulse"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              🏆 NEW HIGH SCORE!
            </p>
          )}

          <button
            onClick={onRestart}
            className="mt-6 px-8 py-4 md:px-10 md:py-4 rounded-xl font-black text-lg md:text-xl tracking-wider transition-transform hover:scale-105 active:scale-95"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: 'linear-gradient(135deg, #ff00ff 0%, #ff0088 100%)',
              color: 'white',
              boxShadow: '0 0 30px rgba(255, 0, 255, 0.4)'
            }}
          >
            PLAY AGAIN
          </button>
        </div>

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    )
  }

  // Playing state - HUD
  return (
    <div className="absolute top-0 left-0 right-0 p-4 md:p-6 z-10 pointer-events-none">
      <div className="flex justify-between items-start max-w-4xl mx-auto">
        {/* Score */}
        <div className="text-left">
          <p
            className="text-xs md:text-sm text-cyan-400/70 tracking-widest uppercase mb-1"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Score
          </p>
          <p
            className={`text-3xl md:text-5xl font-black transition-all duration-150 ${scoreFlash ? 'scale-110 text-yellow-400' : 'text-white'}`}
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: scoreFlash ? '0 0 20px rgba(255, 255, 0, 0.8)' : '0 0 10px rgba(0, 255, 255, 0.5)'
            }}
          >
            {displayScore.toLocaleString()}
          </p>
        </div>

        {/* Multiplier */}
        <div
          className="text-center px-4 py-2 md:px-6 md:py-3 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.3) 0%, rgba(255, 0, 128, 0.3) 100%)',
            border: '2px solid rgba(255, 0, 255, 0.5)',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)'
          }}
        >
          <p
            className="text-xs text-fuchsia-300/70 tracking-widest uppercase"
            style={{ fontFamily: "'Orbitron', sans-serif" }}
          >
            Multiplier
          </p>
          <p
            className="text-2xl md:text-4xl font-black text-fuchsia-400"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 15px rgba(255, 0, 255, 0.8)'
            }}
          >
            x{multiplier}
          </p>
        </div>
      </div>

      {/* Tap hint on mobile */}
      <p
        className="md:hidden text-center text-white/30 text-xs mt-4 animate-pulse"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        TAP TO SHOOT
      </p>
    </div>
  )
}
