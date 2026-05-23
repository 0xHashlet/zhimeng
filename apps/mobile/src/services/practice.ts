import type { DiagnosticQuestion, MockDiagnostic } from "../types/practice";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type PracticeOptionDto = {
  key: "A" | "B" | "C" | "D";
  value: string;
};

type DiagnosticQuestionDto = {
  id: number;
  type: string;
  selected_answer: string;
  material: string[];
  question: string;
  options: PracticeOptionDto[];
};

type MockDiagnosticDto = {
  current_index: number;
  total_count: number;
  questions: DiagnosticQuestionDto[];
};

export async function fetchMockDiagnostic(): Promise<MockDiagnostic> {
  const response = await fetch(`${API_BASE_URL}/api/v1/practice/mock-diagnostic`);

  if (!response.ok) {
    throw new Error("获取诊断题目失败");
  }

  const data = (await response.json()) as MockDiagnosticDto;

  return {
    currentIndex: data.current_index,
    totalCount: data.total_count,
    questions: data.questions.map(mapQuestion)
  };
}

function mapQuestion(question: DiagnosticQuestionDto): DiagnosticQuestion {
  return {
    id: question.id,
    type: question.type,
    selectedAnswer: question.selected_answer,
    material: question.material,
    question: question.question,
    options: question.options
  };
}
