import { StatusBar } from "react-native";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import Test from "../screens/test";

import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import JoinedForumsScreen from "../screens/JoinedForumsScreen";
import ForumScreen from "../screens/ForumScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import EditPasswordScreen from "../screens/EditPasswordScreen";
import AllActivitiesScreen from "../screens/AllActivitiesScreen";
import MyActivitiesScreen from "../screens/MyActivitiesScreen";
import AllForumsScreen from "../screens/AllForumsScreen";
import CreatedForumsScreen from "../screens/CreatedForumsScreen";
import BeneFormScreen from "../screens/BeneFormScreen";
import ScanScreen from "../screens/ScanScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const TabTop = createMaterialTopTabNavigator();

function TabsTop() {
  return (
    <TabTop.Navigator>
      <TabTop.Screen name="My Profile" component={ProfileScreen} />
      <TabTop.Screen name="My Activities" component={MyActivitiesScreen} />
      <TabTop.Screen name="My Forums" component={CreatedForumsScreen} />
    </TabTop.Navigator>
  );
}

function TabsTopForum() {
  return (
    <TabTop.Navigator>
      <TabTop.Screen name="Joined Forums" component={JoinedForumsScreen} />
      <TabTop.Screen name="Discover" component={AllForumsScreen} />
    </TabTop.Navigator>
  );
}

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Forum"
        component={TabsTopForum}
        options={{
          headerTitle: "",
          headerStyle: {
            height: StatusBar.currentHeight,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={TabsTop}
        options={{
          headerTitle: "",
          headerStyle: {
            height: StatusBar.currentHeight,
          },
        }}
      />
    </Tab.Navigator>
  );
}

const VerifiedStack = () => {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen
          name="Tabs"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name={"EditProfile"} component={EditProfileScreen} />
        <Stack.Screen name={"EditPassword"} component={EditPasswordScreen} />
        <Stack.Screen name={"AllActivities"} component={AllActivitiesScreen} />
        <Stack.Screen name={"ActivityDetails"} component={Test} />
        <Stack.Screen name={"ForumDetails"} component={ForumScreen} />
        <Stack.Screen name={"BeneForm"} component={BeneFormScreen} />
        <Stack.Screen name={"ScanCode"} component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default VerifiedStack;
