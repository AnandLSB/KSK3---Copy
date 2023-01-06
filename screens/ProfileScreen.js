import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getAuth, signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";

const ProfileScreen = () => {
  const navigation = useNavigation();
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

  async function getUser3() {
    onSnapshot(docRef, (doc) => {
      setUser(doc.data());
      if (initializing) setInitializing(false);
    });
  }

  useEffect(() => {
    getUser3();
  }, []);

  const handleDelete = async () => {
    setInitializing(true);
    await deleteDoc(docRef)
      .catch((error) => alert(error.message))
      .then(() => {
        deleteUser(getAuth().currentUser)
          .catch((error) => alert(error.message))
          .then(() => {
            Alert.alert("Account Deleted", "Your account has been deleted");
          });
      });

    deleteUser(getAuth().currentUser)
      .catch((error) => alert(error.message))
      .then(() => {
        Alert.alert("Account Deleted", "Your account has been deleted");
      });
  };

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
          Hello {user?.Username}!
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Account Information</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditProfile", {
              user: user,
            })
          }
        >
          <Text style={{ fontWeight: "bold", paddingRight: 10 }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoList}>
        <ScrollView>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Full Name</Text>
            <View style={styles.infoCont}>
              <Text>{user?.fullName}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Birthdate</Text>
            <View style={styles.infoCont}>
              <Text>{user?.birthdate}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>IC Number</Text>
            <View style={styles.infoCont}>
              <Text>{user?.icNumber}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>House Address</Text>
            <View style={styles.infoCont}>
              <Text>{user?.homeAddress}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Phone Number</Text>
            <View style={styles.infoCont}>
              <Text>{user?.phoneNumber}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Emergency Contact</Text>
            <View style={styles.infoCont}>
              <Text>{user?.emergencyContact}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>KSK Location</Text>
            <View style={styles.infoCont}>
              <Text>{user?.kskLocation}</Text>
            </View>
          </View>
          <View style={{ padding: 5 }}>
            <Text style={{ fontWeight: "bold" }}>Nationality</Text>
            <View style={styles.infoCont}>
              <Text>{user?.nationality}</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("EditPassword")}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Delete Account",
              "Are you sure you want to delete your account? All your data will be lost!",
              [
                {
                  text: "Cancel",
                },
                {
                  text: "OK",
                  onPress: () => handleDelete(),
                },
              ],
              { cancelable: true }
            );
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => signOut(auth)}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Logout</Text>
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
    flex: 1,
    backgroundColor: "#0782F9",
    width: "95%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
    marginLeft: 5,
  },
  buttonOutline: {
    backgroundColor: "white",

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
    flexDirection: "row",
    alignItems: "center",
    padding: 3,
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
