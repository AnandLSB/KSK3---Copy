import { StatusBar } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import * as RootNavigation from "../RootNavigation";
import { MaterialIcons } from "@expo/vector-icons";

import Test from "../screens/test";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JoinedForumsScreen from "../screens/JoinedForumsScreen";
import ForumScreen from "../screens/ForumScreen"; //Old Screen
import EditProfileScreen from "../screens/EditProfileScreen";
import EditPasswordScreen from "../screens/EditPasswordScreen";
import AllActivitiesScreen from "../screens/AllActivitiesScreen";
import MyActivitiesScreen from "../screens/MyActivitiesScreen";
import AllForumsScreen from "../screens/AllForumsScreen"; //Old Screen
import CreatedForumsScreen from "../screens/CreatedForumsScreen";
import BeneFormScreen from "../screens/BeneFormScreen";
import ScanScreen from "../screens/ScanScreen";
import PostScanScreen from "../screens/PostScanScreen";
import CompletedActivitiesScreen from "../screens/CompletedActivitiesScreen";
import ForumScreen2 from "../screens/ForumScreen2";
import DiscoverForumsScreen from "../screens/DiscoverForumsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TabTop = createMaterialTopTabNavigator();

function TabsTop() {
  return (
    <TabTop.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#e55039",
          paddingTop: 0,
          marginTop: 0,
        },
        tabBarLabelStyle: { color: "white", fontWeight: "500" },
        tabBarIndicatorStyle: { backgroundColor: "white" },
      }}
      style={{ marginTop: 0 }}
    >
      <TabTop.Screen name="My Profile" component={ProfileScreen} />
      <TabTop.Screen name="My Activities" component={MyActivitiesScreen} />
      <TabTop.Screen name="My Forums" component={CreatedForumsScreen} />
    </TabTop.Navigator>
  );
}

function TabsTopForum() {
  return (
    <TabTop.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#e55039",
          paddingTop: 0,
          marginTop: 0,
        },
        tabBarLabelStyle: { color: "white", fontWeight: "500" },
        tabBarIndicatorStyle: { backgroundColor: "white" },
      }}
      style={{ marginTop: 0 }}
    >
      <TabTop.Screen
        name="Joined Forums"
        component={JoinedForumsScreen}
        options={{
          headerShown: false,
        }}
      />
      <TabTop.Screen name="Discover" component={DiscoverForumsScreen} />
    </TabTop.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: "#E9ECEF" },
        tabBarActiveTintColor: "black",
        tabBarLabelStyle: { fontWeight: "500" },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: { color: "white", fontSize: 18 },
          headerStyle: { backgroundColor: "#e55039" },
          tabBarIcon: () => (
            <MaterialIcons name="dashboard" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Forum"
        component={TabsTopForum}
        options={{
          headerShown: false,
          headerTitle: "",
          headerStyle: {
            height: StatusBar.currentHeight,
          },
          tabBarIcon: () => (
            <MaterialIcons name="forum" size={24} color="black" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TabsTop}
        options={{
          headerTitle: "",
          headerShown: false,
          headerStyle: {
            height: StatusBar.currentHeight,
          },
          tabBarIcon: () => (
            <MaterialIcons name="account-circle" size={24} color="black" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const VerifiedStack = () => {
  return (
    <NavigationContainer independent={true} ref={RootNavigation.navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={"EditProfile"}
          component={EditProfileScreen}
          options={{
            headerTitle: "Edit Profile Information",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name={"EditPassword"}
          component={EditPasswordScreen}
          options={{
            headerTitle: "Edit Account Email/Password",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name={"AllActivities"}
          component={AllActivitiesScreen}
          options={{
            headerTitle: "All Available Activities",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen name={"ActivityDetails"} component={Test} />
        <Stack.Screen
          name={"ForumDetails"}
          component={ForumScreen2}
          options={{
            headerTitle: "Forum",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen
          name={"BeneForm"}
          component={BeneFormScreen}
          options={{
            headerTitle: "Submit Beneficiary Form",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
        <Stack.Screen name={"ScanCode"} component={ScanScreen} />
        <Stack.Screen name={"PostScan"} component={PostScanScreen} />
        <Stack.Screen
          name={"CompletedActivities"}
          component={CompletedActivitiesScreen}
          options={{
            headerTitle: "Completed Activities",
            headerTitleAlign: "center",
            headerTitleStyle: { color: "white", fontSize: 18 },
            headerStyle: { backgroundColor: "#e55039" },
            headerTintColor: "white",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default VerifiedStack;
