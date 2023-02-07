import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState, useLayoutEffect } from "react";
import {
  onSnapshot,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import Card from "./card";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { capitalizeWords } from "./activityFunc";

const MySession = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [mySession, setMySession] = useState({});
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (mySess) => {
      setMySession({});

      if (mySess.data().mySession != null) {
        //The user has an active session
        setHasSession(true);

        let actRef = doc(db, "activities", mySess.data().mySession);
        const qPart = query(
          collection(db, "volunteerParticipation"),
          where("activityId", "==", mySess.data().mySession),
          where("volunteerId", "==", auth.currentUser.uid)
        );
        var activitySess = {};
        var dateTime;
        var checkInTime, checkInDate;
        var volunPartId;

        getDocs(qPart)
          .then((querySnapshot) => {
            querySnapshot.forEach((docPart) => {
              volunPartId = docPart.id;
              checkInTime = format(
                docPart
                  .data({ serverTimestamps: "estimate" })
                  .checkInTime.toDate(),
                "p"
              );
              checkInDate = format(
                docPart
                  .data({ serverTimestamps: "estimate" })
                  .checkInTime.toDate(),
                "dd MMM yyyy"
              );
            });
          })
          .then(() => {
            getDoc(actRef).then((actInf) => {
              dateTime = format(
                actInf.data().activityDatetime.toDate(),
                "dd MMM yyyy"
              );

              activitySess = actInf.data();
              activitySess.id = actInf.id;
              activitySess.activityDatetime = dateTime;
              activitySess.checkInTime = checkInTime;
              activitySess.checkInDate = checkInDate;
              activitySess.volunPartId = volunPartId;
              activitySess.activityName = capitalizeWords(
                actInf.data().activityName
              );

              setMySession(activitySess);
            });
          });
      } else {
        //The user does not have an active session
        setHasSession(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const registerCheckOut = async () => {
    const volunPartRef = doc(
      db,
      "volunteerParticipation",
      mySession.volunPartId
    );

    await updateDoc(volunPartRef, {
      //Setting the checkout time
      checkOutTime: serverTimestamp(),
    })
      .then(async () => {
        //Calculating the total hours
        const docSnap = await getDoc(volunPartRef);

        await updateDoc(volunPartRef, {
          totalHours:
            Math.abs(
              docSnap.data().checkOutTime.toDate() -
                docSnap.data().checkInTime.toDate()
            ) / 36e5,
        });
      })
      .then(() => {
        //Transfer the session to the completed activities array
        updateDoc(userRef, {
          mySession: null,
          myCompleteAct: arrayUnion(mySession.id),
        })
          .catch((error) => {
            console.log(error);
          })
          .then(() => {
            setHasSession(false);
            //Navigate to check out screen
            navigation.navigate("PostScan", {
              activityId: mySession.id,
              volunPartId: mySession.volunPartId,
              status: "checkOut",
            });
          });
      });
  };

  return (
    <View>
      {hasSession ? (
        <Card>
          <View>
            <Text style={{ fontWeight: "bold" }}>{mySession.activityName}</Text>
            <Text>Date: {mySession.activityDatetime}</Text>
            <Text>
              Check-in Time: {mySession.checkInDate} at {mySession.checkInTime}
            </Text>
            <Text>Category: {mySession.activityCategory}</Text>
            {mySession.activityCategory == "Food Bank" ? (
              <View style={{ paddingTop: 5, paddingLeft: 95 }}>
                <TouchableOpacity
                  onPress={() => navigation.navigate("BeneForm")}
                >
                  <Text style={styles.buttonOutlineText}>
                    Submit Beneficiary Form
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <View style={styles.buttonCont}>
            <TouchableOpacity onPress={() => registerCheckOut()}>
              <Text style={[styles.buttonOutlineText, { color: "black" }]}>
                Check Out
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : (
        <Card>
          <Text>No Active Volunteer Session</Text>
        </Card>
      )}
    </View>
  );
};

export default MySession;

const styles = StyleSheet.create({
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonOutlineText: {
    color: "#718093",
    fontWeight: "700",
    fontSize: 14,
  },
});
