"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

const GRID_SIZE = 15;
const CELL_SIZE = 28;

const COLORS = {
  grassLight: "oklch(0.78 0.12 145)",
  grassDark: "oklch(0.70 0.10 145)",
  grassPattern: "oklch(0.72 0.08 145)",
  dirt: "oklch(0.65 0.08 60)",
  dirtDark: "oklch(0.55 0.06 50)",
  snakeHead: "oklch(0.60 0.20 145)",
  snakeBody: "oklch(0.55 0.18 145)",
  snakeBodyDark: "oklch(0.48 0.15 140)",
  snakeHighlight: "oklch(0.70 0.15 145)",
  carrot: "oklch(0.70 0.18 50)",
  carrotLeaf: "oklch(0.55 0.15 140)",
  tomato: "oklch(0.65 0.20 25)",
  tomatoLeaf: "oklch(0.55 0.15 140)",
  apple: "oklch(0.60 0.18 30)",
  appleLeaf: "oklch(0.55 0.15 140)",
  fenceLight: "oklch(0.50 0.08 50)",
  fenceDark: "oklch(0.40 0.06 45)",
  fencePost: "oklch(0.45 0.07 48)",
  scoreText: "oklch(0.20 0.04 25)",
  overlayBg: "oklch(0.75 0.08 145 / 0.85)",
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type Position = {
  x: number;
  y: number;
};

type FoodType = "carrot" | "tomato" | "apple";

const GrassBackground = () => {
  return (
    <div 
      className="absolute inset-0"
      style={{ 
        background: COLORS.grassLight,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${COLORS.grassPattern} 2px,
            ${COLORS.grassPattern} 4px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            ${COLORS.grassPattern} 2px,
            ${COLORS.grassPattern} 4px
          )
        `
      }}
    >
      {[
        { x: 2, y: 3 }, { x: 7, y: 8 }, { x: 12, y: 2 }, 
        { x: 5, y: 12 }, { x: 10, y: 10 }, { x: 1, y: 7 }
      ].map((patch, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${patch.x * CELL_SIZE + 4}px`,
            top: `${patch.y * CELL_SIZE + 4}px`,
            backgroundColor: i % 2 === 0 ? COLORS.dirt : COLORS.dirtDark,
            boxShadow: `inset 1px 1px 2px ${COLORS.dirtDark}`
          }}
        />
      ))}
      
      {[
        { x: 1, y: 1 }, { x: 8, y: 4 }, { x: 13, y: 7 },
        { x: 4, y: 11 }, { x: 11, y: 13 }, { x: 6, y: 6 }
      ].map((tuft, i) => (
        <div
          key={`tuft-${i}`}
          className="absolute w-2 h-2"
          style={{
            left: `${tuft.x * CELL_SIZE + 8}px`,
            top: `${tuft.y * CELL_SIZE + 8}px`,
            backgroundColor: COLORS.snakeHighlight,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"
          }}
        />
      ))}
    </div>
  );
};

const FenceBorder = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-0 right-0 h-3 flex">
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`top-${i}`}>
          <div 
            className="flex-1"
            style={{ 
              background: `linear-gradient(to bottom, ${COLORS.fenceLight}, ${COLORS.fenceDark})`,
              boxShadow: `inset 0 -1px 0 ${COLORS.fencePost}`
            }}
          />
          {i < GRID_SIZE && (
            <div 
              className="w-2 h-3"
              style={{ 
                background: COLORS.fencePost,
                boxShadow: "inset -1px 0 0 rgba(0,0,0,0.2)"
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-3 flex">
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`bottom-${i}`}>
          <div 
            className="flex-1"
            style={{ 
              background: `linear-gradient(to top, ${COLORS.fenceLight}, ${COLORS.fenceDark})`,
              boxShadow: `inset 0 1px 0 ${COLORS.fencePost}`
            }}
          />
          {i < GRID_SIZE && (
            <div 
              className="w-2 h-3"
              style={{ 
                background: COLORS.fencePost,
                boxShadow: "inset -1px 0 0 rgba(0,0,0,0.2)"
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
    
    <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col">
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`left-${i}`}>
          <div 
            className="flex-1"
            style={{ 
              background: `linear-gradient(to right, ${COLORS.fenceLight}, ${COLORS.fenceDark})`,
              boxShadow: `inset -1px 0 0 ${COLORS.fencePost}`
            }}
          />
          {i < GRID_SIZE && (
            <div 
              className="w-3 h-2"
              style={{ 
                background: COLORS.fencePost,
                boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)"
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
    
    <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col">
      {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
        <React.Fragment key={`right-${i}`}>
          <div 
            className="flex-1"
            style={{ 
              background: `linear-gradient(to left, ${COLORS.fenceLight}, ${COLORS.fenceDark})`,
              boxShadow: `inset 1px 0 0 ${COLORS.fencePost}`
            }}
          />
          {i < GRID_SIZE && (
            <div 
              className="w-3 h-2"
              style={{ 
                background: COLORS.fencePost,
                boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.2)"
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SnakeSegment = ({ isHead, direction }: { isHead?: boolean; direction?: Direction }) => {
  const bgColor = isHead ? COLORS.snakeHead : COLORS.snakeBody;
  const highlightColor = COLORS.snakeHighlight;
  
  return (
    <div
      className="absolute rounded-sm"
      style={{
        width: `${CELL_SIZE - 4}px`,
        height: `${CELL_SIZE - 4}px`,
        backgroundColor: bgColor,
        boxShadow: `
          inset 2px 2px 0 ${highlightColor},
          inset -2px -2px 0 ${COLORS.snakeBodyDark},
          2px 2px 0 rgba(0,0,0,0.1)
        `,
        transition: "all 0.08s ease-out"
      }}
    >
      {isHead && direction && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
              backgroundColor: "#fff",
              boxShadow: "inset 1px 1px 0 #333"
            }}
          />
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ 
              backgroundColor: "#fff",
              boxShadow: "inset 1px 1px 0 #333"
            }}
          />
        </div>
      )}
    </div>
  );
};

const VegetableFood = ({ type }: { type: FoodType }) => {
  const configs = {
    carrot: {
      body: COLORS.carrot,
      leaf: COLORS.carrotLeaf,
      shape: "rounded-full rotate-45" as const
    },
    tomato: {
      body: COLORS.tomato,
      leaf: COLORS.tomatoLeaf,
      shape: "rounded-full" as const
    },
    apple: {
      body: COLORS.apple,
      leaf: COLORS.appleLeaf,
      shape: "rounded-full" as const
    }
  };
  
  const config = configs[type];
  
  return (
    <div
      className={`absolute ${config.shape}`}
      style={{
        width: `${CELL_SIZE - 6}px`,
        height: `${CELL_SIZE - 6}px`,
        backgroundColor: config.body,
        boxShadow: `
          inset 3px 3px 0 ${config.body.replace("0.", "0.").replace(")", ", 0.3)")},
          inset -2px -2px 0 rgba(0,0,0,0.2),
          2px 2px 0 rgba(0,0,0,0.1)
        `,
        animation: "bounce 0.5s ease-in-out infinite alternate"
      }}
    >
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2"
        style={{
          backgroundColor: config.leaf,
          clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)"
        }}
      />
      <div 
        className="absolute top-1 left-1 w-1 h-1 rounded-full"
        style={{ backgroundColor: "rgba(255,255,255,0.5)" }}
      />
    </div>
  );
};

const SmallFlower = ({ x, y, color }: { x: number; y: number; color: string }) => (
  <div
    className="absolute"
    style={{
      left: `${x * CELL_SIZE + 10}px`,
      top: `${y * CELL_SIZE + 10}px`,
      width: "8px",
      height: "8px"
    }}
  >
    <div 
      className="absolute inset-0 rounded-full"
      style={{ 
        backgroundColor: color,
        boxShadow: "inset 1px 1px 0 rgba(255,255,255,0.3)"
      }}
    />
    <div 
      className="absolute inset-0 rounded-full animate-pulse"
      style={{ 
        backgroundColor: "#FFE066",
        width: "4px",
        height: "4px",
        top: "2px",
        left: "2px"
      }}
    />
  </div>
);

export function SnakeGame() {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const [snake, setSnake] = useState<Position[]>([
    { x: 7, y: 7 },
    { x: 6, y: 7 },
    { x: 5, y: 7 }
  ]);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [nextDirection, setNextDirection] = useState<Direction>("RIGHT");
  
  const [food, setFood] = useState<Position>({ x: 10, y: 7 });
  const [foodType, setFoodType] = useState<FoodType>("carrot");
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDirectionChangeRef = useRef<number>(0);
  const movementIntervalRef = useRef<number>(200);
  
  const getRandomFoodType = (): FoodType => {
    const types: FoodType[] = ["carrot", "tomato", "apple"];
    return types[Math.floor(Math.random() * types.length)];
  };
  
  const generateFoodPosition = useCallback((): { position: Position; type: FoodType } => {
    let newPos: Position;
    let attempts = 0;
    
    do {
      newPos = {
        x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
        y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
      };
      attempts++;
    } while (
      snake.some(seg => seg.x === newPos.x && seg.y === newPos.y) &&
      attempts < 100
    );
    
    return { position: newPos, type: getRandomFoodType() };
  }, [snake]);
  
  const resetGame = useCallback(() => {
    setSnake([
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 }
    ]);
    setDirection("RIGHT");
    setNextDirection("RIGHT");
    setScore(0);
    const { position, type } = generateFoodPosition();
    setFood(position);
    setFoodType(type);
  }, [generateFoodPosition]);
  
  const startGame = useCallback(() => {
    if (gameState === "idle" || gameState === "gameover") {
      resetGame();
      setGameState("playing");
    }
  }, [gameState, resetGame]);

  const backToStart = useCallback(() => {
    resetGame();
    setGameState("idle");
  }, [resetGame]);
  
  const endGame = useCallback(() => {
    setGameState("gameover");
    if (score > highScore) {
      setHighScore(score);
    }
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [score, highScore]);
  
  const moveSnake = useCallback(() => {
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = { ...head };
      
      setDirection(nextDirection);
      
      switch (nextDirection) {
        case "UP":
          newHead.y -= 1;
          break;
        case "DOWN":
          newHead.y += 1;
          break;
        case "LEFT":
          newHead.x -= 1;
          break;
        case "RIGHT":
          newHead.x += 1;
          break;
      }
      
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        setTimeout(() => endGame(), 0);
        return prevSnake;
      }
      
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setTimeout(() => endGame(), 0);
        return prevSnake;
      }
      
      const newSnake = [newHead, ...prevSnake];
      
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 1);
        const { position, type } = generateFoodPosition();
        setFood(position);
        setFoodType(type);
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [nextDirection, food, generateFoodPosition, endGame]);
  
  const getGameSpeed = useCallback((): number => {
    const baseSpeed = 200;
    const speedDecrease = Math.min(score * 10, 120);
    return baseSpeed - speedDecrease;
  }, [score]);
  
  useEffect(() => {
    if (gameState === "playing") {
      const speed = getGameSpeed();
      movementIntervalRef.current = speed;
      gameLoopRef.current = setInterval(() => {
        moveSnake();
      }, speed);
      
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState, getGameSpeed, moveSnake]);
  
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
      
      if (gameState === "gameover") {
        if (e.key === "Enter" || e.key === " " || e.key === "r" || e.key === "R") {
          startGame();
        }
        if (e.key === "Escape") {
          backToStart();
        }
        return;
      }
      
      if (gameState === "playing") {
        const now = Date.now();
        if (now - lastDirectionChangeRef.current < movementIntervalRef.current) return;
        
        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            setNextDirection(prev => prev !== "DOWN" ? "UP" : prev);
            lastDirectionChangeRef.current = now;
            break;
          case "ArrowDown":
          case "s":
          case "S":
            setNextDirection(prev => prev !== "UP" ? "DOWN" : prev);
            lastDirectionChangeRef.current = now;
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            setNextDirection(prev => prev !== "RIGHT" ? "LEFT" : prev);
            lastDirectionChangeRef.current = now;
            break;
          case "ArrowRight":
          case "d":
          case "D":
            setNextDirection(prev => prev !== "LEFT" ? "RIGHT" : prev);
            lastDirectionChangeRef.current = now;
            break;
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, startGame]);
  
  const flowers = [
    { x: 2, y: 2, color: "#FF6B6B" },
    { x: 12, y: 3, color: "#FFE066" },
    { x: 3, y: 11, color: "#FF6B6B" },
    { x: 11, y: 12, color: "#FFE066" },
  ];
  
  const containerWidth = GRID_SIZE * CELL_SIZE;
  const containerHeight = GRID_SIZE * CELL_SIZE;
  
  return (
    <div className="relative w-full max-w-4xl aspect-video bg-card rounded-2xl overflow-hidden flex items-center justify-center p-4">
      <div 
        className="relative rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: `${containerWidth + 24}px`,
          height: `${containerHeight + 24}px`,
          background: `linear-gradient(135deg, ${COLORS.fenceLight}, ${COLORS.fenceDark})`,
          boxShadow: `
            inset 0 0 20px rgba(0,0,0,0.2),
            0 8px 32px rgba(0,0,0,0.3),
            0 2px 8px rgba(0,0,0,0.2)
          `
        }}
      >
        <div 
          className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-20"
          style={{ 
            background: `linear-gradient(to bottom, ${COLORS.fenceLight}, ${COLORS.fencePost})`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}
        >
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-bold"
              style={{ 
                color: COLORS.scoreText,
                textShadow: "1px 1px 0 rgba(255,255,255,0.3)"
              }}
            >
              HARVEST SNAKE
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span 
                className="text-xs"
                style={{ color: COLORS.scoreText }}
              >
                分数：
              </span>
              <span 
                className="text-sm font-bold"
                style={{ 
                  color: COLORS.snakeHead,
                  textShadow: "1px 1px 0 rgba(255,255,255,0.3)"
                }}
              >
                {score}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span 
                className="text-xs"
                style={{ color: COLORS.scoreText }}
              >
                最高：
              </span>
              <span 
                className="text-sm font-bold"
                style={{ 
                  color: COLORS.carrot,
                  textShadow: "1px 1px 0 rgba(255,255,255,0.3)"
                }}
              >
                {highScore}
              </span>
            </div>
          </div>
        </div>
        
        <div 
          className="relative mt-8 mx-auto overflow-hidden"
          style={{
            width: `${containerWidth}px`,
            height: `${containerHeight}px`,
            borderRadius: "4px"
          }}
        >
          <GrassBackground />
          <FenceBorder />
          
          {flowers.map((flower, i) => (
            <SmallFlower key={i} x={flower.x} y={flower.y} color={flower.color} />
          ))}
          
          <div
            className="absolute transition-all duration-100"
            style={{
              left: `${food.x * CELL_SIZE + 2}px`,
              top: `${food.y * CELL_SIZE + 2}px`
            }}
          >
            <VegetableFood type={foodType} />
          </div>
          
          {snake.map((segment, index) => (
            <div
              key={`${segment.x}-${segment.y}-${index}`}
              className="absolute transition-all duration-100"
              style={{
                left: `${segment.x * CELL_SIZE + 2}px`,
                top: `${segment.y * CELL_SIZE + 2}px`
              }}
            >
              <SnakeSegment 
                isHead={index === 0} 
                direction={index === 0 ? direction : undefined} 
              />
            </div>
          ))}
          
          {gameState === "idle" && (
            <div 
              className="absolute inset-0 flex flex-col items-center justify-center z-10"
              style={{ backgroundColor: COLORS.overlayBg }}
            >
              <div 
                className="text-center animate-bounce"
                style={{ 
                  color: COLORS.scoreText,
                  textShadow: "2px 2px 0 rgba(255,255,255,0.5)"
                }}
              >
                <div className="text-xl font-bold mb-2">准备好耕种了吗？</div>
                <div className="text-sm opacity-80">
                  按任意键开始
                </div>
                <div className="mt-4 text-xs opacity-60 flex items-center justify-center gap-2">
                  <span>↑</span><span>↓</span><span>←</span><span>→</span>
                  <span>or</span>
                  <span>W</span><span>A</span><span>S</span><span>D</span>
                </div>
              </div>
            </div>
          )}
          
          {gameState === "gameover" && (
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
                <div className="text-xl font-bold mb-2">游戏结束！</div>
                <div className="text-lg mb-4">
                  分数： <span style={{ color: COLORS.carrot }}>{score}</span>
                </div>
                {score > 0 && (
                  <div className="text-sm mb-4 opacity-70">
                    {score >= 20 ? "大丰收！" :
                     score >= 10 ? "丰收！" :
                     score >= 5 ? "不错的开始！" :
                     "继续加油！"}
                  </div>
                )}
                <button
                  onClick={startGame}
                  className="w-full px-6 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: COLORS.carrot,
                    color: "#fff",
                    boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  再来一次 (回车)
                </button>
                <button
                  onClick={backToStart}
                  className="w-full mt-3 px-6 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: COLORS.fenceDark,
                    color: "#fff",
                    boxShadow: "0 4px 0 rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  返回开始页面
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}