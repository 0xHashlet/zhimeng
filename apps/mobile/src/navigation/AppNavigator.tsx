import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Home,
  RotateCcw
} from "lucide-react-native";
import { DashboardScreen } from "../screens/dashboard/DashboardScreen";
import { DiagnosticIntroScreen } from "../screens/diagnostic-intro/DiagnosticIntroScreen";
import { DiagnosticReportScreen } from "../screens/diagnostic-report/DiagnosticReportScreen";
import { DiagnosticTestScreen } from "../screens/diagnostic-test/DiagnosticTestScreen";
import { WrongReviewScreen } from "../screens/wrong-review/WrongReviewScreen";
import { colors } from "../theme/colors";

export type RootTabParamList = {
  Dashboard: undefined;
  DiagnosticIntro: undefined;
  DiagnosticTest: undefined;
  DiagnosticReport: undefined;
  WrongReview: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
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
          tabBarIcon: ({ color, size }) => (
            <ClipboardList color={color} size={size} />
          )
        }}
      />
      <Tab.Screen
        name="DiagnosticTest"
        component={DiagnosticTestScreen}
        options={{
          tabBarLabel: "做题",
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size} />
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
