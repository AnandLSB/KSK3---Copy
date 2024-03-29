import { useNavigation } from "@react-navigation/core";
import { getAuth, signOut } from "firebase/auth";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  documentId,
  updateDoc,
  increment,
  arrayUnion,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";
import { joinActivity, capitalizeWords } from "../components/activityFunc";
import { useIsFocused } from "@react-navigation/core";
import MyActHome from "../components/myActHome";
import MySession from "../components/mySession";
import messaging from "@react-native-firebase/messaging";

import * as RootNavigation from "../RootNavigation";

const HomeScreen = () => {
  console.log("HomeScreen");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const auth = getAuth();
  const allActivitiesRef = collection(db, "activities");
  const myActivitiesRef = collection(db, "volunteerParticipation");
  const userRef = doc(db, "volunteer", auth.currentUser?.uid);

  const [initializing, setInitializing] = React.useState(true);
  const [allActivity, setActivity] = React.useState([]);
  const [myActivity, setMyActivity] = React.useState([]);

  const qAll = query(
    allActivitiesRef,
    where("activityStatus", "==", "active"),
    where("volunteerSlot", ">", 0),
    orderBy("volunteerSlot", "desc"),
    orderBy("createdAt", "desc"),
    limit(2)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(qAll, (querySnapshotAll) => {
      setActivity([]);
      var allDateTime, allDateTimeEnd;
      var allAct = {};

      querySnapshotAll.forEach((docAll) => {
        allDateTime = docAll.data().activityDatetime.toDate();
        allDateTimeEnd = docAll.data().activityDatetimeEnd.toDate();

        allAct = docAll.data();
        allAct.activityDatetime = allDateTime;
        allAct.activityDatetimeEnd = allDateTimeEnd;
        allAct.id = docAll.id;

        setActivity((allActivity) => [...allActivity, allAct]);
      });
    });

    if (initializing) setInitializing(false);

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Volunteer Session</Text>
      </View>

      <MySession />

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>My Upcoming Activities</Text>
      </View>
      <MyActHome />

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Available Activities</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AllActivities");
          }}
        >
          <Text style={styles.buttonOutlineTextSection}>View All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allActivity}
        style={{ flexGrow: 0, height: "45%" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ActivityInfo", { activityId: item.id });
            }}
          >
            <Card>
              <View style={styles.infoCont}>
                <Text style={{ fontWeight: "bold" }}>
                  {capitalizeWords(item.activityName)}
                </Text>
                <Text>
                  Start: {format(item.activityDatetime, "dd MMM yyyy")} at{" "}
                  {format(item.activityDatetime, "p")}
                </Text>
                <Text>
                  End: {format(item.activityDatetimeEnd, "dd MMM yyyy")} at{" "}
                  {format(item.activityDatetimeEnd, "p")}
                </Text>
                <Text>Volunteer Slots: {item.volunteerSlot}</Text>
                <Text>Category: {item.activityCategory}</Text>
              </View>
              <View style={styles.buttonCont}>
                <TouchableOpacity
                  onPress={() => {
                    joinActivity(item.id, item);
                  }}
                >
                  <Text style={styles.buttonOutlineText}>Join</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#0782F9",
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 40,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonOutlineTextSection: {
    color: "#EB4335",
    fontWeight: "700",
    fontSize: 14,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
