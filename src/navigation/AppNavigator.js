import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Spacing } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

import DashboardScreen from '../screens/DashboardScreen';
import MapScreen       from '../screens/MapScreen';
import FeedsScreen     from '../screens/FeedsScreen';
import ControlScreen   from '../screens/ControlScreen';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'grid',           iconActive: 'grid'        },
  { name: 'Map',       component: MapScreen,        icon: 'map-outline',    iconActive: 'map'         },
  { name: 'Feeds',     component: FeedsScreen,      icon: 'videocam-outline', iconActive: 'videocam'  },
  { name: 'Control',   component: ControlScreen,    icon: 'game-controller-outline', iconActive: 'game-controller' },
];

export default function AppNavigator() {
  const { colors, isDarkMode } = useTheme();

  const styles = getStyles(colors);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor:   colors.cyan,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ focused, color, size }) => {
            const tab = TABS.find(t => t.name === route.name);
            const iconName = focused ? tab.iconActive : tab.icon;
            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        {TABS.map(tab => (
          <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
        ))}
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const getStyles = (colors) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg0,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
  },
});
