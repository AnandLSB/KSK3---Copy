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
        var checkInTime;
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
              activitySess.volunPartId = volunPartId;

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
      checkOutTime: serverTimestamp(),
    }).then(() => {
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

  //TODO: Add ternary operator based on whether the user has a session or not
  //TODO: Add ternary operator to display beneficiary form button if the category = food bank
  return (
    <View>
      <Card>
        <View>
          <Text>{mySession.id}</Text>
          <Text>{mySession.activityName}</Text>
          <Text>{mySession.checkInTime}</Text>
          <Text>{mySession.volunPartId}</Text>
        </View>
        <TouchableOpacity onPress={() => registerCheckOut()}>
          <Text>Check Out</Text>
        </TouchableOpacity>
      </Card>
    </View>
  );
};

export default MySession;

const styles = StyleSheet.create({});
