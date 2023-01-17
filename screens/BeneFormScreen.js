import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../config/firebase";
import { useNavigation, StackActions } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const BeneFormScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [noOfFamilyMembers, setNoOfFamilyMembers] = useState("");
  const [remarks, setRemarks] = useState("");

  const handleSave = async () => {
    const beneRef = collection(db, "foodBankBeneficiary");

    const docRef = await addDoc(beneRef, {
      firstName: firstName,
      lastName: lastName,
      category: category,
      houseAddress: houseAddress,
      noOfFamilyMembers: noOfFamilyMembers,
      remarks: remarks,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
    })
      .catch((error) => {
        console.error("Error adding document: ", error);
      })
      .then(() => {
        Alert.alert("Beneficiary Information Successfully Saved!");
        navigation.dispatch(StackActions.pop(1));
      });
  };

  return (
    <View style={styles.container}>
      <Text>Beneficiary Form</Text>
      <View style={styles.inputContainer}>
        <ScrollView>
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={(text) => setFirstName(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={(text) => setLastName(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Category"
            value={category}
            onChangeText={(text) => setCategory(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="House Address"
            value={houseAddress}
            onChangeText={(text) => setHouseAddress(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="No Of Family Members"
            value={noOfFamilyMembers}
            onChangeText={(text) => setNoOfFamilyMembers(text)}
            style={styles.input}
          />
          <TextInput
            placeholder="Remarks"
            value={remarks}
            onChangeText={(text) => setRemarks(text)}
            style={styles.input}
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
            Alert.alert(
              "Are you sure you want to save this information?",
              "Please check if all information is correct, any edit or delete of information would require you to contact the administrator.",
              [
                {
                  text: "Cancel",
                },
                {
                  text: "Yes",
                  onPress: () => {
                    if (
                      firstName == "" ||
                      lastName == "" ||
                      category == "" ||
                      houseAddress == "" ||
                      noOfFamilyMembers == ""
                    ) {
                      Alert.alert("Please fill up all fields");
                    } else {
                      handleSave();
                    }
                  },
                },
              ]
            );
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BeneFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    width: "95%",
    justifyContent: "center",
    alignContent: "center",
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
});
