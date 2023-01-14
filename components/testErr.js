import { View, Text } from "react-native";
import React from "react";
import { getAuth } from "firebase/auth";
import {
  updateDoc,
  doc,
  arrayUnion,
  query,
  getDocs,
  where,
  collection,
  documentId,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../config/firebase";

export async function test() {
  console.log("test");
}

const auth = getAuth();

async function joinActivity(activityId) {
  const collRef = collection(db, "volunteer");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  //check if user has already joined the activity
  const q = query(
    collRef,
    where(documentId(), "==", auth.currentUser.uid),
    where("myActivities", "array-contains", activityId)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    await updateDoc(userRef, {
      myActivities: arrayUnion(activityId),
    })
      .then(() => {
        updateDoc(doc(db, "activities", activityId), {
          volunteerSlot: increment(-1),
        })
          .catch((error) => {
            console.error("Error updating document: ", error);
          })
          .then(() => {
            Alert.alert("You have successfully joined the activity!");
          });
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  } else {
    Alert.alert("You have already joined this activity!");
  }
}
