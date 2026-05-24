import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { BarChart3, ClipboardList, Home, RotateCcw } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { DiagnosticIntroScreen } from "../screens/diagnostic-intro/DiagnosticIntroScreen";
import { DiagnosticReportScreen } from "../screens/diagnostic-report/DiagnosticReportScreen";
import { DiagnosticTestScreen } from "../screens/diagnostic-test/DiagnosticTestScreen";
import { WrongReviewScreen } from "../screens/wrong-review/WrongReviewScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  MainTabs: undefined;
  DiagnosticTest: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  DiagnosticIntro: undefined;
  DiagnosticReport: undefined;
  WrongReview: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabsNavigator} />
      <Stack.Screen name="DiagnosticTest" component={DiagnosticTestScreen} />
    </Stack.Navigator>
  );
}

function MainTabsNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 18);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 62 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8
        },
        tabBarLabelStyle: {
          fontSize: 12
        }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "首页",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="DiagnosticIntro"
        component={DiagnosticIntroScreen}
        options={{
          tabBarLabel: "诊断",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="DiagnosticReport"
        component={DiagnosticReportScreen}
        options={{
          tabBarLabel: "报告",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />
        }}
      />
      <Tab.Screen
        name="WrongReview"
        component={WrongReviewScreen}
        options={{
          tabBarLabel: "错题",
          tabBarIcon: ({ color, size }) => <RotateCcw color={color} size={size} />
        }}
      />
    </Tab.Navigator>
  );
}
