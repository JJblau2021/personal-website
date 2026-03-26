"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 8;
const CELL_SIZE = 48;

const COLORS = {
  floorLight: "oklch(0.85 0.02 60)",
  floorDark: "oklch(0.80 0.02 60)",
  floorPattern: "oklch(0.82 0.015 60)",
  wall: "oklch(0.35 0.08 40)",
  wallHighlight: "oklch(0.42 0.06 40)",
  wallShadow: "oklch(0.28 0.06 35)",
  player: "oklch(0.65 0.18 280)",
  playerHighlight: "oklch(0.75 0.15 280)",
  playerShadow: "oklch(0.55 0.15 275)",
  box: "oklch(0.60 0.15 45)",
  boxHighlight: "oklch(0.70 0.12 45)",
  boxShadow: "oklch(0.50 0.12 40)",
  boxOnTarget: "oklch(0.65 0.18 145)",
  boxOnTargetHighlight: "oklch(0.75 0.15 145)",
  target: "oklch(0.70 0.08 145)",
  targetInner: "oklch(0.60 0.12 145)",
  overlayBg: "oklch(0.75 0.08 145 / 0.85)",
  scoreText: "oklch(0.20 0.04 25)",
  buttonPrimary: "oklch(0.65 0.18 145)",
  buttonSecondary: "oklch(0.50 0.06 45)",
  borderLight: "oklch(0.70 0.05 50)",
  borderDark: "oklch(0.40 0.05 45)",
};

type Cell = "floor" | "wall";
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type Position = {
  x: number;
  y: number;
};

type Level = {
  grid: Cell[][];
  player: Position;
  boxes: Position[];
  targets: Position[];
};

type GameState = "idle" | "playing" | "levelComplete";

const generateLevel = (difficulty: number = 1): Level => {
  const size = GRID_SIZE;
  const grid: Cell[][] = [];
  
  for (let y = 0; y < size; y++) {
    grid[y] = [];
    for (let x = 0; x < size; x++) {
      if (y === 0 || y === size - 1 || x === 0 || x === size - 1) {
        grid[y][x] = "wall";
      } else {
        grid[y][x] = "floor";
      }
    }
  }
  
  const wallCount = 8 + difficulty * 4;
  const walls: Position[] = [];
  
  for (let i = 0; i < wallCount; i++) {
    const x = Math.floor(Math.random() * (size - 4)) + 2;
    const y = Math.floor(Math.random() * (size - 4)) + 2;
    
    if (!walls.some(w => w.x === x && w.y === y)) {
      walls.push({ x, y });
      grid[y][x] = "wall";
    }
  }
  
  const boxCount = 2 + Math.floor(difficulty / 2);
  const boxes: Position[] = [];
  
  for (let i = 0; i < boxCount; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * (size - 4)) + 2;
      y = Math.floor(Math.random() * (size - 4)) + 2;
      attempts++;
    } while (
      (walls.some(w => w.x === x && w.y === y) ||
      boxes.some(b => b.x === x && b.y === y)) &&
      attempts < 50
    );
    
    if (attempts < 50) {
      boxes.push({ x, y });
    }
  }
  
  const targets: Position[] = [];
  const minDistance = 3;
  
  for (let i = 0; i < boxes.length; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * (size - 4)) + 2;
      y = Math.floor(Math.random() * (size - 4)) + 2;
      attempts++;
    } while (
      (walls.some(w => w.x === x && w.y === y) ||
      boxes.some(b => b.x === x && b.y === y) ||
      targets.some(t => t.x === x && t.y === y) ||
      (Math.abs(x - boxes[i].x) + Math.abs(y - boxes[i].y) < minDistance)) &&
      attempts < 100
    );
    
    if (attempts < 100) {
      targets.push({ x, y });
    }
  }
  
  while (targets.length < boxes.length) {
    const lastBox = boxes[targets.length];
    targets.push({
      x: Math.min(lastBox.x + 2, size - 2),
      y: Math.min(lastBox.y + 2, size - 2)
    });
  }
  
  let player: Position;
  let playerAttempts = 0;
  do {
    player = {
      x: Math.floor(Math.random() * (size - 4)) + 2,
      y: Math.floor(Math.random() * (size - 4)) + 2
    };
    playerAttempts++;
  } while (
    (walls.some(w => w.x === player.x && w.y === player.y) ||
    boxes.some(b => b.x === player.x && b.y === player.y)) &&
    playerAttempts < 50
  );
  
  return { grid, player, boxes, targets };
};

const isValidPosition = (
  pos: Position,
  grid: Cell[][],
  boxes: Position[],
  walls: Position[]
): boolean => {
  if (pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE) {
    return false;
  }
  if (grid[pos.y][pos.x] === "wall") {
    return false;
  }
  return true;
};

const FloorTile = () => (
  <div
    className="absolute inset-0"
    style={{
      background: `
        linear-gradient(45deg, ${COLORS.floorDark} 25%, transparent 25%),
        linear-gradient(-45deg, ${COLORS.floorDark} 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${COLORS.floorDark} 75%),
        linear-gradient(-45deg, transparent 75%, ${COLORS.floorDark} 75%)
      `,
      backgroundSize: "12px 12px",
      backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
      backgroundColor: COLORS.floorLight,
    }}
  />
);

const WallBlock = () => (
  <div
    className="absolute inset-0 rounded-sm"
    style={{
      background: `linear-gradient(135deg, ${COLORS.wallHighlight} 0%, ${COLORS.wall} 50%, ${COLORS.wallShadow} 100%)`,
      boxShadow: `
        inset 2px 2px 0 ${COLORS.wallHighlight},
        inset -2px -2px 0 ${COLORS.wallShadow},
        3px 3px 0 rgba(0,0,0,0.2)
      `,
    }}
  />
);

const TargetMarker = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div
      className="rounded-full"
      style={{
        width: "60%",
        height: "60%",
        backgroundColor: COLORS.target,
        boxShadow: `inset 0 0 0 3px ${COLORS.targetInner}`,
        animation: "pulse 2s ease-in-out infinite",
      }}
    />
  </div>
);

const BoxElement = ({ onTarget }: { onTarget: boolean }) => (
  <div
    className="absolute inset-1 rounded-md transition-all duration-150"
    style={{
      background: `linear-gradient(135deg, ${
        onTarget ? COLORS.boxOnTargetHighlight : COLORS.boxHighlight
      } 0%, ${
        onTarget ? COLORS.boxOnTarget : COLORS.box
      } 50%, ${
        onTarget ? COLORS.boxOnTarget : COLORS.boxShadow
      } 100%)`,
      boxShadow: `
        inset 2px 2px 0 ${
          onTarget ? COLORS.boxOnTargetHighlight : COLORS.boxHighlight
        },
        inset -2px -2px 0 ${
          onTarget ? COLORS.boxOnTarget : COLORS.boxShadow
        },
        2px 2px 0 rgba(0,0,0,0.15)
      `,
    }}
  >
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background: `
          linear-gradient(135deg, transparent 40%, ${
            onTarget ? COLORS.boxOnTargetHighlight : COLORS.boxHighlight
          } 45%, transparent 50%)
        `,
      }}
    />
  </div>
);

const PlayerElement = () => (
  <div
    className="absolute inset-1 rounded-full transition-all duration-150"
    style={{
      background: `linear-gradient(135deg, ${COLORS.playerHighlight} 0%, ${COLORS.player} 50%, ${COLORS.playerShadow} 100%)`,
      boxShadow: `
        inset 3px 3px 0 ${COLORS.playerHighlight},
        inset -2px -2px 0 ${COLORS.playerShadow},
        2px 2px 0 rgba(0,0,0,0.15)
      `,
    }}
  >
    <div
      className="absolute inset-0 flex items-center justify-center gap-1"
    >
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: "#fff",
          boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.2)",
        }}
      />
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: "#fff",
          boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.2)",
        }}
      />
    </div>
  </div>
);

interface SokobanGameProps {
  onLevelComplete?: (moves: number) => void;
}

export function SokobanGame({ onLevelComplete }: SokobanGameProps) {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [level, setLevel] = useState<Level>(() => generateLevel(1));
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [boxes, setBoxes] = useState<Position[]>([]);
  const [moves, setMoves] = useState(0);
  const [levelNumber, setLevelNumber] = useState(1);
  
  const containerWidth = GRID_SIZE * CELL_SIZE;
  const containerHeight = GRID_SIZE * CELL_SIZE;
  
  const initializeLevel = useCallback((difficulty: number = 1) => {
    const newLevel = generateLevel(difficulty);
    setLevel(newLevel);
    setPlayerPos(newLevel.player);
    setBoxes([...newLevel.boxes]);
    setMoves(0);
  }, []);
  
  const startGame = useCallback(() => {
    initializeLevel(levelNumber);
    setGameState("playing");
  }, [initializeLevel, levelNumber]);
  
  const nextLevel = useCallback(() => {
    const newLevelNum = levelNumber + 1;
    setLevelNumber(newLevelNum);
    initializeLevel(newLevelNum);
    setGameState("playing");
  }, [initializeLevel, levelNumber]);
  
  const resetLevel = useCallback(() => {
    initializeLevel(levelNumber);
    setGameState("playing");
  }, [initializeLevel, levelNumber]);
  
  const backToStart = useCallback(() => {
    setGameState("idle");
    setLevelNumber(1);
    initializeLevel(1);
  }, [initializeLevel]);
  
  const checkWinCondition = useCallback((currentBoxes: Position[]) => {
    return level.targets.every(target =>
      currentBoxes.some(box => box.x === target.x && box.y === target.y)
    );
  }, [level.targets]);
  
  const getWalls = useCallback((): Position[] => {
    const walls: Position[] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (level.grid[y][x] === "wall") {
          walls.push({ x, y });
        }
      }
    }
    return walls;
  }, [level.grid]);
  
  const movePlayer = useCallback((direction: Direction) => {
    if (gameState !== "playing") return;
    
    const walls = getWalls();
    let newX = playerPos.x;
    let newY = playerPos.y;
    
    switch (direction) {
      case "UP":
        newY -= 1;
        break;
      case "DOWN":
        newY += 1;
        break;
      case "LEFT":
        newX -= 1;
        break;
      case "RIGHT":
        newX += 1;
        break;
    }
    
    const newPos = { x: newX, y: newY };
    
    if (!isValidPosition(newPos, level.grid, [], walls)) {
      return;
    }
    
    const boxIndex = boxes.findIndex(b => b.x === newX && b.y === newY);
    
    if (boxIndex !== -1) {
      let boxNewX = newX;
      let boxNewY = newY;
      
      switch (direction) {
        case "UP":
          boxNewY -= 1;
          break;
        case "DOWN":
          boxNewY += 1;
          break;
        case "LEFT":
          boxNewX -= 1;
          break;
        case "RIGHT":
          boxNewX += 1;
          break;
      }
      
      const boxNewPos = { x: boxNewX, y: boxNewY };
      
      if (!isValidPosition(boxNewPos, level.grid, [], walls)) {
        return;
      }
      
      if (boxes.some(b => b.x === boxNewX && b.y === boxNewY)) {
        return;
      }
      
      setBoxes(prevBoxes => {
        const newBoxes = [...prevBoxes];
        newBoxes[boxIndex] = boxNewPos;
        return newBoxes;
      });
    }
    
    setPlayerPos(newPos);
    setMoves(m => m + 1);
    
    setTimeout(() => {
      setBoxes(currentBoxes => {
        if (checkWinCondition(currentBoxes)) {
          setGameState("levelComplete");
          if (onLevelComplete) {
            onLevelComplete(moves + 1);
          }
        }
        return currentBoxes;
      });
    }, 50);
  }, [gameState, playerPos, boxes, level.grid, getWalls, checkWinCondition, moves, onLevelComplete]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"].includes(e.key)) {
        e.preventDefault();
      }
      
      if (gameState === "idle") {
        if (e.key !== "Escape") {
          startGame();
        }
        return;
      }
      
      if (gameState === "levelComplete") {
        if (e.key === "Enter" || e.key === " " || e.key === "n" || e.key === "N") {
          nextLevel();
        }
        if (e.key === "r" || e.key === "R") {
          resetLevel();
        }
        if (e.key === "Escape") {
          backToStart();
        }
        return;
      }
      
      if (gameState === "playing") {
        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            movePlayer("UP");
            break;
          case "ArrowDown":
          case "s":
          case "S":
            movePlayer("DOWN");
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            movePlayer("LEFT");
            break;
          case "ArrowRight":
          case "d":
          case "D":
            movePlayer("RIGHT");
            break;
          case "r":
          case "R":
            resetLevel();
            break;
          case "Escape":
            backToStart();
            break;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame, movePlayer, nextLevel, resetLevel, backToStart]);
  
  useEffect(() => {
    if (gameState === "idle") {
      initializeLevel(1);
    }
  }, [gameState, initializeLevel]);
  
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div 
        className="relative rounded-2xl overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(135deg, ${COLORS.borderLight}, ${COLORS.borderDark})`,
          boxShadow: `
            inset 0 0 20px rgba(0,0,0,0.1),
            0 8px 32px rgba(0,0,0,0.25),
            0 2px 8px rgba(0,0,0,0.15)
          `,
          padding: "3px",
        }}
      >
        <div 
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundColor: COLORS.floorDark,
          }}
        >
          <div 
            className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 z-20"
            style={{ 
              background: `linear-gradient(to bottom, ${COLORS.borderLight}, ${COLORS.borderDark})`,
              boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
            }}
          >
            <div className="flex items-center gap-3">
              <span 
                className="text-base font-bold tracking-wide"
                style={{ 
                  color: COLORS.scoreText,
                  textShadow: "1px 1px 0 rgba(255,255,255,0.3)"
                }}
              >
                SOKOBAN
              </span>
              <span 
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: COLORS.buttonPrimary,
                  color: "#fff"
                }}
              >
                Level {levelNumber}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm"
                  style={{ color: COLORS.scoreText }}
                >
                  步数：
                </span>
                <span 
                  className="text-lg font-bold"
                  style={{ 
                    color: COLORS.player,
                    textShadow: "1px 1px 0 rgba(255,255,255,0.3)"
                  }}
                >
                  {moves}
                </span>
              </div>
            </div>
          </div>
          
          <div 
            className="relative mx-auto mt-12 overflow-hidden"
            style={{
              width: `${containerWidth}px`,
              height: `${containerHeight}px`,
            }}
          >
            {level.grid.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${x}-${y}`}
                  className="absolute"
                  style={{
                    left: `${x * CELL_SIZE}px`,
                    top: `${y * CELL_SIZE}px`,
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                >
                  <FloorTile />
                  {cell === "wall" && <WallBlock />}
                </div>
              ))
            )}
            
            {level.targets.map((target, index) => (
              <div
                key={`target-${index}`}
                className="absolute"
                style={{
                  left: `${target.x * CELL_SIZE}px`,
                  top: `${target.y * CELL_SIZE}px`,
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                }}
              >
                <TargetMarker />
              </div>
            ))}
            
            {boxes.map((box, index) => {
              const isOnTarget = level.targets.some(
                t => t.x === box.x && t.y === box.y
              );
              return (
                <div
                  key={`box-${index}`}
                  className="absolute transition-all duration-150"
                  style={{
                    left: `${box.x * CELL_SIZE}px`,
                    top: `${box.y * CELL_SIZE}px`,
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                  }}
                >
                  <BoxElement onTarget={isOnTarget} />
                </div>
              );
            })}
            
            <div
              className="absolute transition-all duration-150"
              style={{
                left: `${playerPos.x * CELL_SIZE}px`,
                top: `${playerPos.y * CELL_SIZE}px`,
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
              }}
            >
              <PlayerElement />
            </div>
            
            {gameState === "idle" && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ backgroundColor: COLORS.overlayBg }}
              >
                <div 
                  className="text-center"
                  style={{ 
                    color: COLORS.scoreText,
                    textShadow: "2px 2px 0 rgba(255,255,255,0.5)"
                  }}
                >
                  <div className="text-2xl font-bold mb-3">推箱子</div>
                  <div className="text-sm opacity-80 mb-6">
                    将所有箱子推到目标位置
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: COLORS.buttonPrimary,
                      color: "#fff",
                      boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                    }}
                  >
                    开始游戏
                  </button>
                  <div className="mt-6 text-xs opacity-60 flex items-center justify-center gap-2">
                    <span>↑</span><span>↓</span><span>←</span><span>→</span>
                    <span>or</span>
                    <span>W</span><span>A</span><span>S</span><span>D</span>
                    <span>移动</span>
                  </div>
                </div>
              </div>
            )}
            
            {gameState === "levelComplete" && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center z-10"
                style={{ 
                  backgroundColor: COLORS.overlayBg,
                  animation: "fadeIn 0.3s ease-out"
                }}
              >
                <div 
                  className="text-center"
                  style={{ 
                    color: COLORS.scoreText,
                    textShadow: "2px 2px 0 rgba(255,255,255,0.5)"
                  }}
                >
                  <div className="text-2xl font-bold mb-2">🎉 过关！</div>
                  <div className="text-lg mb-2">
                    用了 <span style={{ color: COLORS.buttonPrimary }}>{moves}</span> 步
                  </div>
                  <div className="text-sm mb-6 opacity-70">
                    {moves <= 20 ? "太棒了！" :
                     moves <= 40 ? "干得漂亮！" :
                     moves <= 60 ? "不错的成绩！" :
                     "继续加油！"}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={nextLevel}
                      className="w-full px-6 py-3 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: COLORS.buttonPrimary,
                        color: "#fff",
                        boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      下一关 (N)
                    </button>
                    <button
                      onClick={resetLevel}
                      className="w-full px-6 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: COLORS.buttonSecondary,
                        color: "#fff",
                        boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      重玩本关 (R)
                    </button>
                    <button
                      onClick={backToStart}
                      className="w-full px-6 py-2 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
                      style={{
                        backgroundColor: COLORS.borderDark,
                        color: "#fff",
                        boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                      }}
                    >
                      返回主页 (Esc)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div 
            className="h-10 flex items-center justify-center gap-6 text-xs"
            style={{ 
              background: `linear-gradient(to top, ${COLORS.borderLight}, ${COLORS.borderDark})`,
              color: COLORS.scoreText,
            }}
          >
            <span>R - 重置</span>
            <span>Esc - 退出</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
