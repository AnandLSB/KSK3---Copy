import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
import { useNavigation, StackActions } from "@react-navigation/native";
import { format } from "date-fns";

const EditProfileScreen = ({ route }) => {
  const auth = getAuth();
  const docRef = doc(db, "volunteer", auth.currentUser?.uid);
  const user = route.params.user;
  const navigation = useNavigation();

  const [fullName, setFullName] = useState(user.fullName);
  const [homeAddress, setHomeAddress] = useState(user.homeAddress);
  const [emergencyContact, setEmergencyContact] = useState(
    user.emergencyContact
  );
  const [kskLocation, setKskLocation] = useState(user.kskLocation);
  const [nationality, setNationality] = useState(user.nationality);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber);

  const handleUpdate = async () => {
    await updateDoc(docRef, {
      fullName: fullName,
      homeAddress: homeAddress,
      emergencyContact: emergencyContact,
      kskLocation: kskLocation,
      nationality: nationality,
      phoneNumber: phoneNumber,
    }).then(() => {
      Alert.alert("Profile Updated!");
      navigation.dispatch(StackActions.pop(1));
    });
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Full Name</Text>
            <TextInput
              placeholder={user.fullName}
              value={fullName}
              onChangeText={(text) => setFullName(text)}
              style={styles.input}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Birthdate</Text>
            <View style={styles.infoCont}>
              <Text>{format(route.params.birthdate, "dd MMM yyyy")}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>IC Number</Text>
            <View style={styles.infoCont}>
              <Text>{user.icNumber}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>House Address</Text>
            <TextInput
              placeholder={user.homeAddress}
              value={homeAddress}
              onChangeText={(text) => setHomeAddress(text)}
              style={styles.input}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Phone Number</Text>
            <TextInput
              placeholder={user.phoneNumber}
              value={phoneNumber}
              onChangeText={(text) => setPhoneNumber(text)}
              style={styles.input}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Emergency Contact</Text>
            <TextInput
              placeholder={user.emergencyContact}
              value={emergencyContact}
              onChangeText={(text) => setEmergencyContact(text)}
              style={styles.input}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>KSK Location</Text>
            <TextInput
              placeholder={user.kskLocation}
              value={kskLocation}
              onChangeText={(text) => setKskLocation(text)}
              style={styles.input}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Nationality</Text>

            <TextInput
              placeholder={user.nationality}
              value={nationality}
              onChangeText={(text) => setNationality(text)}
              style={styles.input}
            />
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => {
            handleUpdate();
          }}
        >
          <Text style={styles.buttonOutlineText}>Update</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
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
  infoCont: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
});
