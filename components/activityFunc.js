import { Alert } from "react-native";
import { getAuth } from "firebase/auth";
import {
  updateDoc,
  doc,
  arrayUnion,
  query,
  getDocs,
  getDoc,
  where,
  collection,
  documentId,
  arrayRemove,
  increment,
  Timestamp,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import messaging from "@react-native-firebase/messaging";

const auth = getAuth();

const addVolunteerParticipation = async (activityId) => {
  const volunPartRef = collection(db, "volunteerParticipation");

  await addDoc(volunPartRef, {
    volunteerId: auth.currentUser.uid,
    activityId: activityId,
    checkInTime: null,
    checkOutTime: null,
  }).catch((error) => {
    console.error("Error adding document: ", error);
  });
};

async function joinActivity(activityId, item) {
  const collRef = collection(db, "volunteer");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  //check if user has already joined the activity
  const q = query(
    collRef,
    where(documentId(), "==", auth.currentUser.uid),
    where("myActivities", "array-contains", activityId)
  );

  const querySnapshot = await getDocs(q);
  const docSnap = await getDoc(userRef);

  if (docSnap.data().mySession === activityId) {
    Alert.alert("You have an ongoing session for this activity!");
  } else if (!querySnapshot.empty) {
    Alert.alert("You have already joined this activity!");
  } else {
    //User has not already joined the activity
    checkClash(item);
    addVolunteerParticipation(activityId);
  }
}

async function leaveActivity(activityId) {
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const q = query(
    collection(db, "volunteerParticipation"),
    where("activityId", "==", activityId),
    where("volunteerId", "==", auth.currentUser.uid)
  );

  await updateDoc(userRef, {
    //Removing the activity from myActivities array
    myActivities: arrayRemove(activityId),
  })
    .then(async () => {
      const actRef = doc(db, "activities", activityId);
      const docSnap = await getDoc(actRef);

      //Checking if the activity was priorly full status
      if (docSnap.data().activityStatus === "full") {
        await updateDoc(actRef, {
          activityStatus: "active",
          volunteerSlot: increment(+1),
        });
      } else {
        await updateDoc(actRef, {
          volunteerSlot: increment(+1),
        });
      }
    })
    .then(() => {
      //Deleting the respective volunteer participation document
      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          deleteDoc(doc.ref);
        });
      });
    })
    .catch((error) => {
      console.error("Error updating document: ", error);
    })
    .then(() => {
      messaging()
        .unsubscribeFromTopic(activityId)
        .then(() =>
          console.log("Unsubscribed from activity topic: ", activityId)
        )
        .catch((error) =>
          console.log("Error unsubscribing from topic: ", error)
        );
      Alert.alert("You have successfully left the activity!");
    });
}

const updateActivity = async (userRef, activityId) => {
  await updateDoc(userRef, {
    myActivities: arrayUnion(activityId),
  })
    .then(async () => {
      const actRef = doc(db, "activities", activityId);
      const docSnap = await getDoc(actRef);

      if (docSnap.data().volunteerSlot === 1) {
        await updateDoc(actRef, {
          volunteerSlot: increment(-1),
          activityStatus: "full",
        });
      } else {
        await updateDoc(actRef, {
          volunteerSlot: increment(-1),
        });
      }
    })
    .catch((error) => {
      console.error("Error updating document: ", error);
    })
    .then(() => {
      messaging()
        .subscribeToTopic(activityId)
        .then(() => {
          console.log("Subscribed to activity topic: ", activityId);
        })
        .catch((error) => {
          console.log("Error subscribing to topic: ", error);
        });

      Alert.alert("You have successfully joined the activity!");
    });
};

async function checkClash(item) {
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  let requestedDate = Timestamp.fromDate(new Date(item.activityDatetime));

  //retrieve from firebase where user activity date = requested date
  const docSnap = await getDoc(userRef);

  if (docSnap.data().myActivities.length > 0) {
    //the user has pre-existing activities
    for (let i = 0; i < docSnap.data().myActivities.length; i++) {
      const activityRef = doc(db, "activities", docSnap.data().myActivities[i]);
      const activitySnap = await getDoc(activityRef);

      let activityDate = activitySnap.data().activityDatetime;

      if (activityDate.isEqual(requestedDate)) {
        Alert.alert(
          "Clashing Schedules Found!",
          "The " +
            activitySnap.data().activityName +
            " activity is on the same date as the requested activity!"
        );
        break;
      } else if (
        activityDate < requestedDate &&
        activitySnap.data().activityDatetimeEnd > requestedDate
      ) {
        Alert.alert(
          "Clashing Schedules Found!",
          "The " +
            activitySnap.data().activityName +
            " activity takes place at the same time as the requested activity!"
        );
        break;
      } else {
        if (i === docSnap.data().myActivities.length - 1) {
          updateActivity(userRef, item.id);
        }
      }
    }
  } else {
    //the user has no pre-existing activities
    updateActivity(userRef, item.id);
  }
}

const capitalizeWords = (activityName) => {
  return activityName
    .toLowerCase()
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

export { joinActivity, leaveActivity, checkClash, capitalizeWords };
