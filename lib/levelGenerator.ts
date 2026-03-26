export type Difficulty = "easy" | "medium" | "hard";

export interface SokobanLevel {
  grid: string[][];
  width: number;
  height: number;
}

export interface LevelGeneratorOptions {
  difficulty: Difficulty;
  seed?: string;
}

export interface ApiError {
  type: "api_error" | "validation_error" | "parse_error";
  message: string;
  retryable: boolean;
}

export const SOKOBAN_SYMBOLS = {
  WALL: "#",
  PLAYER: "@",
  BOX: "$",
  TARGET: ".",
  BOX_ON_TARGET: "*",
  PLAYER_ON_TARGET: "+",
  FLOOR: " ",
} as const;

export type SokobanSymbol =
  (typeof SOKOBAN_SYMBOLS)[keyof typeof SOKOBAN_SYMBOLS];

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicRequest {
  model: string;
  max_tokens: number;
  messages: AnthropicMessage[];
  system: string;
}

interface AnthropicResponse {
  content: Array<{ type: "text"; text: string }>;
  error?: {
    type: string;
    message: string;
  };
}

interface DifficultyParams {
  minBoxes: number;
  maxBoxes: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  complexity: string;
}

const DIFFICULTY_PARAMS: Record<Difficulty, DifficultyParams> = {
  easy: {
    minBoxes: 1,
    maxBoxes: 2,
    minWidth: 5,
    maxWidth: 8,
    minHeight: 5,
    maxHeight: 8,
    complexity: "simple, minimal obstacles, straightforward solution",
  },
  medium: {
    minBoxes: 2,
    maxBoxes: 3,
    minWidth: 7,
    maxWidth: 10,
    minHeight: 7,
    maxHeight: 10,
    complexity: "moderate complexity, some dead ends possible",
  },
  hard: {
    minBoxes: 3,
    maxBoxes: 4,
    minWidth: 9,
    maxWidth: 12,
    minHeight: 9,
    maxHeight: 12,
    complexity: "high complexity, multiple rooms, requires planning",
  },
};

const VALID_SYMBOLS: SokobanSymbol[] = [
  SOKOBAN_SYMBOLS.WALL,
  SOKOBAN_SYMBOLS.PLAYER,
  SOKOBAN_SYMBOLS.BOX,
  SOKOBAN_SYMBOLS.TARGET,
  SOKOBAN_SYMBOLS.BOX_ON_TARGET,
  SOKOBAN_SYMBOLS.PLAYER_ON_TARGET,
  SOKOBAN_SYMBOLS.FLOOR,
];

function getAnthropicConfig() {
  const baseUrl =
    process.env.ANTHROPIC_BASE_URL || "https://api.minimaxi.com/anthropic";
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }

  return { baseUrl, apiKey };
}

async function callAnthropicApi(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const { baseUrl, apiKey } = getAnthropicConfig();

  const request: AnthropicRequest = {
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [{ role: "user", content: userMessage }],
    system: systemPrompt,
  };

  const response = await fetch(`${baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data: AnthropicResponse = await response.json();

  if (data.error) {
    throw new Error(`Anthropic error: ${data.error.message}`);
  }

  return data.content[0]?.text || "";
}

function parseLevelString(levelText: string): string[][] | null {
  const lines = levelText
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 3) return null;

  const grid: string[][] = [];
  const maxWidth = Math.max(...lines.map((l) => l.length));

  for (const line of lines) {
    const row: SokobanSymbol[] = [];
    for (let i = 0; i < maxWidth; i++) {
      const char = (line[i] || SOKOBAN_SYMBOLS.FLOOR) as SokobanSymbol;
      row.push(VALID_SYMBOLS.includes(char) ? char : SOKOBAN_SYMBOLS.FLOOR);
    }
    grid.push(row);
  }

  return grid;
}

function validateLevel(grid: string[][]): {
  valid: boolean;
  error?: string;
} {
  let playerCount = 0;
  let boxCount = 0;
  let targetCount = 0;
  let boxOnTargetCount = 0;

  for (const row of grid) {
    for (const cell of row) {
      if (cell === SOKOBAN_SYMBOLS.PLAYER || cell === SOKOBAN_SYMBOLS.PLAYER_ON_TARGET) {
        playerCount++;
      }
      if (cell === SOKOBAN_SYMBOLS.BOX || cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET) {
        boxCount++;
      }
      if (
        cell === SOKOBAN_SYMBOLS.TARGET ||
        cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET ||
        cell === SOKOBAN_SYMBOLS.PLAYER_ON_TARGET
      ) {
        targetCount++;
      }
      if (cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET) {
        boxOnTargetCount++;
      }
    }
  }

  if (playerCount !== 1) {
    return { valid: false, error: `Invalid player count: ${playerCount} (expected 1)` };
  }
  if (boxCount === 0) {
    return { valid: false, error: "No boxes found" };
  }
  if (boxCount !== targetCount) {
    return { valid: false, error: `Box count (${boxCount}) doesn't match target count (${targetCount})` };
  }
  if (boxOnTargetCount === boxCount) {
    return { valid: false, error: "Level is already solved" };
  }

  return { valid: true };
}

function normalizeGrid(grid: string[][]): string[][] {
  return grid.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      const isBorder =
        rowIndex === 0 ||
        rowIndex === grid.length - 1 ||
        colIndex === 0 ||
        colIndex === row.length - 1;
      return isBorder && cell === SOKOBAN_SYMBOLS.FLOOR
        ? SOKOBAN_SYMBOLS.WALL
        : cell;
    })
  );
}

function generateProceduralLevel(difficulty: Difficulty): SokobanLevel {
  const params = DIFFICULTY_PARAMS[difficulty];
  const numBoxes =
    params.minBoxes +
    Math.floor(Math.random() * (params.maxBoxes - params.minBoxes + 1));
  const width =
    params.minWidth +
    Math.floor(Math.random() * (params.maxWidth - params.minWidth + 1));
  const height =
    params.minHeight +
    Math.floor(Math.random() * (params.maxHeight - params.minHeight + 1));

  let grid: string[][] = Array.from({ length: height }, () =>
    Array(width).fill(SOKOBAN_SYMBOLS.FLOOR)
  );

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
        grid[y][x] = SOKOBAN_SYMBOLS.WALL;
      }
    }
  }

  const wallCount = difficulty === "easy" ? 2 : difficulty === "medium" ? 5 : 8;

  for (let i = 0; i < wallCount; i++) {
    const wx = 2 + Math.floor(Math.random() * (width - 4));
    const wy = 2 + Math.floor(Math.random() * (height - 4));
    if (grid[wy][wx] === SOKOBAN_SYMBOLS.FLOOR) {
      const horizontal = Math.random() > 0.5;
      const length = 2 + Math.floor(Math.random() * 2);
      for (let j = 0; j < length; j++) {
        const nx = horizontal ? wx + j : wx;
        const ny = horizontal ? wy : wy + j;
        if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
          grid[ny][nx] = SOKOBAN_SYMBOLS.WALL;
        }
      }
    }
  }

  const validPositions: [number, number][] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === SOKOBAN_SYMBOLS.FLOOR) {
        validPositions.push([x, y]);
      }
    }
  }

  if (validPositions.length < numBoxes * 2 + 1) {
    return generateSimpleFallback(difficulty);
  }

  for (let i = validPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [validPositions[i], validPositions[j]] = [
      validPositions[j],
      validPositions[i],
    ];
  }

  const [playerX, playerY] = validPositions.pop()!;
  grid[playerY][playerX] = SOKOBAN_SYMBOLS.PLAYER;

  for (let i = 0; i < numBoxes && validPositions.length > 0; i++) {
    const pos = validPositions.pop()!;
    grid[pos[1]][pos[0]] = SOKOBAN_SYMBOLS.TARGET;
  }

  for (let i = 0; i < numBoxes && validPositions.length > 0; i++) {
    const pos = validPositions.pop()!;
    grid[pos[1]][pos[0]] = SOKOBAN_SYMBOLS.BOX;
  }

  grid = normalizeGrid(grid);

  return {
    grid,
    width: grid[0].length,
    height: grid.length,
  };
}

function generateSimpleFallback(difficulty: Difficulty): SokobanLevel {
  const levels: Record<Difficulty, string[][]> = {
    easy: [
      ["#", "#", "#", "#", "#"],
      ["#", "@", " ", "$", "#"],
      ["#", " ", "#", ".", "#"],
      ["#", " ", " ", ".", "#"],
      ["#", "#", "#", "#", "#"],
    ],
    medium: [
      ["#", "#", "#", "#", "#", "#", "#"],
      ["#", "@", " ", " ", "$", "#", "#"],
      ["#", " ", "#", "#", " ", "#", "#"],
      ["#", " ", "$", " ", " ", "#", "#"],
      ["#", "#", "#", ".", ".", "#", "#"],
      ["#", "#", "#", "#", "#", "#", "#"],
    ],
    hard: [
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
      ["#", "@", " ", "#", " ", " ", " ", ".", "#"],
      ["#", " ", "$", "#", "$", " ", "#", ".", "#"],
      ["#", " ", " ", "#", " ", " ", "#", ".", "#"],
      ["#", " ", " ", " ", "$", " ", " ", ".", "#"],
      ["#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ],
  };

  const grid = levels[difficulty].map((row) => [...row]);

  return {
    grid,
    width: grid[0].length,
    height: grid.length,
  };
}

function buildSystemPrompt(difficulty: Difficulty): string {
  const params = DIFFICULTY_PARAMS[difficulty];

  return `You are an expert Sokoban puzzle designer. Your task is to generate valid, solvable Sokoban puzzle levels.

SOKOBAN RULES:
- Player (@) pushes boxes ($) onto target locations (.)
- Player can only push one box at a time
- Player cannot pull boxes
- Level is solved when all boxes are on targets
- Walls (#) cannot be crossed
- Floor ( ) is walkable space

SYMBOLS:
- # = Wall (impassable)
- @ = Player starting position
- $ = Box
- . = Target location
- * = Box on target (already solved for that box)
- + = Player standing on target
- (space) = Empty floor

REQUIREMENTS:
1. Generate a ${difficulty} difficulty level with:
   - ${params.minBoxes}-${params.maxBoxes} boxes
   - Grid size: ${params.minWidth}-${params.maxWidth} wide, ${params.minHeight}-${params.maxHeight} tall
   - ${params.complexity}

2. The level MUST be solvable - ALL boxes must be reachable and pushable to targets

3. Include some strategic walls and obstacles to make it interesting

4. Player must have room to maneuver around boxes

5. Output ONLY the level grid in text format, nothing else
   - Each row on its own line
   - No explanations, no markdown, no code blocks
   - Just the raw grid

EXAMPLE OUTPUT FORMAT:
#####
#@$.#
#.$.#
#####
`;
}

async function generateLevelFromAI(difficulty: Difficulty): Promise<SokobanLevel> {
  const systemPrompt = buildSystemPrompt(difficulty);
  const userMessage = `Generate a ${difficulty} difficulty Sokoban level that is solvable.`;

  const response = await callAnthropicApi(systemPrompt, userMessage);

  let grid: string[][] | null = parseLevelString(response);

  if (!grid) {
    const codeBlockMatch = response.match(/```[\w]*\n?([\s\S]+?)\n?```/);
    if (codeBlockMatch) {
      grid = parseLevelString(codeBlockMatch[1]);
    }
  }

  if (!grid) {
    throw new Error("Failed to parse generated level from AI response");
  }

  const validation = validateLevel(grid);
  if (!validation.valid) {
    throw new Error(`Level validation failed: ${validation.error}`);
  }

  grid = normalizeGrid(grid);

  return {
    grid,
    width: grid[0].length,
    height: grid.length,
  };
}

export async function generateLevel(
  difficulty: Difficulty = "medium"
): Promise<SokobanLevel> {
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    throw new Error(`Invalid difficulty: ${difficulty}. Must be 'easy', 'medium', or 'hard'`);
  }

  try {
    return await generateLevelFromAI(difficulty);
  } catch (error) {
    console.error(`AI level generation failed, using fallback:`, error);
    return generateProceduralLevel(difficulty);
  }
}

export function validateSokobanLevel(grid: string[][]): {
  valid: boolean;
  error?: string;
  stats?: {
    playerCount: number;
    boxCount: number;
    targetCount: number;
    boxOnTargetCount: number;
  };
} {
  if (!grid || !Array.isArray(grid) || grid.length < 3) {
    return { valid: false, error: "Invalid grid format" };
  }

  let playerCount = 0;
  let boxCount = 0;
  let targetCount = 0;
  let boxOnTargetCount = 0;

  for (const row of grid) {
    if (!Array.isArray(row)) {
      return { valid: false, error: "Invalid row format" };
    }
    for (const cell of row) {
      if (
        cell === SOKOBAN_SYMBOLS.PLAYER ||
        cell === SOKOBAN_SYMBOLS.PLAYER_ON_TARGET
      ) {
        playerCount++;
      }
      if (
        cell === SOKOBAN_SYMBOLS.BOX ||
        cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET
      ) {
        boxCount++;
      }
      if (
        cell === SOKOBAN_SYMBOLS.TARGET ||
        cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET ||
        cell === SOKOBAN_SYMBOLS.PLAYER_ON_TARGET
      ) {
        targetCount++;
      }
      if (cell === SOKOBAN_SYMBOLS.BOX_ON_TARGET) {
        boxOnTargetCount++;
      }
    }
  }

  const stats = { playerCount, boxCount, targetCount, boxOnTargetCount };

  if (playerCount !== 1) {
    return {
      valid: false,
      error: `Invalid player count: ${playerCount} (expected 1)`,
      stats,
    };
  }
  if (boxCount === 0) {
    return { valid: false, error: "No boxes found", stats };
  }
  if (boxCount !== targetCount) {
    return {
      valid: false,
      error: `Box count (${boxCount}) doesn't match target count (${targetCount})`,
      stats,
    };
  }
  if (boxOnTargetCount === boxCount) {
    return { valid: false, error: "Level is already solved", stats };
  }

  return { valid: true, stats };
}

export function levelToString(level: SokobanLevel): string {
  return level.grid.map((row) => row.join("")).join("\n");
}

export function parseLevelStringToLevel(str: string): SokobanLevel | null {
  const grid = parseLevelString(str);
  if (!grid) return null;

  return {
    grid,
    width: grid[0].length,
    height: grid.length,
  };
}

export function isLevelSolved(grid: string[][]): boolean {
  for (const row of grid) {
    for (const cell of row) {
      if (cell === SOKOBAN_SYMBOLS.BOX) {
        return false;
      }
    }
  }
  return true;
}
