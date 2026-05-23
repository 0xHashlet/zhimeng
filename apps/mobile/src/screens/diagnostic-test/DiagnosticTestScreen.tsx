import { useEffect, useState } from "react";
import { Dimensions, Pressable, ScrollView, Text, View } from "react-native";
import type { DimensionValue } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bookmark, Check, ChevronLeft } from "lucide-react-native";
import { fetchMockDiagnostic } from "../../services/practice";
import { colors } from "../../theme/colors";
import type { MockDiagnostic } from "../../types/practice";

const screenWidth = Dimensions.get("window").width;

export function DiagnosticTestScreen() {
  const [diagnostic, setDiagnostic] = useState<MockDiagnostic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDiagnostic() {
      try {
        const data = await fetchMockDiagnostic();

        if (isMounted) {
          setDiagnostic(data);
          setErrorMessage("");
        }
      } catch {
        if (isMounted) {
          setErrorMessage("题目数据加载失败，请确认后端服务已启动");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDiagnostic();

    return () => {
      isMounted = false;
    };
  }, []);

  const progressText = diagnostic
    ? `${diagnostic.currentIndex} / ${diagnostic.totalCount}`
    : "- / -";
  const progressPercent = (
    diagnostic ? `${(diagnostic.currentIndex / diagnostic.totalCount) * 100}%` : "0%"
  ) as DimensionValue;

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1">
        <View className="h-14 flex-row items-center justify-between px-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text className="text-lg font-bold text-glacier-textPrimary">
            {progressText}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="收藏本题"
            className="h-11 w-11 items-center justify-center"
          >
            <Bookmark color={colors.textPrimary} size={22} />
          </Pressable>
        </View>
        <View className="h-[3px] bg-glacier-border">
          <View
            className="h-[3px] bg-glacier-primary"
            style={{ width: progressPercent }}
          />
        </View>

        {isLoading ? (
          <StateCard
            title="正在加载题目"
            description="正在从后端 mock 接口获取诊断题。"
          />
        ) : errorMessage ? (
          <StateCard title="加载失败" description={errorMessage} />
        ) : (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            contentContainerClassName="items-stretch"
            className="flex-1"
          >
            {diagnostic?.questions.map((item) => (
              <View key={item.id} style={{ width: screenWidth }} className="flex-1">
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  className="flex-1"
                  contentContainerClassName="px-5 pb-6 pt-5"
                >
                  <View className="gap-3 rounded-[22px] border border-glacier-border bg-glacier-card p-4">
                    {item.material.map((paragraph) => (
                      <Text
                        key={paragraph}
                        className="text-[15px] leading-[26px] text-glacier-textPrimary"
                      >
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                </ScrollView>

                <View className="border-t border-glacier-border bg-glacier-background px-5 pb-5 pt-4">
                  <Text className="text-lg font-bold leading-7 text-glacier-textPrimary">
                    {item.question}
                  </Text>

                  <View className="mt-4 gap-3">
                    {item.options.map((option) => {
                      const selected = option.key === item.selectedAnswer;

                      return (
                        <Pressable
                          key={option.key}
                          accessibilityRole="button"
                          accessibilityLabel={`选项 ${option.key}，${option.value}`}
                          accessibilityState={{ selected }}
                          className={[
                            "min-h-[58px] flex-row items-center gap-4 rounded-[18px] border px-4",
                            selected
                              ? "border-glacier-primary bg-glacier-soft"
                              : "border-glacier-border bg-glacier-card"
                          ].join(" ")}
                        >
                          <Text
                            className={[
                              "text-base font-bold",
                              selected
                                ? "text-glacier-primary"
                                : "text-glacier-textPrimary"
                            ].join(" ")}
                          >
                            {option.key}
                          </Text>
                          <Text className="flex-1 text-base font-medium text-glacier-textPrimary">
                            {option.value}
                          </Text>
                          {selected ? (
                            <View className="h-6 w-6 items-center justify-center rounded-full bg-glacier-primary">
                              <Check color={colors.card} size={15} strokeWidth={3} />
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function StateCard({ description, title }: { description: string; title: string }) {
  return (
    <View className="flex-1 px-5 pt-4">
      <View className="rounded-3xl border border-glacier-border bg-glacier-card p-5">
        <Text className="text-base font-extrabold text-glacier-textPrimary">
          {title}
        </Text>
        <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
          {description}
        </Text>
      </View>
    </View>
  );
}
