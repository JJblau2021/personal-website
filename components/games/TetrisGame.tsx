"use client"

import React, { useState, useEffect, useRef } from "react"

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 28
const PREVIEW_CELL_SIZE = 22

const TETROMINOES: Record<string, { shape: number[][], color: string, glowColor: string }> = {
  I: { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: "#00f5ff", glowColor: "rgba(0, 245, 255, 0.6)" },
  J: { shape: [[1,0,0],[1,1,1],[0,0,0]], color: "#4169e1", glowColor: "rgba(65, 105, 225, 0.6)" },
  L: { shape: [[0,0,1],[1,1,1],[0,0,0]], color: "#ffa500", glowColor: "rgba(255, 165, 0, 0.6)" },
  O: { shape: [[1,1],[1,1]], color: "#ffd700", glowColor: "rgba(255, 215, 0, 0.6)" },
  S: { shape: [[0,1,1],[1,1,0],[0,0,0]], color: "#32cd32", glowColor: "rgba(50, 205, 50, 0.6)" },
  T: { shape: [[0,1,0],[1,1,1],[0,0,0]], color: "#da70d6", glowColor: "rgba(218, 112, 214, 0.6)" },
  Z: { shape: [[1,1,0],[0,1,1],[0,0,0]], color: "#ff4500", glowColor: "rgba(255, 69, 0, 0.6)" },
}

type TetrominoType = keyof typeof TETROMINOES
type Board = (string | null)[][]
type GameState = {
  board: Board
  current: { type: TetrominoType, shape: number[][], x: number, y: number } | null
  next: TetrominoType
  score: number
  level: number
  lines: number
  gameOver: boolean
  isPaused: boolean
  isPlaying: boolean
}

function createEmptyBoard(): Board {
  return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null))
}

function deepCopy<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

function rotateMatrix(matrix: number[][]): number[][] {
  const rows = matrix.length
  const cols = matrix[0].length
  const rotated: number[][] = []
  for (let j = 0; j < cols; j++) {
    rotated[j] = []
    for (let i = rows - 1; i >= 0; i--) {
      rotated[j].push(matrix[i][j])
    }
  }
  return rotated
}

function randomTetromino(): TetrominoType {
  const keys = Object.keys(TETROMINOES) as TetrominoType[]
  return keys[Math.floor(Math.random() * keys.length)]
}

function checkCollision(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] !== 0) {
        const nx = x + col
        const ny = y + row
        if (nx < 0 || nx >= BOARD_WIDTH || ny >= BOARD_HEIGHT || ny < 0) {
          return true
        }
        if (board[ny][nx] !== null) {
          return true
        }
      }
    }
  }
  return false
}

export function TetrisGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard())
  const [current, setCurrent] = useState<{ type: TetrominoType, shape: number[][], x: number, y: number } | null>(null)
  const [next, setNext] = useState<TetrominoType>("T")
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  const initGame = () => {
    const first = randomTetromino()
    const second = randomTetromino()
    const shape = deepCopy(TETROMINOES[first].shape)
    const newX = Math.floor((BOARD_WIDTH - shape[0].length) / 2)
    setBoard(createEmptyBoard())
    setCurrent({ type: first, shape, x: newX, y: 0 })
    setNext(second)
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setIsPlaying(true)
  }

  const spawnPiece = (currentBoard: Board, currentNext: TetrominoType) => {
    const tet = TETROMINOES[currentNext]
    const shape = deepCopy(tet.shape)
    const newX = Math.floor((BOARD_WIDTH - shape[0].length) / 2)
    const newY = 0
    
    if (checkCollision(currentBoard, shape, newX, newY)) {
      setGameOver(true)
      setIsPlaying(false)
      return null
    }
    return { type: currentNext, shape, x: newX, y: newY }
  }

  const lockPiece = () => {
    if (!current) return
    const newBoard = board.map(row => [...row])
    const color = TETROMINOES[current.type].color

    for (let row = 0; row < current.shape.length; row++) {
      for (let col = 0; col < current.shape[row].length; col++) {
        if (current.shape[row][col] !== 0) {
          const by = current.y + row
          const bx = current.x + col
          if (by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
            newBoard[by][bx] = color
          }
        }
      }
    }

    let cleared = 0
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        cleared++
        return false
      }
      return true
    })

    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800, 1200]
      setScore(s => s + points[cleared] * level)
      setLines(l => l + cleared)
      const newLines = lines + cleared
      setLevel(Math.floor(newLines / 10) + 1)
      while (clearedBoard.length < BOARD_HEIGHT) {
        clearedBoard.unshift(Array(BOARD_WIDTH).fill(null))
      }
    }

    setBoard(clearedBoard)
    const newPiece = spawnPiece(clearedBoard, next)
    if (newPiece) {
      setCurrent(newPiece)
      setNext(randomTetromino())
    }
  }

  const move = (dx: number, dy: number) => {
    if (!current || gameOver || isPaused || !isPlaying) return
    if (!checkCollision(board, current.shape, current.x + dx, current.y + dy)) {
      setCurrent(c => c ? { ...c, x: c.x + dx, y: c.y + dy } : null)
    } else if (dy > 0) {
      lockPiece()
    }
  }

  const rotate = () => {
    if (!current || gameOver || isPaused || !isPlaying) return
    const rotated = rotateMatrix(deepCopy(current.shape))
    if (!checkCollision(board, rotated, current.x, current.y)) {
      setCurrent(c => c ? { ...c, shape: rotated } : c)
    } else {
      const kicks = [-1, 1, -2, 2]
      for (const kick of kicks) {
        if (!checkCollision(board, rotated, current.x + kick, current.y)) {
          setCurrent(c => c ? { ...c, shape: rotated, x: c.x + kick } : c)
          break
        }
      }
    }
  }

  const hardDrop = () => {
    if (!current || gameOver || isPaused || !isPlaying) return
    const newBoard = board.map(row => [...row])
    const color = TETROMINOES[current.type].color
    
    let drop = 0
    while (!checkCollision(newBoard, current.shape, current.x, current.y + drop + 1)) {
      drop++
    }
    
    for (let row = 0; row < current.shape.length; row++) {
      for (let col = 0; col < current.shape[row].length; col++) {
        if (current.shape[row][col] !== 0) {
          const by = current.y + drop + row
          const bx = current.x + col
          if (by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
            newBoard[by][bx] = color
          }
        }
      }
    }
    
    setScore(s => s + drop * 2)
    
    let cleared = 0
    const clearedBoard = newBoard.filter(row => {
      if (row.every(cell => cell !== null)) {
        cleared++
        return false
      }
      return true
    })
    
    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800, 1200]
      setScore(s => s + points[cleared] * level)
      setLines(l => l + cleared)
      const newLines = lines + cleared
      setLevel(Math.floor(newLines / 10) + 1)
      while (clearedBoard.length < BOARD_HEIGHT) {
        clearedBoard.unshift(Array(BOARD_WIDTH).fill(null))
      }
    }
    
    setBoard(clearedBoard)
    const newPiece = spawnPiece(clearedBoard, next)
    if (newPiece) {
      setCurrent(newPiece)
      setNext(randomTetromino())
    }
  }

  const moveRef = useRef(move)
  const rotateRef = useRef(rotate)
  const hardDropRef = useRef(hardDrop)
  const stateRef = useRef({ board, current, isPlaying, gameOver, isPaused, level, next, lines })
  stateRef.current = { board, current, isPlaying, gameOver, isPaused, level, next, lines }
  moveRef.current = move
  rotateRef.current = rotate
  hardDropRef.current = hardDrop

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const { isPlaying, gameOver, isPaused } = stateRef.current
      if (e.key.toLowerCase() === 'p' && isPlaying && !gameOver) {
        setIsPaused(p => !p)
        return
      }
      if (!isPlaying || gameOver || isPaused) return
      if (e.key === 'ArrowLeft') moveRef.current(-1, 0)
      else if (e.key === 'ArrowRight') moveRef.current(1, 0)
      else if (e.key === 'ArrowDown') moveRef.current(0, 1)
      else if (e.key === 'ArrowUp') rotateRef.current()
      else if (e.key === ' ') { e.preventDefault(); hardDropRef.current() }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    if (!isPlaying || gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      return
    }
    const speed = Math.max(100, 1000 - (level - 1) * 100)
    gameLoopRef.current = setInterval(() => {
      const { board, current, isPlaying, gameOver, isPaused, level: lvl, next, lines: ln } = stateRef.current
      if (!current || gameOver || isPaused || !isPlaying) return
      
      if (!checkCollision(board, current.shape, current.x, current.y + 1)) {
        setCurrent(c => c ? { ...c, y: c.y + 1 } : c)
      } else {
        const newBoard = board.map(row => [...row])
        const color = TETROMINOES[current.type].color

        for (let row = 0; row < current.shape.length; row++) {
          for (let col = 0; col < current.shape[row].length; col++) {
            if (current.shape[row][col] !== 0) {
              const by = current.y + row
              const bx = current.x + col
              if (by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
                newBoard[by][bx] = color
              }
            }
          }
        }

        let cleared = 0
        const clearedBoard = newBoard.filter(row => {
          if (row.every(cell => cell !== null)) {
            cleared++
            return false
          }
          return true
        })

        if (cleared > 0) {
          const points = [0, 100, 300, 500, 800, 1200]
          setScore(s => s + points[cleared] * lvl)
          setLines(l => l + cleared)
          const newLines = ln + cleared
          setLevel(Math.floor(newLines / 10) + 1)
          while (clearedBoard.length < BOARD_HEIGHT) {
            clearedBoard.unshift(Array(BOARD_WIDTH).fill(null))
          }
        }

        setBoard(clearedBoard)
        
        const tet = TETROMINOES[next]
        const shape = deepCopy(tet.shape)
        const newX = Math.floor((BOARD_WIDTH - shape[0].length) / 2)
        
        if (checkCollision(clearedBoard, shape, newX, 0)) {
          setGameOver(true)
          setIsPlaying(false)
          return
        }
        
        setCurrent({ type: next, shape, x: newX, y: 0 })
        setNext(randomTetromino())
      }
    }, speed)
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }
  }, [isPlaying, gameOver, isPaused, level])

  const renderPreview = (type: TetrominoType) => {
    const tet = TETROMINOES[type]
    return (
      <div style={{ width: tet.shape[0].length * PREVIEW_CELL_SIZE, height: tet.shape.length * PREVIEW_CELL_SIZE, position: 'relative' }}>
        {tet.shape.map((row, y) => row.map((cell, x) => cell ? (
          <div key={`${x}-${y}`} style={{
            position: 'absolute', left: x * PREVIEW_CELL_SIZE + 1, top: y * PREVIEW_CELL_SIZE + 1,
            width: PREVIEW_CELL_SIZE - 2, height: PREVIEW_CELL_SIZE - 2,
            backgroundColor: tet.color, borderRadius: 4,
            boxShadow: `inset 0 0 6px ${tet.glowColor}`
          }} />
        ) : null))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[500px] p-4">
      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-4 w-36">
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xs font-medium text-slate-400 mb-3">下一个</h3>
            <div className="flex justify-center min-h-20">{isPlaying && renderPreview(next)}</div>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xs font-medium text-slate-400 mb-1">分数</h3>
            <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xs font-medium text-slate-400 mb-1">等级</h3>
            <p className="text-2xl font-bold text-cyan-400">{level}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50">
            <h3 className="text-xs font-medium text-slate-400 mb-1">行数</h3>
            <p className="text-2xl font-bold text-green-400">{lines}</p>
          </div>
          <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/50 text-xs">
            <h3 className="text-xs font-medium text-slate-400 mb-2">操作</h3>
            <div className="space-y-1 text-slate-300">
              <p><span className="text-slate-500">←→</span> 移动</p>
              <p><span className="text-slate-500">↑</span> 旋转</p>
              <p><span className="text-slate-500">↓</span> 加速</p>
              <p><span className="text-slate-500">空格</span> 硬降</p>
              <p><span className="text-slate-500">P</span> 暂停</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div ref={boardRef} className="relative bg-slate-800 rounded-xl border-2 border-slate-600 overflow-hidden" style={{ width: BOARD_WIDTH * CELL_SIZE, height: BOARD_HEIGHT * CELL_SIZE }}>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
            }} />

            {board.map((row, y) => row.map((cell, x) => (
              <div key={`${x}-${y}`} className="absolute rounded-sm border border-slate-600/30" style={{
                width: CELL_SIZE, height: CELL_SIZE, left: x * CELL_SIZE, top: y * CELL_SIZE,
                backgroundColor: cell || 'transparent'
              }} />
            )))}

            {current && current.shape.map((row, sy) => row.map((cell, sx) => cell ? (
              <div key={`piece-${sy}-${sx}`} className="absolute rounded-sm" style={{
                width: CELL_SIZE - 2, height: CELL_SIZE - 2,
                left: (current.x + sx) * CELL_SIZE + 1, top: (current.y + sy) * CELL_SIZE + 1,
                backgroundColor: TETROMINOES[current.type].color,
                boxShadow: `inset 0 0 8px ${TETROMINOES[current.type].glowColor}, 0 0 4px ${TETROMINOES[current.type].color}`
              }} />
            ) : null))}

            {gameOver && (
              <div className="absolute inset-0 bg-slate-800/95 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-500 mb-2">游戏结束</p>
                  <p className="text-slate-300 mb-4">最终得分: {score.toLocaleString()}</p>
                  <button onClick={initGame} className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold rounded-lg">再来一局</button>
                </div>
              </div>
            )}

            {isPaused && !gameOver && (
              <div className="absolute inset-0 bg-slate-800/90 flex items-center justify-center">
                <p className="text-3xl font-bold text-yellow-400">暂停</p>
              </div>
            )}

            {!isPlaying && !gameOver && (
              <div className="absolute inset-0 bg-slate-800/95 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-4xl font-bold text-cyan-400 mb-4">俄罗斯方块</p>
                  <button onClick={initGame} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-lg text-lg">开始游戏</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
