import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { StackActions } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { SelectList } from "react-native-dropdown-select-list";

const RegisterExtScreen = ({ route }) => {
  const auth = getAuth();
  const { name, email, password } = route.params;
  const username = name.replace(/ .*/, "");
  const navigation = useNavigation();

  const [fullName, setFullName] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [homeAddress, setHomeAddress] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [kskLocation, setKskLocation] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [date, setDate] = useState("Birthdate");

  const nationalityData = [
    { key: "1", value: "Malaysian" },
    { key: "2", value: "Non-Malaysian" },
  ];

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    console.log(
      "A date has been picked: ",
      new Date(date.setHours(0, 0, 0, 0))
    );
    setBirthdate(new Date(date.setHours(0, 0, 0, 0)));
    setDate(format(new Date(date.setHours(0, 0, 0, 0)), "dd MMM yyyy"));
    hideDatePicker();
  };

  /*
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
          myCompleteAct: [],
          mySession: null,
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
  */
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert("That email address is already in use!");
      } else if (error.code === "auth/invalid-email") {
        alert("That email address is invalid!");
      } else {
        alert(error.message);
      }

      return;
    }

    await setDoc(doc(db, "volunteer", auth.currentUser.uid), {
      Username: name,
      fullName: fullName,
      icNumber: icNumber,
      email: email.toLowerCase(),
      phoneNumber: phoneNumber,
      nationality: nationality,
      birthdate: Timestamp.fromDate(birthdate),
      homeAddress: homeAddress,
      emergencyContact: emergencyContact,
      kskLocation: kskLocation,
      accountCreationDate: serverTimestamp(),
      profilePic:
        "https://firebasestorage.googleapis.com/v0/b/kskfyp.appspot.com/o/default%2Fuser.png?alt=media&token=394cb43f-30b0-4e40-81fa-0b220d6e121c",
      myActivities: [],
      myForums: [],
      myCompleteAct: [],
      mySession: null,
    }).catch((error) => {
      alert(error.message);
    });

    await sendEmailVerification(auth.currentUser, {
      url: "https://kskfyp.firebaseapp.com",
      handleCodeInApp: true,
    }).catch((error) => {
      alert(error.message);
    });
  };

  console.log("Birth", birthdate);

  return (
    <View style={styles.container}>
      <View style={{ alignItems: "center", padding: 10 }}>
        <Text style={[styles.text, { fontSize: 16, fontWeight: "700" }]}>
          Hello {username}!
        </Text>
        <Text style={styles.text}>
          You are registering with the email:{" "}
          <Text style={{ fontWeight: "bold" }}>{email}</Text>!
        </Text>

        <Text style={[styles.text, { marginTop: 10, textAlign: "center" }]}>
          Please complete the volunteer form below to register or click the back
          button below if you would like make changes to your name, email or
          password!
        </Text>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
      />

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

          <SelectList
            placeholder={<Text style={{ color: "#808080" }}>Nationality</Text>}
            setSelected={(val) => {
              setNationality(val);
            }}
            search={false}
            data={nationalityData}
            save="value"
            boxStyles={{ backgroundColor: "white", marginTop: 5 }}
            dropdownStyles={{ backgroundColor: "white" }}
          />

          <View style={[styles.section, styles.input, { paddingVertical: 15 }]}>
            <Text style={{ color: "#808080" }}>{date}</Text>
            <TouchableOpacity onPress={showDatePicker}>
              <Text>Date</Text>
            </TouchableOpacity>
          </View>

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

          <SelectList
            placeholder={<Text style={{ color: "#808080" }}>KSK Location</Text>}
            setSelected={(val) => {
              setKskLocation(val);
            }}
            search={false}
            data={[{ key: "1", value: "Selangor" }]}
            save="value"
            boxStyles={{ backgroundColor: "white", marginTop: 5 }}
            dropdownStyles={{ backgroundColor: "white" }}
          />
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
    backgroundColor: "#e55039",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "95%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
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
    backgroundColor: "#F9E7E8",
    marginTop: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "black",
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
  text: {
    color: "white",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15,
    marginTop: 20,
  },
});
