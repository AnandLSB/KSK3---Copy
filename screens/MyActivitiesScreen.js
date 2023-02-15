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
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { leaveActivity, capitalizeWords } from "../components/activityFunc";

const MyActivitiesScreen = () => {
  console.log("MyActivitiesScreen");
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const auth = getAuth();
  const [myActivity, setMyActivity] = React.useState([]);
  const [activityInfo, setActivityInfo] = React.useState([]);
  const [hasActivity, setHasActivity] = React.useState(false);
  const [initializing, setInitializing] = React.useState(true);
  const [inactiveAct, setInactiveAct] = React.useState([]);

  useEffect(() => {
    if (auth.currentUser !== null) {
      const userRef = doc(db, "volunteer", auth.currentUser?.uid);

      const unsubscribe = onSnapshot(userRef, (docMy) => {
        setMyActivity([]);
        setActivityInfo([]);

        //If the user has joined any activities
        if (docMy.data().myActivities.length > 0) {
          setMyActivity(docMy.data().myActivities);

          docMy.get("myActivities").forEach((item) => {
            let docRef = doc(db, "activities", item);
            var activity = {};
            var dateTime, dateTimeEnd;

            getDoc(docRef).then((docInf) => {
              if (docInf.exists()) {
                if (
                  docInf.data().activityStatus === "active" ||
                  docInf.data().activityStatus === "full"
                ) {
                  dateTime = docInf.data().activityDatetime.toDate();
                  dateTimeEnd = docInf.data().activityDatetimeEnd.toDate();

                  activity = docInf.data();
                  activity.Id = docInf.id;
                  activity.activityDatetime = dateTime;
                  activity.activityDatetimeEnd = dateTimeEnd;

                  setActivityInfo((activityInfo) =>
                    Array.from(new Set([...activityInfo, activity]))
                  );
                } else {
                  setInactiveAct((inactiveAct) =>
                    Array.from(new Set([...inactiveAct, docInf.id]))
                  );
                }
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
    }
  }, []);

  //console.log(myActivity);
  //console.log(activityInfo);

  if (isFocused) {
    if (inactiveAct.length > 0) {
      Alert.alert(
        "Inactive Activities Found",
        "Would you like to remove them from your activities?",
        [
          {
            text: "Yes",
            onPress: () => {
              inactiveAct.forEach(async (item) => {
                await updateDoc(userRef, {
                  myActivities: arrayRemove(item),
                });
              });
              setInactiveAct([]);
            },
          },
          {
            text: "No",
          },
        ]
      );
    }
  }

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
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
      <View style={[styles.section, { justifyContent: "space-between" }]}>
        <Text style={[styles.buttonOutlineTextSection, { color: "black" }]}>
          Your Upcoming Activities:
        </Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("CompletedActivities");
          }}
        >
          <Text style={styles.buttonOutlineTextSection}>
            Completed Activities
          </Text>
        </TouchableOpacity>
      </View>

      {hasActivity ? (
        <FlatList
          data={activityInfo}
          renderItem={({ item }) => (
            <Card>
              <View>
                <Text>{capitalizeWords(item.activityName)}</Text>
                <Text>
                  Start: {format(item.activityDatetime, "dd MMM yyyy")} at{" "}
                  {format(item.activityDatetime, "p")}
                </Text>
                <Text>
                  End: {format(item.activityDatetimeEnd, "dd MMM yyyy")} at{" "}
                  {format(item.activityDatetimeEnd, "p")}
                </Text>
                <Text>Category: {item.activityCategory}</Text>
              </View>

              <View style={styles.buttonCont}>
                <TouchableOpacity
                  onPress={() => {
                    leaveActivity(item.Id);
                    //setActivityInfo([]);
                  }}
                >
                  <Text style={styles.buttonOutlineText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}
        />
      ) : (
        <Card>
          <Text>No activities joined yet</Text>
        </Card>
      )}
    </View>
  );
};

export default MyActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    padding: 5,
  },
  buttonOutlineTextSection: {
    color: "#EB4335",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
