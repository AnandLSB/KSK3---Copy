import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useCallback } from "react";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import Card from "../components/card";
import { format } from "date-fns";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

const MyActivitiesScreen = () => {
  const auth = getAuth();
  const isFocused = useIsFocused();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [myActivity, setMyActivity] = React.useState([]);
  const [activityInfo, setActivityInfo] = React.useState([]);
  const [executed, setExecuted] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    getMyActivities();
  }, []);

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

  const getMyActivities = async () => {
    const userRef = doc(db, "volunteer", auth.currentUser.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.get("myActivities") != null) {
      console.log(docSnap.data().myActivities);

      setMyActivity(docSnap.data().myActivities);
      getActivityInfo();

      if (initializing) setInitializing(false);
    }
    //TODO: Handle if the user has no activities, maybe display no activities
  };

  const getActivityInfo = async () => {
    setActivityInfo([]);

    myActivity.forEach((item) => {
      let activityRef = item;
      let docRef = doc(db, "activities", activityRef);

      var activity = {};
      var dateTime;

      const docSnap = getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          dateTime = doc.data().activityDatetime.toDate();

          activity = doc.data();
          activity.activityDatetime = dateTime;
          activity.id = doc.id;

          setActivityInfo((activityInfo) => [...activityInfo, activity]);
        }
      });
    });
  };

  if (isFocused) {
    if (!executed) {
      getMyActivities();
      setExecuted(true);
    }
  }

  //sorting dates according to the nearest
  activityInfo.sort(function (a, b) {
    return (
      new Date(a.activityDatetime.toDateString()).getTime() -
      new Date(b.activityDatetime.toDateString()).getTime()
    );
  });

  console.log(activityInfo);

  return (
    <View style={styles.container}>
      <Text>MyActivitiesScreen</Text>
      <FlatList
        data={activityInfo}
        renderItem={({ item }) => (
          <Card>
            <Text>{item.activityName}</Text>
            <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                leaveActivity(item.id);
              }}
            >
              <Text style={styles.buttonOutlineText}>Cancel</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
};

export default MyActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
