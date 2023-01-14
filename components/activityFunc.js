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
} from "firebase/firestore";
import { db } from "../config/firebase";

const auth = getAuth();

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

  if (querySnapshot.empty) {
    //user has not already joined the activity
    checkClash(item);
  } else {
    //user has already joined the activity
    Alert.alert("You have already joined this activity!");
  }
}

async function leaveActivity(activityId) {
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  await updateDoc(userRef, {
    myActivities: arrayRemove(activityId),
  }).then(() => {
    updateDoc(doc(db, "activities", activityId), {
      volunteerSlot: increment(+1),
    })
      .catch((error) => {
        console.error("Error updating document: ", error);
      })
      .then(() => {
        Alert.alert("You have successfully left the activity!");
      });
  });
}

async function checkClash(item) {
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  let requestedDate = Timestamp.fromDate(new Date(item.activityDatetime));

  //retrieve from firebase where user activity date = requested date
  const docSnap = await getDoc(userRef);

  if (docSnap.data().myActivities != null) {
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
          await updateDoc(userRef, {
            myActivities: arrayUnion(item.id),
          })
            .then(() => {
              updateDoc(doc(db, "activities", item.id), {
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
        }
      }
    }
  } else {
    //the user has no pre-existing activities
    await updateDoc(userRef, {
      myActivities: arrayUnion(item.id),
    })
      .then(() => {
        updateDoc(doc(db, "activities", item.id), {
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
  }
}

export { joinActivity, leaveActivity, checkClash };
