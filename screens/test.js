import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ref } from "firebase/database";

const test = () => {
  //check if username exists
  const usernameRef = ref(database, "users/" + username);
  usernameRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      //username exists
    } else {
      //username does not exist
    }
  });

  return (
    <View>
      <Text>test</Text>
    </View>
  );
};

export default test;

const styles = StyleSheet.create({});
