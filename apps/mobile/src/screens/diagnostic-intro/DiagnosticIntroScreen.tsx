import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, Clock3 } from "lucide-react-native";
import type { RootStackParamList } from "../../navigation/AppNavigator";
import { colors } from "../../theme/colors";

const introItems = [
  "覆盖增长量、基期量、比重、平均数、综合分析",
  "记录每题用时",
  "做错后选择错因",
  "完成后生成提速报告"
] as const;

export function DiagnosticIntroScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-glacier-background">
      <View className="flex-1 px-[22px] pb-7 pt-11">
        <View className="mb-7 items-center">
          <Text className="text-center text-[27px] font-extrabold leading-[34px] text-glacier-textPrimary">
            10 题诊断测试
          </Text>
          <Text className="mt-2.5 text-center text-sm leading-[22px] text-glacier-textSecondary">
            通过 10 题诊断，精准定位提速关键
          </Text>
        </View>

        <View className="flex-1 rounded-[28px] border border-glacier-border bg-glacier-card px-6 pb-6 pt-7 shadow-sm">
          {introItems.map((item) => (
            <View key={item} className="min-h-[52px] flex-row items-center gap-3.5">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-glacier-primary">
                <Check color={colors.card} size={16} strokeWidth={3} />
              </View>
              <Text className="flex-1 text-base font-semibold leading-6 text-glacier-textPrimary">
                {item}
              </Text>
            </View>
          ))}

          <View className="mt-auto flex-row items-center justify-center gap-2">
            <Clock3 color={colors.textMuted} size={18} />
            <Text className="text-[15px] font-medium text-glacier-textPrimary">
              预计耗时 12 分钟
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="开始测试"
          className="mt-6 min-h-[58px] items-center justify-center rounded-2xl bg-glacier-primary"
          onPress={() => navigation.navigate("DiagnosticTest")}
        >
          <Text className="text-lg font-bold text-glacier-card">开始测试</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
