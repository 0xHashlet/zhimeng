import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BarChart3,
  BookOpenCheck,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LineChart,
  Target,
  Timer,
  TrendingUp
} from "lucide-react-native";
import { colors } from "../../theme/colors";

const metricCards = [
  {
    title: "正确率",
    value: "72%",
    trend: [8, 10, 9, 13, 12, 16, 15],
    type: "line"
  },
  {
    title: "平均用时",
    value: "82秒",
    trend: [7, 8, 7, 10, 9, 12, 13],
    type: "line"
  },
  {
    title: "高频弱项",
    value: "增长量",
    trend: [5, 8, 7, 11, 10, 14, 16],
    type: "bar"
  }
] as const;

const actionItems = [
  {
    title: "开始诊断测试",
    description: "10 题诊断，生成提速报告",
    icon: ClipboardCheck
  },
  {
    title: "专项训练",
    description: "针对弱项，精准提升",
    icon: Target
  },
  {
    title: "错题复盘",
    description: "回顾错题，查漏补缺",
    icon: FileText
  }
] as const;

export function DashboardScreen() {
  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-3.5 px-5 pb-7 pt-5"
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-[25px] font-extrabold leading-8 text-glacier-textPrimary">
              资料分析提速诊断器
            </Text>
            <Text className="mt-2 text-sm leading-[21px] text-glacier-textSecondary">
              不盲刷，先找到你为什么慢、为什么错
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="查看学习数据"
            className="h-11 w-11 items-center justify-center rounded-full border border-glacier-border bg-glacier-card"
          >
            <BarChart3 color={colors.textPrimary} size={22} />
          </Pressable>
        </View>

        <View className="flex-row gap-2">
          {metricCards.map((item) => (
            <View
              key={item.title}
              className="min-h-[116px] flex-1 rounded-[22px] border border-glacier-border bg-glacier-card p-3 shadow-sm"
            >
              <Text className="text-[13px] font-semibold text-glacier-textPrimary">
                {item.title}
              </Text>
              <Text className="mt-2.5 text-[26px] font-extrabold text-glacier-textPrimary">
                {item.value}
              </Text>
              {item.type === "line" ? (
                <MiniLine values={item.trend} />
              ) : (
                <MiniBars values={item.trend} />
              )}
            </View>
          ))}
        </View>

        <View className="flex-row gap-3 rounded-3xl border border-glacier-border bg-glacier-card p-4">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-glacier-cardSoft">
            <LineChart color={colors.primary} size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-glacier-textPrimary">
              今日建议
            </Text>
            <Text className="mt-2 text-sm leading-[22px] text-glacier-textSecondary">
              先完成 10 题诊断，系统会分析你的正确率、平均用时和高频弱项
            </Text>
          </View>
        </View>

        <View className="overflow-hidden rounded-[22px] border border-glacier-border bg-glacier-card">
          {actionItems.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                className="min-h-[72px] flex-row items-center gap-3 border-b border-glacier-border px-3.5"
              >
                <View className="h-10 w-10 items-center justify-center rounded-[10px] bg-glacier-primary">
                  <Icon color={colors.card} size={20} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-glacier-textPrimary">
                    {item.title}
                  </Text>
                  <Text className="mt-1 text-[13px] text-glacier-textSecondary">
                    {item.description}
                  </Text>
                </View>
                <ChevronRight color={colors.textMuted} size={20} />
              </Pressable>
            );
          })}
        </View>

        <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-glacier-textPrimary">
              最近诊断
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="查看全部诊断">
              <Text className="text-[13px] font-semibold text-glacier-textSecondary">
                查看全部
              </Text>
            </Pressable>
          </View>

          <Text className="mt-3.5 text-[13px] leading-5 text-glacier-textSecondary">
            2024/05/15 10:23 完成 10 题诊断
          </Text>
          <View className="mt-3 gap-2">
            <View className="flex-row items-center gap-2">
              <BookOpenCheck color={colors.primary} size={18} />
              <Text className="text-sm font-semibold text-glacier-textPrimary">
                正确率 70%
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Timer color={colors.primary} size={18} />
              <Text className="text-sm font-semibold text-glacier-textPrimary">
                平均用时 86 秒
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <WeakTag label="增长量" />
            <WeakTag label="综合分析" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniLine({ values }: { values: readonly number[] }) {
  return (
    <View
      className="mt-3 h-6 flex-row items-start gap-[3px]"
      accessibilityLabel="趋势上升"
    >
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          className="w-2.5 rounded-full border-t-2 border-glacier-primary"
          style={{
            height: value,
            marginTop: 18 - value
          }}
        />
      ))}
    </View>
  );
}

function MiniBars({ values }: { values: readonly number[] }) {
  return (
    <View
      className="mt-2.5 h-[30px] flex-row items-end gap-[3px]"
      accessibilityLabel="弱项分布柱状图"
    >
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          className="flex-1 rounded-[3px] bg-glacier-primaryLight"
          style={{
            height: value + 4
          }}
        />
      ))}
    </View>
  );
}

function WeakTag({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-glacier-soft px-2.5 py-1.5">
      <TrendingUp color={colors.primary} size={14} />
      <Text className="text-xs font-bold text-glacier-primary">{label}</Text>
    </View>
  );
}
