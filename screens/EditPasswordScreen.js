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
  updateEmail,
} from "firebase/auth";
import { useNavigation, StackActions } from "@react-navigation/native";

const EditPasswordScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [currPassword, setCurrPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [email, setEmail] = React.useState(auth.currentUser?.email);
  const navigation = useNavigation();
  var validator = require("email-validator");

  const credential = EmailAuthProvider.credential(user.email, currPassword);

  const reauthenticateUser = () => {
    reauthenticateWithCredential(user, credential).catch(() => {
      Alert.alert(
        "Incorrect Current Password",
        "Please Re-enter Current Password"
      );
    });
  };

  const handleUpdatePassword = () => {
    updatePassword(user, newPassword)
      .catch(() => {
        Alert.alert("Error", "Failed to update password");
      })
      .then(() => {
        Alert.alert("Success", "Password updated successfully");
        navigation.dispatch(StackActions.pop(1));
      });
  };

  const handleUpdateEmail = () => {
    updateEmail(user, email)
      .catch(() => {
        Alert.alert("Error", "Failed to update email");
      })
      .then(() => {
        Alert.alert("Success", "Email updated successfully");
        navigation.dispatch(StackActions.pop(1));
      });
  };

  return (
    <View style={styles.container}>
      <View style={{ margin: 10, marginBottom: 40 }}>
        <Text style={{ fontWeight: "500", fontSize: 16, textAlign: "center" }}>
          Edit your account password or email in the fields below!
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={{ padding: 5, fontWeight: "500" }}>Edit Email</Text>
        <TextInput
          placeholder={email}
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <Text style={{ padding: 5, fontWeight: "500" }}>Edit Password</Text>
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
            if (email === "") {
              Alert.alert("Error!", "Please fill in email field");
            } else if (!validator.validate(email)) {
              Alert.alert("Error!", "Please enter a valid email");
            } else if (email === auth.currentUser?.email) {
              Alert.alert("Error!", "Please enter a new email");
            } else {
              handleUpdateEmail();
            }
          }}
        >
          <Text style={styles.buttonOutlineText}>Update Email</Text>
        </TouchableOpacity>
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
              handleUpdatePassword();
            }
          }}
        >
          <Text style={styles.buttonOutlineText}>Update Password</Text>
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
    backgroundColor: "white",
  },
  input: {
    backgroundColor: "#E9ECEF",
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
    marginTop: 10,
    width: "90%",
    marginBottom: 90,
  },
  buttonOutline: {
    backgroundColor: "#E9ECEF",
    marginTop: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "black",
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
  section: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "100%",
    padding: 5,
  },
});
