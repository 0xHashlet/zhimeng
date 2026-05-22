import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>资料分析提速诊断器</Text>
            <Text style={styles.subtitle}>不盲刷，先找到你为什么慢、为什么错</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="查看学习数据"
            style={styles.headerButton}
          >
            <BarChart3 color={colors.text} size={22} />
          </Pressable>
        </View>

        <View style={styles.metricGrid}>
          {metricCards.map((item) => (
            <View key={item.title} style={styles.metricCard}>
              <Text style={styles.metricTitle}>{item.title}</Text>
              <Text style={styles.metricValue}>{item.value}</Text>
              {item.type === "line" ? (
                <MiniLine values={item.trend} />
              ) : (
                <MiniBars values={item.trend} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.suggestionCard}>
          <View style={styles.suggestionIcon}>
            <LineChart color={colors.primary} size={18} />
          </View>
          <View style={styles.suggestionBody}>
            <Text style={styles.cardTitle}>今日建议</Text>
            <Text style={styles.cardDescription}>
              先完成 10 题诊断，系统会分析你的正确率、平均用时和高频弱项
            </Text>
          </View>
        </View>

        <View style={styles.actionList}>
          {actionItems.map((item) => {
            const Icon = item.icon;

            return (
              <Pressable
                key={item.title}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                style={styles.actionItem}
              >
                <View style={styles.actionIcon}>
                  <Icon color={colors.surface} size={20} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{item.title}</Text>
                  <Text style={styles.actionDescription}>{item.description}</Text>
                </View>
                <ChevronRight color={colors.textMuted} size={20} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.recentCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>最近诊断</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="查看全部诊断">
              <Text style={styles.sectionLink}>查看全部</Text>
            </Pressable>
          </View>

          <Text style={styles.recentDate}>2024/05/15 10:23 完成 10 题诊断</Text>
          <View style={styles.recentStats}>
            <View style={styles.recentStat}>
              <BookOpenCheck color={colors.primary} size={18} />
              <Text style={styles.recentStatText}>正确率 70%</Text>
            </View>
            <View style={styles.recentStat}>
              <Timer color={colors.primary} size={18} />
              <Text style={styles.recentStatText}>平均用时 86 秒</Text>
            </View>
          </View>
          <View style={styles.weakTags}>
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
    <View style={styles.lineChart} accessibilityLabel="趋势上升">
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={[
            styles.lineDot,
            {
              height: value,
              marginTop: 18 - value
            }
          ]}
        />
      ))}
    </View>
  );
}

function MiniBars({ values }: { values: readonly number[] }) {
  return (
    <View style={styles.barChart} accessibilityLabel="弱项分布柱状图">
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={[
            styles.bar,
            {
              height: value + 4
            }
          ]}
        />
      ))}
    </View>
  );
}

function WeakTag({ label }: { label: string }) {
  return (
    <View style={styles.weakTag}>
      <TrendingUp color={colors.primary} size={14} />
      <Text style={styles.weakTagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    gap: 14
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16
  },
  headerText: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "800",
    lineHeight: 32
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21
  },
  headerButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  metricGrid: {
    flexDirection: "row",
    gap: 8
  },
  metricCard: {
    flex: 1,
    minHeight: 116,
    padding: 12,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.textPrimary,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 2
  },
  metricTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600"
  },
  metricValue: {
    marginTop: 10,
    color: colors.text,
    fontSize: 26,
    fontWeight: "800"
  },
  lineChart: {
    height: 24,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 3
  },
  lineDot: {
    width: 10,
    borderTopWidth: 2,
    borderColor: colors.primary,
    borderRadius: 999
  },
  barChart: {
    height: 30,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    backgroundColor: colors.primaryLight
  },
  suggestionCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  suggestionIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardSoft
  },
  suggestionBody: {
    flex: 1
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  cardDescription: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22
  },
  actionList: {
    overflow: "hidden",
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  actionItem: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  actionIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary
  },
  actionText: {
    flex: 1
  },
  actionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  actionDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13
  },
  recentCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700"
  },
  sectionLink: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600"
  },
  recentDate: {
    marginTop: 14,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  },
  recentStats: {
    marginTop: 12,
    gap: 8
  },
  recentStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  recentStatText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600"
  },
  weakTags: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  weakTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.cyanSoft
  },
  weakTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700"
  }
});
