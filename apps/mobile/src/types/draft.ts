export type DraftPoint = {
  x: number;
  y: number;
};

export type DraftStroke = {
  id: string;
  points: DraftPoint[];
};
