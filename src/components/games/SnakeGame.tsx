import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  row: number;
  col: number;
}

interface SnakeGameProps {
  width?: number;
  height?: number;
  onGameOver: (score: number) => void;
  onExit: () => void;
  fullscreen?: boolean;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ 
  width = 60, 
  height = 20, 
  onGameOver, 
  onExit,
  fullscreen = false 
}) => {
  // Calculate dimensions based on fullscreen mode
  const gameWidth = fullscreen ? Math.floor(window.innerWidth / 10) - 4 : width;
  const gameHeight = fullscreen ? Math.floor(window.innerHeight / 20) - 8 : height;
  
  const [snake, setSnake] = useState<Position[]>([
    { row: Math.floor(gameHeight / 2), col: Math.floor(gameWidth / 4) },
    { row: Math.floor(gameHeight / 2), col: Math.floor(gameWidth / 4) - 2 },
    { row: Math.floor(gameHeight / 2), col: Math.floor(gameWidth / 4) - 4 },
  ]);
  const [food, setFood] = useState<Position>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<{ v: number, h: number }>({ v: 0, h: 2 });
  const [gameRunning, setGameRunning] = useState(true);
  const [score, setScore] = useState(0);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(direction);

  // Update direction ref when direction changes
  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const generateNewFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      newFood = {
        row: Math.floor(Math.random() * (gameHeight - 2)) + 1,
        col: Math.floor(Math.random() * (gameWidth - 2)) + 1,
      };
      attempts++;
    } while (
      currentSnake.some(segment => segment.row === newFood.row && segment.col === newFood.col) &&
      attempts < maxAttempts
    );
    
    setFood(newFood);
  }, [gameWidth, gameHeight]);

  // Initialize food position
  useEffect(() => {
    generateNewFood(snake);
  }, []);

  const moveSnake = useCallback(() => {
    if (!gameRunning) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.row += directionRef.current.v;
      head.col += directionRef.current.h;

      // Check wall collision
      if (head.row <= 0 || head.row >= gameHeight - 1 || 
          head.col <= 0 || head.col >= gameWidth - 1) {
        setGameRunning(false);
        onGameOver(score);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.row === head.row && segment.col === head.col)) {
        setGameRunning(false);
        onGameOver(score);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.row === food.row && head.col === food.col) {
        setScore(s => s + 1);
        // Generate new food immediately when eaten
        generateNewFood(newSnake);
        // Don't pop tail when eating food (snake grows)
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameRunning, food, gameHeight, gameWidth, score, onGameOver, generateNewFood]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameRunning) return;

    e.preventDefault();
    const newDirection = { ...directionRef.current };

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (directionRef.current.v !== 1) {
          newDirection.v = -1;
          newDirection.h = 0;
        }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (directionRef.current.v !== -1) {
          newDirection.v = 1;
          newDirection.h = 0;
        }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (directionRef.current.h !== 2) {
          newDirection.v = 0;
          newDirection.h = -2;
        }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (directionRef.current.h !== -2) {
          newDirection.v = 0;
          newDirection.h = 2;
        }
        break;
      case 'Escape':
      case 'q':
      case 'Q':
        setGameRunning(false);
        onExit();
        return;
    }

    setDirection(newDirection);
  }, [gameRunning, onExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderGame = () => {
    const grid: string[][] = Array(gameHeight).fill(null).map(() => Array(gameWidth).fill(' '));

    // Draw borders
    for (let i = 0; i < gameWidth; i++) {
      grid[0][i] = '─';
      grid[gameHeight - 1][i] = '─';
    }
    for (let i = 0; i < gameHeight; i++) {
      grid[i][0] = '│';
      grid[i][gameWidth - 1] = '│';
    }
    grid[0][0] = '┌';
    grid[0][gameWidth - 1] = '┐';
    grid[gameHeight - 1][0] = '└';
    grid[gameHeight - 1][gameWidth - 1] = '┘';

    // Draw snake
    snake.forEach((segment, index) => {
      if (segment.col > 0 && segment.col < gameWidth - 1 && 
          segment.row > 0 && segment.row < gameHeight - 1) {
        grid[segment.row][segment.col] = index === 0 ? '@' : '*';
      }
    });

    // Draw food
    if (food.col > 0 && food.col < gameWidth - 1 && 
        food.row > 0 && food.row < gameHeight - 1) {
      grid[food.row][food.col] = '◆';
    }

    return grid.map(row => row.join('')).join('\n');
  };

  const containerStyle = fullscreen ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgb(10, 10, 10)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '2rem'
  } : {};

  return (
    <div ref={gameRef} className="font-mono text-sm" style={containerStyle}>
      <div className="mb-2 text-primary">
        Snake Game - Score: {score} | Use WASD or Arrow Keys | Press Q or ESC to quit
      </div>
      <pre className="text-foreground" style={{ fontSize: fullscreen ? '0.8rem' : '0.875rem' }}>
        {renderGame()}
      </pre>
      {!gameRunning && (
        <div className="mt-2 text-destructive">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
};