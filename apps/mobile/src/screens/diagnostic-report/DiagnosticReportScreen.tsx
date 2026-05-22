import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
          <View style={styles.titleBlock}>
            <Text style={styles.title}>提速诊断报告</Text>
            <Text style={styles.reportTime}>2024/05/15 10:23 · 10 题诊断</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="分享报告"
            style={styles.iconButton}
          >
            <Share2 color={colors.text} size={21} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.summaryGrid}>
            {summaryStats.map((item) => {
              const Icon = item.icon;

              return (
                <View key={item.title} style={styles.summaryCard}>
                  <Icon color={colors.primary} size={18} />
                  <Text style={styles.summaryTitle}>{item.title}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>核心结论</Text>
            <Text style={styles.conclusionText}>
              你不是完全不会，而是增长量题型不稳定，并且综合分析题用时偏长。
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>高频弱项</Text>
            <View style={styles.weakList}>
              {weakPoints.map((item, index) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`查看弱项 ${item}`}
                  style={styles.weakItem}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.weakText}>{item}</Text>
                  <ChevronRight color={colors.textMuted} size={20} />
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>下一步训练建议</Text>
            <View style={styles.trainingList}>
              {trainingItems.map((item) => {
                const Icon = item.icon;

                return (
                  <View key={item.title} style={styles.trainingItem}>
                    <View style={styles.trainingIcon}>
                      <Icon color={colors.surface} size={18} />
                    </View>
                    <View style={styles.trainingText}>
                      <Text style={styles.trainingTitle}>{item.title}</Text>
                      <Text style={styles.trainingDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="去专项训练"
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>去专项训练</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="查看错题复盘"
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>查看错题复盘</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
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
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44
  },
  titleBlock: {
    flex: 1,
    alignItems: "center"
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  reportTime: {
    marginTop: 6,
    color: colors.textSecondary,
    fontSize: 12
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8
  },
  summaryCard: {
    flex: 1,
    alignItems: "flex-start",
    minHeight: 102,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  summaryTitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600"
  },
  summaryValue: {
    marginTop: 8,
    color: colors.text,
    fontSize: 25,
    fontWeight: "800"
  },
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800"
  },
  conclusionText: {
    marginTop: 12,
    color: colors.text,
    fontSize: 15,
    lineHeight: 25
  },
  weakList: {
    marginTop: 10,
    gap: 2
  },
  weakItem: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  rankBadge: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.cyanSoft
  },
  rankText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: "800"
  },
  weakText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600"
  },
  trainingList: {
    marginTop: 12,
    gap: 14
  },
  trainingItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  trainingIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary
  },
  trainingText: {
    flex: 1
  },
  trainingTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700"
  },
  trainingDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19
  },
  footer: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.primary
  },
  primaryButtonText: {
    color: colors.card,
    fontSize: 16,
    fontWeight: "800"
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800"
  }
});
