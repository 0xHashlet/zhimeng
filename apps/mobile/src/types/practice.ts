export type PracticeOption = {
  key: "A" | "B" | "C" | "D";
  value: string;
};

export type DiagnosticQuestion = {
  id: number;
  type: string;
  selectedAnswer: string;
  material: string[];
  question: string;
  options: PracticeOption[];
};

export type MockDiagnostic = {
  currentIndex: number;
  totalCount: number;
  questions: DiagnosticQuestion[];
};
