export enum padMove {
  UP,
  DOWN,
  STILL,
}

export enum giftPlayer {
  SPEED,
  SIZE,
}

export type ClassicGame = {
  type: "CLASSIC";
};

export type BoostGame = {
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

export type GiftGame = {
  type: "GIFT";
  Gift: Array<{ coord: Coord; gift: giftPlayer; start: number; side: 1 | -1 }>;
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

export type Coord = {
  x: number;
  y: number;
};

export type Player = {
  id: number;
  name: string;
  coord: Coord;
  playerMove: padMove;
  score: number;
  lastMoveTimestamp: number;
};

export type GameData = {
  id: number;
  player1: Player;
  player2: Player;
  ball: { coord: Coord; velocity: { vx: number; vy: number } };
  game: GameType;
};
