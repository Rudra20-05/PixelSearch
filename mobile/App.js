/**
 * PixelSearch Mobile — Navigation Root (App.js)
 */

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import GalleryScreen from './src/screens/GalleryScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ label, active }) {
  const icons = { Search: '🔍', Gallery: '🖼️' };
  return (
    <Text style={{ fontSize: 22, opacity: active ? 1 : 0.4 }}>
      {icons[label]}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0f1a',
          borderTopColor: '#1e2a4a',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          color: '#64748b',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#475569',
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} active={focused} />
        ),
      })}
    >
      <Tab.Screen name="Search" component={HomeScreen} />
      <Tab.Screen name="Gallery" component={GalleryScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0f" />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#3b82f6',
            background: '#0a0a0f',
            card: '#0d0f1a',
            text: '#ffffff',
            border: '#1e2a4a',
            notification: '#3b82f6',
          },
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
