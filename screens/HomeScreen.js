import { useNavigation } from "@react-navigation/core";
import { getAuth, signOut } from "firebase/auth";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthentication } from "../useAuth";

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const { user } = useAuthentication(); //kinda redundant as we can just use getAuth().currentUser

  return (
    <View style={styles.container}>
      <Text>Email: {getAuth().currentUser?.email}</Text>
      <Text>{getAuth().currentUser?.metadata.creationTime}</Text>
      <TouchableOpacity onPress={() => signOut(auth)} style={styles.button}>
        <Text style={styles.buttonText}>Sign out</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("Test")}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Test</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
