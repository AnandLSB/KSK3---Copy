import { StyleSheet, Text, View, Button, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { BarCodeScanner } from "expo-barcode-scanner";
import {
  collection,
  doc,
  getDoc,
  query,
  updateDoc,
  where,
  getDocs,
  serverTimestamp,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";

const ScanScreen = ({ route }) => {
  const activityId = route.params.activityId;
  const auth = getAuth();
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(data);
    console.log("Activity ID: " + activityId);
    if (data === activityId) {
      console.log("Correct QR code");
      registerCheckIn();
    } else {
      //Invalid QR code for the respective activity
      Alert.alert("Invalid QR code for this activity!");
    }
  };

  const registerCheckIn = async () => {
    const volunPartRef = collection(db, "volunteerParticipation");
    const q = query(
      volunPartRef,
      where("activityId", "==", activityId),
      where("volunteerId", "==", auth.currentUser.uid)
    );
    var volunPartId;

    //Running query to get the respective volunteerParticipation document
    await getDocs(q)
      .then((docColl) => {
        docColl.forEach((docPart) => {
          const docRef = doc(db, "volunteerParticipation", docPart.id);
          volunPartId = docPart.id;

          //Updating timestamp for the check-in time
          updateDoc(docRef, {
            checkInTime: serverTimestamp(),
          });
        });
      })
      .then(() => {
        updateDoc(userRef, {
          myActivities: arrayRemove(activityId),
          mySession: activityId,
        });
      })
      .catch((error) => {
        console.error("Error updating document: ", error);
      })
      .then(() => {
        navigation.navigate("PostScan", {
          activityId: activityId,
          volunPartId: volunPartId,
          status: "checkIn",
        });
      });
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingBottom: 40 }}>
        <Text
          style={{
            color: "white",
            fontWeight: "500",
            textAlign: "center",
            fontSize: 16,
          }}
        >
          Scan the QR code for the respective Kechara Soup Kitchen Volunteer
          Activity!
        </Text>
      </View>

      <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={{ height: "60%", width: "100%" }}
      />
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "black",
  },
});
