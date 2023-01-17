import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";

const MyActHome = () => {
  const auth = getAuth();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [myActivity, setMyActivity] = useState([]);
  const [hasActivity, setHasActivity] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (docMy) => {
      setMyActivity([]);
      //If the user has joined any activities
      if (docMy.data().myActivities.length > 0) {
        console.log(docMy.data().myActivities);
        docMy.get("myActivities").forEach((item) => {
          let docRef = doc(db, "activities", item);
          var activity = {};
          var dateTime;

          getDoc(docRef).then((docInf) => {
            if (docInf.exists()) {
              dateTime = docInf.data().activityDatetime.toDate();

              activity = docInf.data();
              activity.id = docInf.id;
              activity.activityDatetime = dateTime;

              setMyActivity((myActivity) =>
                Array.from(new Set([...myActivity, activity]))
              );
            }
          });
        });

        setHasActivity(true);
      } else {
        //If the user has not joined any activities
        setHasActivity(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (hasActivity === false) {
    return (
      <Card>
        <Text>No activities joined yet</Text>
      </Card>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={myActivity}
        renderItem={({ item }) => (
          <Card>
            <Text>{item.activityName}</Text>
            <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
            <TouchableOpacity
              onPress={() => {
                //function to register join goes here
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

export default MyActHome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
});
