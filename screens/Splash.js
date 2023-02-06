import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/kskLogo.png")}
        style={{ width: 165, height: 165 }}
      />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e55039",
  },
});
