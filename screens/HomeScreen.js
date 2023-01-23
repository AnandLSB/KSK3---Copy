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
import { joinActivity, checkClash } from "../components/activityFunc";
import { useIsFocused } from "@react-navigation/core";
import MyActHome from "../components/myActHome";
import MySession from "../components/mySession";

const HomeScreen = () => {
  console.log("HomeScreen");
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const auth = getAuth();
  const allActivitiesRef = collection(db, "activities");
  const myActivitiesRef = collection(db, "volunteerParticipation");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  const [initializing, setInitializing] = React.useState(true);
  const [allActivity, setActivity] = React.useState([]);
  const [myActivity, setMyActivity] = React.useState([]);
  const qAll = query(
    allActivitiesRef,
    where("volunteerSlot", ">", 0),
    orderBy("volunteerSlot", "desc"),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(qAll, (querySnapshotAll) => {
      setActivity([]);
      var allDateTime;
      var allAct = {};

      querySnapshotAll.forEach((docAll) => {
        allDateTime = docAll.data().activityDatetime.toDate();

        allAct = docAll.data();
        allAct.activityDatetime = allDateTime;
        allAct.id = docAll.id;

        setActivity((allActivity) => [...allActivity, allAct]);
      });
    });
    //TODO: Handle if the admin has not created any activities yet
    if (initializing) setInitializing(false);

    return () => unsubscribe();
  }, []);

  //console.log(myActivity);
  //console.log(allActivity);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  //TODO: Handle if the volunteer slot = 0
  //TODO: Handle if current date > activity date

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Volunteer Session</Text>
      </View>
      <MySession />

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>Available Activities</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("AllActivities");
          }}
        >
          <Text style={styles.buttonOutlineText}>View All</Text>
        </TouchableOpacity>
      </View>
      {/*TODO: Restructure activities to show start date and end date, same for time */}
      <FlatList
        data={allActivity}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.infoCont}>
              <Text style={{ fontWeight: "bold" }}>{item.activityName}</Text>
              <Text>Date: {format(item.activityDatetime, "dd MMM yyyy")}</Text>
              <Text>Time: {format(item.activityDatetime, "p")}</Text>
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
        )}
      />

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("BeneForm");
        }}
      >
        <Text style={styles.buttonOutlineText}>Beneficiary Form</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>My Upcoming Activities</Text>
      </View>
      <MyActHome />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  infoCont: {},
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
