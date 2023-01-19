import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { db } from "../config/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { StackActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

const RegisterExtScreen = ({ route }) => {
  const auth = getAuth();
  const { name, email, password } = route.params;
  const firstName = name.replace(/ .*/, "");
  const navigation = useNavigation();

  const [fullName, setFullName] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [kskLocation, setKskLocation] = useState("");
  const accountCreationDate = Date().toString();

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .catch((error) => {
        alert(error.message);
      })
      .then(() => {
        setDoc(doc(db, "volunteer", auth.currentUser.uid), {
          Username: name,
          fullName: fullName,
          icNumber: icNumber,
          phoneNumber: phoneNumber,
          nationality: nationality,
          birthdate: birthdate,
          homeAddress: homeAddress,
          emergencyContact: emergencyContact,
          kskLocation: kskLocation,
          accountCreationDate: accountCreationDate,
          profilePic:
            "https://firebasestorage.googleapis.com/v0/b/kskfyp.appspot.com/o/default%2Fuser.png?alt=media&token=394cb43f-30b0-4e40-81fa-0b220d6e121c",
          myActivities: [],
          myForums: [],
        });
      })
      .catch((error) => {
        alert(error.message);
      })
      .then(() => {
        sendEmailVerification(auth.currentUser, {
          url: "https://kskfyp.firebaseapp.com",
          handleCodeInApp: true,
        }).catch((error) => {
          alert(error.message);
        });
      });
  };

  return (
    //passed variables from RegisterScreen
    //then we call the register function etc here
    //then once they login they will go to the unverified stack

    <View style={styles.container}>
      <Text>Hello {firstName}!</Text>
      <Text>You are registering with the email: {email}!</Text>
      <Text>Password: {password}</Text>
      <Text>Please complete the form below to register!</Text>
      <Text>
        Click the back button if you would like to change name email or
        password?
      </Text>

      <View style={styles.inputContainer}>
        <ScrollView>
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={(text) => setFullName(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="IC Number"
            value={icNumber}
            onChangeText={(text) => setIcNumber(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Mobile Number"
            value={phoneNumber}
            onChangeText={(text) => setPhoneNumber(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Nationality"
            value={nationality}
            onChangeText={(text) => setNationality(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Birthdate"
            value={birthdate}
            onChangeText={(text) => setBirthdate(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Home Address"
            value={homeAddress}
            onChangeText={(text) => setHomeAddress(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Emergency Contact"
            value={emergencyContact}
            onChangeText={(text) => setEmergencyContact(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="KSK Location"
            value={kskLocation}
            onChangeText={(text) => setKskLocation(text)}
            style={styles.input}
          />
          <TextInput placeholder={accountCreationDate} style={styles.input} />
        </ScrollView>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.dispatch(StackActions.pop(1));
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (email === "" || password === "" || name === "") {
              Alert.alert("Error!", "Please fill in all fields");
            } else {
              handleSignUp();
            }
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterExtScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: StatusBar.currentHeight,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: "#0782F9",
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
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
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
  inputContainer: {
    flex: 1,
    width: "95%",
  },
});
