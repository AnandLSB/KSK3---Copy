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
import {
  getAuth,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getStorage, getDownloadURL } from "firebase/storage";
import { uuidv4 } from "@firebase/util";
import Dialog from "react-native-dialog";
import messaging from "@react-native-firebase/messaging";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [user, setUser] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const docRef = doc(db, "volunteer", auth.currentUser?.uid);
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const credential = EmailAuthProvider.credential(
    auth.currentUser.email,
    password
  );

  async function getUser() {
    onSnapshot(docRef, (doc) => {
      setUser(doc.data());
      if (initializing) setInitializing(false);
    });
  }

  useEffect(() => {
    getUser();
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

  const reauthenticateUser = () => {
    reauthenticateWithCredential(auth.currentUser, credential)
      .catch(() => {
        Alert.alert("Incorrect Password", "Please try again.");
      })
      .then(() => {
        handleDelete();
      });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    _handleImagePicked(result);
  };

  const _handleImagePicked = async (result) => {
    try {
      setUploading(true);

      if (!result.canceled) {
        await uploadImageAsync(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  async function uploadImageAsync(uri) {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const fileRef = ref(getStorage(), "profilePictures/" + uuidv4());
    await uploadBytes(fileRef, blob).then(() => {
      Alert.alert("Success", "Your profile picture has been updated");
    });

    blob.close();

    await updateDoc(docRef, {
      profilePic: await getDownloadURL(fileRef),
    }).catch((error) => {
      alert("Error updating document: ", error);
    });
  }

  const signOutUser = () => {
    const userRef = doc(db, "volunteer", auth.currentUser.uid);

    getDoc(userRef)
      .then((userDoc) => {
        if (userDoc.data().myForums.length > 0) {
          userDoc.get("myForums").forEach((forumItem) => {
            messaging().unsubscribeFromTopic(forumItem);
            console.log("Unsubscribed from " + forumItem);
          });
        }
      })
      .then(() => signOut(auth));
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Dialog.Container visible={visible}>
          <Dialog.Title>Please re-enter your password to delete</Dialog.Title>
          <Dialog.Input
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry={true}
          />
          <Dialog.Button label="Cancel" onPress={() => setVisible(false)} />
          <Dialog.Button
            label="Delete"
            onPress={() => {
              setInitializing(true);
              setVisible(false);
              reauthenticateUser();
            }}
          />
        </Dialog.Container>
      </View>
      <TouchableOpacity
        onPress={() => {
          pickImage();
        }}
        style={styles.imageContainer}
      >
        <Image style={styles.userImg} source={{ uri: user?.profilePic }} />
      </TouchableOpacity>

      <View style={styles.greetingCont}>
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          Hello {user?.Username}!
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Volunteer Information</Text>
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
          <Text style={styles.buttonOutlineText}>Change Password/Email</Text>
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
                  onPress: () => setVisible(true),
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
          onPress={() => signOutUser()}
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
