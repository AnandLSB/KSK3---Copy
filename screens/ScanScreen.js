import { StyleSheet, Text, View, Button } from "react-native";
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";

const ScanScreen = ({ route }) => {
  const activityId = route.params.activityId;
  const auth = getAuth();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getBarCodeScannerPermissions();
  }, []);

  /*
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };
  */

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(data);
    console.log("Activity ID: " + activityId);
    if (data === activityId) {
      console.log("Correct QR code");
      registerCheckIn();
    } else {
      //Invalid QR code for the respective activity
    }
  };

  const registerCheckIn = async () => {
    const volunPartRef = collection(db, "volunteerParticipation");
    const q = query(
      volunPartRef,
      where("activityId", "==", activityId),
      where("volunteerId", "==", auth.currentUser.uid)
    );

    await getDocs(q)
      .then((docColl) => {
        docColl.forEach((docPart) => {
          const docRef = doc(db, "volunteerParticipation", docPart.id);

          updateDoc(docRef, {
            checkInTime: serverTimestamp(),
          });
        });
      })
      .then(() => {
        alert("Check in successful");
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
      <Text>ScanScreen</Text>
      <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
