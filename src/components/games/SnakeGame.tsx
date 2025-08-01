import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Position {
  row: number;
  col: number;
}

interface SnakeGameProps {
  width: number;
  height: number;
  onGameOver: (score: number) => void;
  onExit: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ width, height, onGameOver, onExit }) => {
  const [snake, setSnake] = useState<Position[]>([
    { row: Math.floor(height / 2), col: Math.floor(width / 4) },
    { row: Math.floor(height / 2), col: Math.floor(width / 4) - 2 },
    { row: Math.floor(height / 2), col: Math.floor(width / 4) - 4 },
  ]);
  const [food, setFood] = useState<Position>({ row: 0, col: 0 });
  const [direction, setDirection] = useState<{ v: 0, h: 2 }>({ v: 0, h: 2 });
  const [gameRunning, setGameRunning] = useState(true);
  const [score, setScore] = useState(0);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef(direction);

  const generateFood = useCallback(() => {
    let newFood: Position;
    do {
      newFood = {
        row: Math.floor(Math.random() * (height - 2)) + 1,
        col: Math.floor(Math.random() * (width - 2)) + 1,
      };
    } while (snake.some(segment => segment.row === newFood.row && segment.col === newFood.col));
    setFood(newFood);
  }, [snake, width, height]);

  useEffect(() => {
    generateFood();
  }, []);

  useEffect(() => {
    directionRef.current = direction;
  }, [direction]);

  const moveSnake = useCallback(() => {
    if (!gameRunning) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      head.row += directionRef.current.v;
      head.col += directionRef.current.h;

      // Check wall collision
      if (head.row <= 0 || head.row >= height - 1 || 
          head.col <= 0 || head.col >= width - 1) {
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
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [gameRunning, food, generateFood, height, width, score, onGameOver]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [moveSnake]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameRunning) return;

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
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '));

    // Draw borders
    for (let i = 0; i < width; i++) {
      grid[0][i] = '─';
      grid[height - 1][i] = '─';
    }
    for (let i = 0; i < height; i++) {
      grid[i][0] = '│';
      grid[i][width - 1] = '│';
    }
    grid[0][0] = '┌';
    grid[0][width - 1] = '┐';
    grid[height - 1][0] = '└';
    grid[height - 1][width - 1] = '┘';

    // Draw snake
    snake.forEach((segment, index) => {
      if (segment.col > 0 && segment.col < width - 1 && 
          segment.row > 0 && segment.row < height - 1) {
        grid[segment.row][segment.col] = index === 0 ? '@' : '*';
      }
    });

    // Draw food
    if (food.col > 0 && food.col < width - 1 && 
        food.row > 0 && food.row < height - 1) {
      grid[food.row][food.col] = '◆';
    }

    return grid.map(row => row.join('')).join('\n');
  };

  return (
    <div ref={gameRef} className="font-mono text-sm">
      <div className="mb-2 text-primary">
        Snake Game - Score: {score} | Use WASD or Arrow Keys | Press Q or ESC to quit
      </div>
      <pre className="text-foreground">{renderGame()}</pre>
      {!gameRunning && (
        <div className="mt-2 text-destructive">
          Game Over! Final Score: {score}
        </div>
      )}
    </div>
  );
};