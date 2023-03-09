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
import { SelectList } from "react-native-dropdown-select-list";

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
  const nationalityData = [
    { key: "1", value: "Malaysian" },
    { key: "2", value: "Non-Malaysian" },
  ];

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
              <Text>{route.params.birthdate}</Text>
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
            <SelectList
              placeholder={
                <Text style={{ color: "#808080" }}>{user.kskLocation}</Text>
              }
              setSelected={(val) => {
                setKskLocation(val);
              }}
              search={false}
              data={[{ key: "1", value: "Selangor" }]}
              save="value"
              boxStyles={{ backgroundColor: "white", marginTop: 5 }}
              dropdownStyles={{ backgroundColor: "white" }}
            />
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Nationality</Text>
            <SelectList
              placeholder={
                <Text style={{ color: "#808080" }}>{user.nationality}</Text>
              }
              setSelected={(val) => {
                setNationality(val);
              }}
              search={false}
              data={nationalityData}
              save="value"
              boxStyles={{ backgroundColor: "white", marginTop: 5 }}
              dropdownStyles={{ backgroundColor: "white" }}
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
    backgroundColor: "white",
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
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
  infoCont: {
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
  },
});
