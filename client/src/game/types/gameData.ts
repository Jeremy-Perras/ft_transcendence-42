export enum padMove {
  UP,
  DOWN,
  STILL,
}

export type Player = {
  id: number;
  coord: Coord;
  playerMove: padMove;
  moves: Array<{
    event: number;
    timestamp: number;
    move: padMove;
    done: boolean;
  }>;
  score: number;
};

export type GameData = {
  id: number;
  startedAt: Date;
  player1: Player;
  player2: Player;
  ball: { coord: Coord; velocity: { vx: number; vy: number } };
  game: GameType;
};
export type Coord = {
  x: number;
  y: number;
};

export type Game = {
  id: number;
  score: {
    player1: number;
    player2: number;
  };
  players: {
    player1: number;
    player2: number;
  };
};

export type ClassicGame = Game & {
  type: "CLASSIC";
};

export type BoostGame = Game & {
  type: "BOOST";
  player1Boost: {
    remaining: number;
    activated: boolean;
  };
  player2Boost: {
    remaining: number;
    activated: boolean;
  };
};

export type GiftGame = Game & {
  type: "GIFT";
  player1Gifts: {
    speed: number;
    size: number;
  };
  player2Gifts: {
    speed: number;
    size: number;
  };
};

export type GameType = ClassicGame | BoostGame | GiftGame;
