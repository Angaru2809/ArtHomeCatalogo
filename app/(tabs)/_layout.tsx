import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={28} color={color} />,
          tabBarStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="catalogo"
        options={{
          title: 'Catálogo',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="donate"
        options={{
          title: 'Contribuye',
          tabBarIcon: ({ color }) => <Ionicons name="heart" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'Sobre Nosotros',
          tabBarIcon: ({ color }) => <Ionicons name="people-circle-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contacto',
          tabBarIcon: ({ color }) => <Ionicons name="headset" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
