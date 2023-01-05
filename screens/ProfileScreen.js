import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

import Splash from "../screens/Splash";

const ProfileScreen = () => {
  const auth = getAuth();
  const [user, setUser] = useState([]);
  const [userArr, setUserArr] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const docRef = doc(db, "volunteer", auth.currentUser?.uid);

  async function getUser() {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUser(docSnap.data());
      setUserArr([docSnap.data()]);
      if (initializing) setInitializing(false);
    } else {
      console.log("No such document!");
    }
  }

  async function getUser2() {
    onSnapshot(docRef, (doc) => {
      const users = [];

      const {
        Username,
        accountCreationDate,
        birthdate,
        emergencyContact,
        fullName,
        homeAddress,
        icNumber,
        kskLocation,
        nationality,
        phoneNumber,
      } = doc.data();

      users.push({
        Username,
        accountCreationDate,
        birthdate,
        emergencyContact,
        fullName,
        homeAddress,
        icNumber,
        kskLocation,
        nationality,
        phoneNumber,
      });
      setUser(users);
    });

    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    getUser();
  }, []);
  /*
  const userList = Object.keys(user).map((key) => {
    //{ key: key, value: user[key] };
    return (
      <Text key={key}>
        {key} : {user[key]}
      </Text>
    );
  });
  */

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.userImg}
          source={require("../assets/favicon.png")}
        />
      </View>

      <View style={styles.greetingCont}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Hello {user.Username}!
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Account Information</Text>
        <TouchableOpacity>
          <Text style={{ fontWeight: "bold", paddingRight: 10 }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoList}>
        <ScrollView>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Full Name</Text>
            <View style={styles.infoCont}>
              <Text>{user.fullName}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Birthdate</Text>
            <View style={styles.infoCont}>
              <Text>{user.birthdate}</Text>
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
            <View style={styles.infoCont}>
              <Text>{user.homeAddress}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Phone Number</Text>
            <View style={styles.infoCont}>
              <Text>{user.phoneNumber}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Emergency Contact</Text>
            <View style={styles.infoCont}>
              <Text>{user.emergencyContact}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>KSK Location</Text>
            <View style={styles.infoCont}>
              <Text>{user.kskLocation}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Nationality</Text>
            <View style={styles.infoCont}>
              <Text>{user.nationality}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "100%",
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
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  greetingCont: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  infoList: {
    flex: 1,
    justifyContent: "flex-start",
    paddingLeft: 5,
    paddingRight: 5,
  },
  infoCont: {
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    padding: 3,
  },
  userImg: {
    height: 100,
    width: 100,
    borderRadius: 70,
    borderColor: "black",
    borderWidth: 1,
  },
});
