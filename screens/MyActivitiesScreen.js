import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
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
} from "firebase/firestore";
import Card from "../components/card";
import { format } from "date-fns";

const MyActivitiesScreen = () => {
  const auth = getAuth();
  const [myActivity, setMyActivity] = React.useState([]);
  const myActivitiesRef = collection(db, "volunteerParticipation");
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    getMyActivities();
  }, []);

  const getMyActivities = async () => {
    setMyActivity([]);

    const qMy = query(
      myActivitiesRef,
      where("volunteerId", "==", auth.currentUser.uid)
    );
    //TODO: implement check if the user has no activities?
    const querySnapshotMy = await getDocs(qMy);

    var dateTime;
    var activity = {};

    //retrieving the users activities
    querySnapshotMy.forEach((docMy) => {
      console.log(docMy.id, " => ", docMy.data());

      let activityRef = docMy.data().activityId;
      let docRef = doc(db, "activities", activityRef);
      const docSnap = getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          console.log("Document data:", doc.data());

          dateTime = doc.data().activityDatetime.toDate();

          activity = doc.data();
          activity.activityDatetime = dateTime;
          activity.id = doc.id;

          setMyActivity((myActivity) => [...myActivity, activity]);
        }
      });
    });

    if (initializing) setInitializing(false);
  };

  //sorting dates according to the nearest
  myActivity.sort(function (a, b) {
    return (
      new Date(a.activityDatetime.toDateString()).getTime() -
      new Date(b.activityDatetime.toDateString()).getTime()
    );
  });
  console.log(myActivity);

  return (
    <View style={styles.container}>
      <Text>MyActivitiesScreen</Text>
      <FlatList
        data={myActivity}
        renderItem={({ item }) => (
          <Card>
            <Text>{item.activityName}</Text>
            <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                //function to register join goes here
                navigation.navigate("ActivityDetails", {
                  id: item.id,
                });
              }}
            >
              <Text style={styles.buttonOutlineText}>Check In</Text>
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
