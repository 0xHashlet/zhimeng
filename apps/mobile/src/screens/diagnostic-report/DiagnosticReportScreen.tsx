import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Share2,
  Target,
  Timer,
  TrendingUp
} from "lucide-react-native";
import { colors } from "../../theme/colors";

const summaryStats = [
  { title: "正确率", value: "70%", icon: Target },
  { title: "平均用时", value: "86秒", icon: Timer },
  { title: "超时题", value: "4题", icon: ClipboardList }
] as const;

const weakPoints = ["增长量", "综合分析"] as const;

const trainingItems = [
  {
    title: "增长量公式专项",
    description: "系统梳理公式与速算技巧",
    icon: TrendingUp
  },
  {
    title: "综合分析限时训练",
    description: "提升信息整合与结果速度",
    icon: BookOpen
  },
  {
    title: "正确但超时题复盘",
    description: "找出思路冗余，优化步骤",
    icon: BarChart3
  }
] as const;

export function DiagnosticReportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1">
        <View className="min-h-16 flex-row items-center px-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-lg font-extrabold text-glacier-textPrimary">
              提速诊断报告
            </Text>
            <Text className="mt-1.5 text-xs text-glacier-textSecondary">
              2024/05/15 10:23 · 10 题诊断
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="分享报告"
            className="h-11 w-11 items-center justify-center"
          >
            <Share2 color={colors.textPrimary} size={21} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3.5 px-5 pb-5"
        >
          <View className="flex-row gap-2">
            {summaryStats.map((item) => {
              const Icon = item.icon;

              return (
                <View
                  key={item.title}
                  className="min-h-[102px] flex-1 items-start rounded-[22px] border border-glacier-border bg-glacier-card p-3"
                >
                  <Icon color={colors.primary} size={18} />
                  <Text className="mt-2 text-xs font-semibold text-glacier-textSecondary">
                    {item.title}
                  </Text>
                  <Text className="mt-2 text-[25px] font-extrabold text-glacier-textPrimary">
                    {item.value}
                  </Text>
                </View>
              );
            })}
          </View>

          <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
            <Text className="text-base font-extrabold text-glacier-textPrimary">
              核心结论
            </Text>
            <Text className="mt-3 text-[15px] leading-[25px] text-glacier-textPrimary">
              你不是完全不会，而是增长量题型不稳定，并且综合分析题用时偏长。
            </Text>
          </View>

          <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
            <Text className="text-base font-extrabold text-glacier-textPrimary">
              高频弱项
            </Text>
            <View className="mt-2.5 gap-0.5">
              {weakPoints.map((item, index) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`查看弱项 ${item}`}
                  className="min-h-[46px] flex-row items-center gap-2.5"
                >
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-glacier-soft">
                    <Text className="text-[13px] font-extrabold text-glacier-warning">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[15px] font-semibold text-glacier-textPrimary">
                    {item}
                  </Text>
                  <ChevronRight color={colors.textMuted} size={20} />
                </Pressable>
              ))}
            </View>
          </View>

          <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
            <Text className="text-base font-extrabold text-glacier-textPrimary">
              下一步训练建议
            </Text>
            <View className="mt-3 gap-3.5">
              {trainingItems.map((item) => {
                const Icon = item.icon;

                return (
                  <View key={item.title} className="flex-row items-center gap-3">
                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-glacier-primary">
                      <Icon color={colors.card} size={18} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-bold text-glacier-textPrimary">
                        {item.title}
                      </Text>
                      <Text className="mt-1 text-[13px] leading-[19px] text-glacier-textSecondary">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View className="gap-2.5 bg-glacier-background px-5 pb-4 pt-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="去专项训练"
            className="min-h-[54px] items-center justify-center rounded-2xl bg-glacier-primary"
          >
            <Text className="text-base font-extrabold text-glacier-card">
              去专项训练
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="查看错题复盘"
            className="min-h-[46px] items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
          >
            <Text className="text-[15px] font-extrabold text-glacier-primary">
              查看错题复盘
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
