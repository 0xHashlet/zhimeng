import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Brain, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react-native";
import { colors } from "../../theme/colors";

const tabs = ["待复盘", "慢题", "仍不理解"] as const;

const suggestions = [
  "此题考查增长量计算，应用公式：增长量 = 现期量 - 基期量。",
  "你可能直接套用基期量 × 增长率估算，忽略更准确的计算方法。",
  "建议：先判断是否需要精确值，再选择合适的计算路径。"
] as const;

export function WrongReviewScreen() {
  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1">
        <View className="h-[58px] flex-row items-center justify-between px-3.5">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            className="h-11 w-11 items-center justify-center"
          >
            <ChevronLeft color={colors.textPrimary} size={24} />
          </Pressable>
          <Text className="text-lg font-extrabold text-glacier-textPrimary">
            错题复盘
          </Text>
          <View className="h-11 w-11" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-3.5 px-5 pb-6"
        >
          <View className="flex-row rounded-2xl bg-glacier-cardSoft p-1">
            {tabs.map((tab) => {
              const active = tab === "待复盘";

              return (
                <Pressable
                  key={tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  className={[
                    "min-h-9 flex-1 items-center justify-center rounded-[9px]",
                    active ? "border border-glacier-primary bg-glacier-card" : ""
                  ].join(" ")}
                >
                  <Text
                    className={[
                      "text-sm font-bold",
                      active ? "text-glacier-primary" : "text-glacier-textSecondary"
                    ].join(" ")}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-[13px] font-semibold text-glacier-textSecondary">
            共 4 题
          </Text>

          <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
            <View className="mb-3.5 flex-row items-center justify-between">
              <View className="rounded-[10px] bg-glacier-soft px-2.5 py-1.5">
                <Text className="text-[13px] font-extrabold text-glacier-primary">
                  增长量
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-glacier-textSecondary">
                第 3 题
              </Text>
            </View>

            <InfoRow label="你的答案" value="A" />
            <InfoRow label="正确答案" value="C" highlight />
            <InfoRow label="用时" value="112秒" />
            <InfoRow label="推荐用时" value="75秒" />
            <InfoRow label="错因" value="公式没想起来" danger />

            <View className="mt-4 flex-row gap-2.5">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="查看解析"
                className="min-h-[46px] flex-1 items-center justify-center rounded-2xl border border-glacier-border bg-glacier-card"
              >
                <Text className="text-sm font-extrabold text-glacier-primary">
                  查看解析
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="标记已掌握"
                className="min-h-[46px] flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-glacier-primary"
              >
                <CheckCircle2 color={colors.card} size={18} />
                <Text className="text-sm font-extrabold text-glacier-card">
                  标记已掌握
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="rounded-3xl border border-glacier-border bg-glacier-card p-4">
            <View className="flex-row items-center gap-2.5">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-glacier-cardSoft">
                <Brain color={colors.primary} size={20} />
              </View>
              <Text className="text-base font-extrabold text-glacier-textPrimary">
                AI 复盘建议
              </Text>
            </View>

            <View className="mt-3.5 gap-2.5">
              {suggestions.map((item) => (
                <View key={item} className="flex-row gap-2">
                  <Text className="text-[15px] leading-[23px] text-glacier-textPrimary">
                    •
                  </Text>
                  <Text className="flex-1 text-sm leading-[23px] text-glacier-textPrimary">
                    {item}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-[18px] flex-row items-center justify-center gap-4">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="上一条建议"
                className="h-[34px] w-[34px] items-center justify-center rounded-full bg-glacier-cardSoft"
              >
                <ChevronLeft color={colors.textMuted} size={20} />
              </Pressable>
              <Text className="text-[15px] font-bold text-glacier-textPrimary">
                1 / 4
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="下一条建议"
                className="h-[34px] w-[34px] items-center justify-center rounded-full bg-glacier-cardSoft"
              >
                <ChevronRight color={colors.textPrimary} size={20} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  danger,
  highlight,
  label,
  value
}: {
  danger?: boolean;
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <View className="min-h-10 flex-row items-center justify-between border-b border-glacier-border">
      <Text className="text-sm font-medium text-glacier-textPrimary">{label}</Text>
      <Text
        className={[
          "text-[15px] font-extrabold",
          highlight
            ? "text-glacier-primary"
            : danger
              ? "text-glacier-error"
              : "text-glacier-textPrimary"
        ].join(" ")}
      >
        {value}
      </Text>
    </View>
  );
}
