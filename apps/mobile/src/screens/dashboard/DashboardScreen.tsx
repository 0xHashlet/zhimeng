import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import { KeyRound, Settings, SlidersHorizontal, Zap } from "lucide-react-native";
import { requestGeneratedQuestions } from "../../services/deepseekQuestionService";
import { colors } from "../../theme/colors";
import type {
  BaseWeightQuestion,
  DifficultyLevel,
  TrainingConfig
} from "../../types/training";

type DashboardScreenProps = {
  onTrainingReady: (questions: BaseWeightQuestion[], config: TrainingConfig) => void;
};

const apiKeyStoreKey = "zhimeng.deepseek_api_key";
const modelStoreKey = "zhimeng.deepseek_model";
const defaultModel = "deepseek-v4-flash";
const modelOptions = [
  "deepseek-v4-flash",
  "deepseek-v4-pro",
  "deepseek-chat",
  "deepseek-reasoner"
] as const;

const difficultyOptions: Array<{
  description: string;
  label: string;
  value: DifficultyLevel;
}> = [
  {
    label: "简单",
    value: "easy",
    description: "数据直接，适合练公式和速度"
  },
  {
    label: "标准",
    value: "medium",
    description: "少量干扰，接近日常刷题"
  },
  {
    label: "困难",
    value: "hard",
    description: "信息分散，更接近真题阅读压力"
  }
];

export function DashboardScreen({ onTrainingReady }: DashboardScreenProps) {
  const [apiKey, setApiKey] = useState("");
  const [draftApiKey, setDraftApiKey] = useState("");
  const [model, setModel] = useState(defaultModel);
  const [draftModel, setDraftModel] = useState(defaultModel);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [materialDifficulty, setMaterialDifficulty] =
    useState<DifficultyLevel>("medium");
  const [optionDifficulty, setOptionDifficulty] = useState<DifficultyLevel>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const storedApiKey = await SecureStore.getItemAsync(apiKeyStoreKey);
      const storedModel = await SecureStore.getItemAsync(modelStoreKey);

      if (storedApiKey) {
        setApiKey(storedApiKey);
        setDraftApiKey(storedApiKey);
      }

      if (storedModel) {
        setModel(storedModel);
        setDraftModel(storedModel);
      }
    }

    void loadSettings();
  }, []);

  async function saveSettings() {
    const nextApiKey = draftApiKey.trim();
    const nextModel = draftModel.trim() || defaultModel;

    if (!nextApiKey) {
      await SecureStore.deleteItemAsync(apiKeyStoreKey);
      setApiKey("");
      await SecureStore.setItemAsync(modelStoreKey, nextModel);
      setModel(nextModel);
      setDraftModel(nextModel);
      setSettingsVisible(false);
      return;
    }

    await SecureStore.setItemAsync(apiKeyStoreKey, nextApiKey);
    await SecureStore.setItemAsync(modelStoreKey, nextModel);
    setApiKey(nextApiKey);
    setModel(nextModel);
    setDraftModel(nextModel);
    setSettingsVisible(false);
  }

  async function startTraining() {
    if (!apiKey) {
      setDraftApiKey("");
      setDraftModel(model);
      setSettingsVisible(true);
      return;
    }

    const config = {
      materialDifficulty,
      optionDifficulty
    };

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const questions = await requestGeneratedQuestions(apiKey, model, config);
      onTrainingReady(questions, config);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "题目生成失败，请检查 API Key、模型和网络后重试。"
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-8 pt-4"
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[25px] font-extrabold leading-8 text-glacier-textPrimary">
              基期比重提速训练
            </Text>
            <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
              选择题干和选项难度后，直接调用 DeepSeek 生成 10 道模拟真题。
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="打开设置"
            className="h-11 w-11 items-center justify-center rounded-full bg-glacier-soft"
            onPress={() => {
              setDraftApiKey(apiKey);
              setDraftModel(model);
              setSettingsVisible(true);
            }}
          >
            <Settings color={colors.primary} size={22} />
          </Pressable>
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

        {errorMessage ? (
          <View className="mt-4 rounded-2xl border border-glacier-error bg-glacier-card p-3">
            <Text className="text-sm leading-[22px] text-glacier-error">
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="开始生成训练题"
          disabled={isGenerating}
          className={[
            "mt-5 min-h-[56px] flex-row items-center justify-center gap-2 rounded-[22px] py-4",
            isGenerating ? "bg-glacier-border" : "bg-glacier-primary"
          ].join(" ")}
          onPress={startTraining}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Zap color={colors.card} size={19} />
          )}
          <Text className="text-base font-extrabold text-white">
            {isGenerating ? "正在生成 10 题" : "开始训练"}
          </Text>
        </Pressable>

        <View className="mt-5 rounded-[24px] bg-glacier-cardSoft p-4">
          <Text className="text-sm font-bold text-glacier-textPrimary">
            当前生成配置
          </Text>
          <Text className="mt-2 text-sm leading-[23px] text-glacier-textSecondary">
            模型：{model}
            。题干难度决定材料干扰项数量，选项难度决定答案附近选项的紧密程度。
            做题页支持开启草稿，打开后可以直接在屏幕上书写。
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/20">
          <View className="rounded-t-[28px] bg-glacier-card px-5 pb-8 pt-5">
            <View className="flex-row items-center gap-2">
              <KeyRound color={colors.primary} size={20} />
              <Text className="text-lg font-extrabold text-glacier-textPrimary">
                大模型设置
              </Text>
            </View>
            <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
              API Key 仅保存在本机 SecureStore。前端会直接调用 DeepSeek API
              生成题目，不经过你的后台。
            </Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder="填写 DeepSeek API Key"
              placeholderTextColor={colors.textMuted}
              value={draftApiKey}
              className="mt-4 h-12 rounded-2xl border border-glacier-border bg-glacier-background px-4 text-base text-glacier-textPrimary"
              onChangeText={setDraftApiKey}
            />
            <Text className="mt-5 text-sm font-bold text-glacier-textPrimary">
              生成模型
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {modelOptions.map((modelOption) => {
                const selected = draftModel.trim() === modelOption;

                return (
                  <Pressable
                    key={modelOption}
                    accessibilityRole="button"
                    accessibilityLabel={`选择模型 ${modelOption}`}
                    className={[
                      "rounded-full border px-3 py-2",
                      selected
                        ? "border-glacier-primary bg-glacier-soft"
                        : "border-glacier-border bg-glacier-card"
                    ].join(" ")}
                    onPress={() => setDraftModel(modelOption)}
                  >
                    <Text
                      className={[
                        "text-sm font-bold",
                        selected ? "text-glacier-primary" : "text-glacier-textSecondary"
                      ].join(" ")}
                    >
                      {modelOption}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="也可以填写自定义模型名"
              placeholderTextColor={colors.textMuted}
              value={draftModel}
              className="mt-3 h-12 rounded-2xl border border-glacier-border bg-glacier-background px-4 text-base text-glacier-textPrimary"
              onChangeText={setDraftModel}
            />
            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="取消设置"
                className="h-12 flex-1 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
                onPress={() => setSettingsVisible(false)}
              >
                <Text className="text-base font-bold text-glacier-textSecondary">
                  取消
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="保存大模型设置"
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-glacier-primary"
                onPress={saveSettings}
              >
                <Text className="text-base font-extrabold text-white">保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
