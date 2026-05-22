import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react-native";
import { colors } from "../../theme/colors";

const tabs = ["待复盘", "慢题", "仍不理解"] as const;

const suggestions = [
  "此题考查增长量计算，应用公式：增长量 = 现期量 - 基期量。",
  "你可能直接套用基期量 × 增长率估算，忽略更准确的计算方法。",
  "建议：先判断是否需要精确值，再选择合适的计算路径。"
] as const;

export function WrongReviewScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="返回上一页"
            style={styles.iconButton}
          >
            <ChevronLeft color={colors.text} size={24} />
          </Pressable>
          <Text style={styles.title}>错题复盘</Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.tabs}>
            {tabs.map((tab) => {
              const active = tab === "待复盘";

              return (
                <Pressable
                  key={tab}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  style={[styles.tabItem, active ? styles.tabActive : null]}
                >
                  <Text style={[styles.tabText, active ? styles.tabTextActive : null]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.countText}>共 4 题</Text>

          <View style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>增长量</Text>
              </View>
              <Text style={styles.questionIndex}>第 3 题</Text>
            </View>

            <InfoRow label="你的答案" value="A" />
            <InfoRow label="正确答案" value="C" highlight />
            <InfoRow label="用时" value="112秒" />
            <InfoRow label="推荐用时" value="75秒" />
            <InfoRow label="错因" value="公式没想起来" danger />

            <View style={styles.questionActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="查看解析"
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>查看解析</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="标记已掌握"
                style={styles.primaryButton}
              >
                <CheckCircle2 color={colors.surface} size={18} />
                <Text style={styles.primaryButtonText}>标记已掌握</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.aiIcon}>
                <Brain color={colors.primary} size={20} />
              </View>
              <Text style={styles.aiTitle}>AI 复盘建议</Text>
            </View>

            <View style={styles.suggestionList}>
              {suggestions.map((item) => (
                <View key={item} style={styles.suggestionItem}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.suggestionText}>{item}</Text>
                </View>
              ))}
            </View>

            <View style={styles.pager}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="上一条建议"
                style={styles.pagerButton}
              >
                <ChevronLeft color={colors.textMuted} size={20} />
              </Pressable>
              <Text style={styles.pagerText}>1 / 4</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="下一条建议"
                style={styles.pagerButton}
              >
                <ChevronRight color={colors.text} size={20} />
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
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          highlight ? styles.infoHighlight : null,
          danger ? styles.infoDanger : null
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1
  },
  topBar: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14
  },
  tabs: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 12,
    backgroundColor: "#F1F5F9"
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
    borderRadius: 9
  },
  tabActive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#93C5FD"
  },
  tabText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700"
  },
  tabTextActive: {
    color: colors.primary
  },
  countText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  questionCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#DBEAFE"
  },
  tagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "800"
  },
  questionIndex: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600"
  },
  infoRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  infoLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500"
  },
  infoValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  infoHighlight: {
    color: colors.primary
  },
  infoDanger: {
    color: "#EF4444"
  },
  questionActions: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "800"
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 46,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: "800"
  },
  aiCard: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  aiIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF"
  },
  aiTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  suggestionList: {
    marginTop: 14,
    gap: 10
  },
  suggestionItem: {
    flexDirection: "row",
    gap: 8
  },
  bullet: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23
  },
  suggestionText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 23
  },
  pager: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16
  },
  pagerButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F8FAFC"
  },
  pagerText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  }
});
