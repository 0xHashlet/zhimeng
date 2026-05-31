import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Database, SlidersHorizontal, Zap } from "lucide-react-native";
import { buildBaseWeightQuestions } from "../../services/baseWeightQuestionBank";
import { colors } from "../../theme/colors";
import type {
  BaseWeightQuestion,
  DifficultyLevel,
  TrainingConfig
} from "../../types/training";

type DashboardScreenProps = {
  onTrainingReady: (questions: BaseWeightQuestion[], config: TrainingConfig) => void;
};

const difficultyOptions: Array<{
  description: string;
  label: string;
  value: DifficultyLevel;
}> = [
  {
    label: "简单",
    value: "easy",
    description: "题干直接，选项差距更大"
  },
  {
    label: "标准",
    value: "medium",
    description: "少量干扰，选项距离适中"
  },
  {
    label: "困难",
    value: "hard",
    description: "信息分散，选项非常接近"
  }
];

export function DashboardScreen({ onTrainingReady }: DashboardScreenProps) {
  const [materialDifficulty, setMaterialDifficulty] =
    useState<DifficultyLevel>("medium");
  const [optionDifficulty, setOptionDifficulty] = useState<DifficultyLevel>("medium");

  function startTraining() {
    const config = {
      materialDifficulty,
      optionDifficulty
    };
    const questions = buildBaseWeightQuestions(config);

    onTrainingReady(questions, config);
  }

  return (
    <SafeAreaView className="flex-1 bg-glacier-card">
      <ScrollView
        className="bg-glacier-background"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8 pt-4"
      >
        <View>
          <Text className="text-[25px] font-extrabold leading-8 text-glacier-textPrimary">
            基期比重提速训练
          </Text>
          <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
            内置 50 道真题逻辑模板，每次抽取 10 道，不再等待大模型生成。
          </Text>
        </View>

        <View className="mt-5 rounded-[26px] bg-glacier-card p-4 shadow-sm">
          <View className="flex-row items-center gap-2">
            <SlidersHorizontal color={colors.primary} size={20} />
            <Text className="text-base font-extrabold text-glacier-textPrimary">
              训练难度
            </Text>
          </View>

          <DifficultySelector
            description="控制题干是否加入干扰数据、信息是否分散。"
            label="题干难度"
            value={materialDifficulty}
            onChange={setMaterialDifficulty}
          />

          <DifficultySelector
            description="控制四个选项之间的差距，越难越接近。"
            label="选项难度"
            value={optionDifficulty}
            onChange={setOptionDifficulty}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="开始训练"
          className="mt-5 min-h-[56px] flex-row items-center justify-center gap-2 rounded-[22px] bg-glacier-primary py-4"
          onPress={startTraining}
        >
          <Zap color={colors.card} size={19} />
          <Text className="text-base font-extrabold text-white">开始训练</Text>
        </Pressable>

        <View className="mt-5 rounded-[24px] bg-glacier-cardSoft p-4">
          <View className="flex-row items-center gap-2">
            <Database color={colors.primary} size={18} />
            <Text className="text-sm font-bold text-glacier-textPrimary">当前题库</Text>
          </View>
          <Text className="mt-2 text-sm leading-[23px] text-glacier-textSecondary">
            本地 50 道题目模板覆盖工业、财政、消费、金融、交通、医疗、科技等题材。
            答案位置按 A/B/C/D 接近平均分配，选项难度越高，正确答案附近的选项越接近。
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DifficultySelector({
  description,
  label,
  onChange,
  value
}: {
  description: string;
  label: string;
  onChange: (value: DifficultyLevel) => void;
  value: DifficultyLevel;
}) {
  return (
    <View className="mt-5">
      <Text className="text-sm font-bold text-glacier-textPrimary">{label}</Text>
      <Text className="mt-1 text-xs leading-[18px] text-glacier-textMuted">
        {description}
      </Text>
      <View className="mt-3 gap-2">
        {difficultyOptions.map((option) => {
          const selected = value === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={`${label}${option.label}`}
              className={[
                "rounded-2xl border px-4 py-3",
                selected
                  ? "border-glacier-primary bg-glacier-soft"
                  : "border-glacier-border bg-glacier-card"
              ].join(" ")}
              onPress={() => onChange(option.value)}
            >
              <Text
                className={[
                  "text-sm font-extrabold",
                  selected ? "text-glacier-primary" : "text-glacier-textPrimary"
                ].join(" ")}
              >
                {option.label}
              </Text>
              <Text className="mt-1 text-xs leading-[18px] text-glacier-textSecondary">
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
