import { useState } from "react";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { QuestionTrainingScreen } from "../screens/training/QuestionTrainingScreen";
import type { BaseWeightQuestion, TrainingConfig } from "../types/training";

export type RootStackParamList = {
  Dashboard: undefined;
  QuestionTraining: undefined;
};

export function AppNavigator() {
  const [training, setTraining] = useState<{
    config: TrainingConfig;
    questions: BaseWeightQuestion[];
  } | null>(null);

  if (training) {
    return (
      <QuestionTrainingScreen
        config={training.config}
        questions={training.questions}
        onBack={() => setTraining(null)}
      />
    );
  }

  return (
    <DashboardScreen
      onTrainingReady={(questions, config) => setTraining({ questions, config })}
    />
  );
}
