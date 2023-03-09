import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { getAuth } from "firebase/auth";
import React, { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { db } from "../config/firebase";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const auth = getAuth();
  const navigation = useNavigation();
  var validator = require("email-validator");

  const checkUsername = async () => {
    const q = query(collection(db, "volunteer"), where("Username", "==", name));

    await getDocs(q).then((snapshot) => {
      if (snapshot.empty) {
        navigation.navigate("RegisterExt", {
          name: name,
          email: email,
          password: password,
        });
      } else {
        Alert.alert("Username is taken!", "Please choose another username");
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Image
          source={require("../assets/kskLogo.png")}
          style={{ width: 165, height: 165 }}
        />
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 17 }}>
          Kechara Soup Kitchen
        </Text>
        <Text style={{ color: "white", fontWeight: "normal" }}>
          Register as a Volunteer at Kechara Soup Kitchen
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Username"
          value={name}
          onChangeText={(text) => setName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          placeholder="Confirm Password"
          value={passwordConf}
          onChangeText={(text) => setPasswordConf(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            if (
              email === "" ||
              password === "" ||
              name === "" ||
              passwordConf === ""
            ) {
              Alert.alert("Error!", "Please fill in all fields");
            } else if (password !== passwordConf) {
              Alert.alert("Error!", "Passwords do not match");
            } else if (!validator.validate(email)) {
              Alert.alert("Error!", "Please enter a valid email address");
            } else if (password.length < 6) {
              Alert.alert("Error!", "Password must be at least 6 characters");
            } else {
              checkUsername();
            }
          }}
          style={[styles.button]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e55039",
  },
  inputContainer: {
    width: "80%",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  buttonContainer: {
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#F9E7E8",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "500",
    fontSize: 16,
  },
});
