import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import React from "react";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { useNavigation, StackActions } from "@react-navigation/native";

const EditPasswordScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [currPassword, setCurrPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const navigation = useNavigation();

  const credential = EmailAuthProvider.credential(user.email, currPassword);

  const reauthenticateUser = () => {
    reauthenticateWithCredential(user, credential).catch(() => {
      Alert.alert(
        "Incorrect Current Password",
        "Please Re-enter Current Password"
      );
    });
  };

  const handleUpdate = () => {
    updatePassword(user, newPassword)
      .catch(() => {
        Alert.alert("Error", "Failed to update password");
      })
      .then(() => {
        Alert.alert("Success", "Password updated successfully");
        navigation.dispatch(StackActions.pop(1));
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text>EditPasswordScreen</Text>
        <TextInput
          placeholder="Current Password"
          value={currPassword}
          onChangeText={(text) => setCurrPassword(text)}
          onBlur={() => {
            if (currPassword !== "") {
              reauthenticateUser();
            }
          }}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
          style={styles.input}
          secureTextEntry
        />
        <TextInput
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChangeText={(text) => setConfirmNewPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => {
            if (
              currPassword === "" ||
              newPassword === "" ||
              confirmNewPassword === ""
            ) {
              Alert.alert("Error!", "Please fill in all fields");
            } else if (newPassword !== confirmNewPassword) {
              Alert.alert("Error!", "New passwords do not match");
            } else {
              handleUpdate();
            }
          }}
        >
          <Text style={styles.buttonOutlineText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  inputContainer: {
    width: "90%",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 5,
    width: "90%",
  },
  buttonOutline: {
    backgroundColor: "white",
    marginTop: 5,
    borderColor: "#0782F9",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});
