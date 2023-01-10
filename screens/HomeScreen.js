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
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const allActivitiesRef = collection(db, "activities");
  const myActivitiesRef = collection(db, "volunteerParticipation");

  const [initializing, setInitializing] = React.useState(true);
  const [allActivity, setActivity] = React.useState({});
  const [myActivity, setMyActivity] = React.useState([]);
  const [activityDate, setActivityDate] = React.useState();

  useEffect(() => {
    getActivities();
  }, []);

  const getActivities = async () => {
    setMyActivity([]);

    const qAll = query(
      allActivitiesRef,
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const qMy = query(
      myActivitiesRef,
      where("volunteerId", "==", auth.currentUser.uid)
    );

    const querySnapshotAll = await getDocs(qAll);
    const querySnapshotMy = await getDocs(qMy);

    querySnapshotAll.forEach((docAll) => {
      console.log(docAll.id, " => ", docAll.data());
      setActivity(docAll.data());

      setActivityDate(docAll.data().activityDatetime.toDate());
    });

    var dateTime;
    var activity = {};

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

  console.log(myActivity);

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
      <Card>
        <View style={styles.infoCont}>
          <Text style={{ fontWeight: "bold" }}>{allActivity.activityName}</Text>
          <Text>Date: {format(activityDate, "dd MMM yyyy")}</Text>
          <Text>Time: {format(activityDate, "p")}</Text>
          <Text>Volunteer Slots: {allActivity.volunteerSlot}</Text>
          <Text>Category: {allActivity.activityCategory}</Text>
        </View>
        <View style={styles.buttonCont}>
          <TouchableOpacity>
            <Text style={styles.buttonOutlineText}>Join</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={{ fontWeight: "bold" }}>My Upcoming Activities</Text>
      </View>
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
