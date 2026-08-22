import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import HomeFeedScreen from '../screens/Home/HomeFeedScreen';
import CreatePostScreen from '../screens/Faculty/CreatePostScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import StudentProfileViewScreen from '../screens/Student/StudentProfileViewScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import NotificationsScreen from '../screens/Shared/NotificationsScreen';
import ChatListScreen from '../screens/Chat/ChatListScreen';
import ChatWindowScreen from '../screens/Chat/ChatWindowScreen';
import NewChatScreen from '../screens/Chat/NewChatScreen';
import ProjectsScreen from '../screens/Student/ProjectsScreen';
import InternshipsScreen from '../screens/Student/InternshipsScreen';
import CompetitionsScreen from '../screens/Student/CompetitionsScreen';
import CertificatesScreen from '../screens/Student/CertificatesScreen';
import SkillsScreen from '../screens/Student/SkillsScreen';
import BrowseOpportunitiesScreen from '../screens/Student/BrowseOpportunitiesScreen';
import PostOpportunitiesScreen from '../screens/Faculty/PostOpportunitiesScreen';
import SmartSearchScreen from '../screens/Faculty/SmartSearchScreen';
import VerifyStudentsScreen from '../screens/Faculty/VerifyStudentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}

function SearchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="StudentProfileView" component={StudentProfileViewScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Projects" component={ProjectsScreen} />
      <Stack.Screen name="Internships" component={InternshipsScreen} />
      <Stack.Screen name="Competitions" component={CompetitionsScreen} />
      <Stack.Screen name="Certificates" component={CertificatesScreen} />
      <Stack.Screen name="Skills" component={SkillsScreen} />
      <Stack.Screen name="BrowseOpportunities" component={BrowseOpportunitiesScreen} />
      <Stack.Screen name="PostOpportunities" component={PostOpportunitiesScreen} />
      <Stack.Screen name="SmartSearch" component={SmartSearchScreen} />
      <Stack.Screen name="VerifyStudents" component={VerifyStudentsScreen} />
      <Stack.Screen name="StudentProfileView" component={StudentProfileViewScreen} />
    </Stack.Navigator>
  );
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatListMain" component={ChatListScreen} />
      <Stack.Screen name="ChatWindow" component={ChatWindowScreen} />
      <Stack.Screen name="NewChat" component={NewChatScreen} />
    </Stack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          paddingTop: 4,
          height: 58,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            HomeTab: 'home-outline',
            SearchTab: 'search-outline',
            ChatTab: 'chatbubbles-outline',
            NotificationsTab: 'notifications-outline',
            ProfileTab: 'person-outline',
          };
          return <Ionicons name={icons[route.name] || 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ tabBarLabel: 'Search' }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{ tabBarLabel: 'Messages' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsScreen} options={{ tabBarLabel: 'Alerts' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}
