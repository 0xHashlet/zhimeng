export type OptionKey = "A" | "B" | "C" | "D";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type TrainingOption = {
  key: OptionKey;
  value: string;
};

export type BaseWeightQuestion = {
  answer: OptionKey;
  explanation: string;
  id: number;
  material: string;
  options: TrainingOption[];
  question: string;
  tag: string;
};

export type TrainingConfig = {
  materialDifficulty: DifficultyLevel;
  optionDifficulty: DifficultyLevel;
};
