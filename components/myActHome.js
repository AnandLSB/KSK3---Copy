import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";
import { useNavigation } from "@react-navigation/native";
import { capitalizeWords } from "./activityFunc";

const MyActHome = () => {
  const auth = getAuth();
  const navigation = useNavigation();
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
              if (docInf.data().activityStatus === "active") {
                dateTime = docInf.data().activityDatetime.toDate();

                activity = docInf.data();
                activity.id = docInf.id;
                activity.activityDatetime = dateTime;

                setMyActivity((myActivity) =>
                  Array.from(new Set([...myActivity, activity]))
                );
              }
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

  /* In case you need it later; this is the code for checking if the activity is still ongoing or passed
  if (
    new Date().setHours(0, 0, 0, 0) <=
    docInf.data().activityDatetime.toDate().setHours(0, 0, 0, 0)
  ) {
    dateTime = docInf.data().activityDatetime.toDate();

    activity = docInf.data();
    activity.id = docInf.id;
    activity.activityDatetime = dateTime;

    setMyActivity((myActivity) =>
      Array.from(new Set([...myActivity, activity]))
    );
  } else {
    console.log("Activity is over" + docInf.data().activityName);
  }
  */

  //Checking if the activity date is today
  const checkActivityDate = (activityId, activityDatetime) => {
    const today = new Date();

    if (format(activityDatetime, "dd MM") === format(today, "dd MM")) {
      if (today >= activityDatetime) {
        //If the current time is more than the activity start time
        navigation.navigate("ScanCode", {
          activityId: activityId,
        });
      } else {
        Alert.alert("This activity has not started yet!");
      }
    } else {
      Alert.alert("This activity is not being held today!");
    }
  };

  //Checking if the user has an ongoing volunteer session
  const checkSession = async (activityId, activityDatetime) => {
    const docSnap = await getDoc(userRef);

    if (docSnap.data().mySession == null) {
      checkActivityDate(activityId, activityDatetime);
    } else {
      Alert.alert("You have an ongoing volunteer session!");
    }
  };

  //Sort according to nearest date
  myActivity.sort((a, b) => {
    return a.activityDatetime - b.activityDatetime;
  });

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
            <Text>{capitalizeWords(item.activityName)}</Text>
            <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
            <TouchableOpacity
              onPress={() => {
                checkSession(item.id, item.activityDatetime);
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
