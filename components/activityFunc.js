import { Alert } from "react-native";
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

const auth = getAuth();
const userRef = doc(db, "volunteer", auth.currentUser.uid);

async function joinActivity(activityId) {
  const collRef = collection(db, "volunteer");

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
        Alert.alert("Activity Joined!");
      })
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  } else {
    Alert.alert("You have already joined this activity!");
  }

  console.log(activityId);
}

async function leaveActivity(activityId) {
  await updateDoc(userRef, {
    myActivities: arrayRemove(activityId),
  })
    .then(() => {
      Alert.alert("Activity Left!");
    })
    .catch((error) => {
      console.error("Error removing document: ", error);
    });

  console.log(activityId);
}

export { joinActivity, leaveActivity };
