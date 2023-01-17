import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import Card from "../components/card";
import { format } from "date-fns";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { leaveActivity } from "../components/activityFunc";

const MyActivitiesScreen = () => {
  console.log("MyActivitiesScreen");
  const isFocused = useIsFocused();
  const auth = getAuth();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [myActivity, setMyActivity] = React.useState([]);
  const [activityInfo, setActivityInfo] = React.useState([]);
  const [hasActivity, setHasActivity] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (docMy) => {
      setMyActivity([]);
      setActivityInfo([]);

      //If the user has joined any activities
      if (docMy.data().myActivities.length > 0) {
        setMyActivity(docMy.data().myActivities);

        docMy.get("myActivities").forEach((item) => {
          let docRef = doc(db, "activities", item);
          var activity = {};
          var dateTime;

          getDoc(docRef).then((docInf) => {
            if (docInf.exists()) {
              dateTime = docInf.data().activityDatetime.toDate();

              activity = docInf.data();
              activity.Id = docInf.id;
              activity.activityDatetime = dateTime;

              setActivityInfo((activityInfo) =>
                Array.from(new Set([...activityInfo, activity]))
              );
            }
          });
        });

        setHasActivity(true);
      } else {
        setHasActivity(false);
      }
    });

    if (initializing) setInitializing(false);

    return () => unsubscribe();
  }, []);

  //console.log(myActivity);
  //console.log(activityInfo);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  } else if (hasActivity === false) {
    return (
      <Card>
        <Text>No activities joined yet</Text>
      </Card>
    );
  }

  //sorting dates according to the nearest
  activityInfo.sort(function (a, b) {
    return (
      new Date(a.activityDatetime.toDateString()).getTime() -
      new Date(b.activityDatetime.toDateString()).getTime()
    );
  });

  //console.log(activityInfo);

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
              onPress={() => {
                leaveActivity(item.Id);
                //setActivityInfo([]);
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
