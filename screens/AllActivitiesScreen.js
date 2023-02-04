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
  documentId,
  updateDoc,
  arrayUnion,
  increment,
  doc,
  onSnapshot,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";
import {
  joinActivity,
  checkClash,
  capitalizeWords,
} from "../components/activityFunc";
import { search, SearchBar } from "../components/search";

const AllActivitiesScreen = () => {
  console.log("AllActivitiesScreen");
  const auth = getAuth();
  const activitiesRef = collection(db, "activities");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [activities, setActivities] = React.useState([]);
  const [initializing, setInitializing] = React.useState(true);
  const [searchText, setSearchText] = React.useState("");

  useEffect(() => {
    const q = query(
      activitiesRef,
      where("activityStatus", "==", "active"),
      orderBy("activityName", "asc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const activities = [];

      querySnapshot.forEach((actDoc) => {
        activities.push({
          ...actDoc.data(),
          id: actDoc.id,
          activityDatetime: actDoc.data().activityDatetime.toDate(),
        });
      });

      setActivities(activities);
    });

    if (initializing) setInitializing(false);

    return () => unsubscribe();
  }, []);

  /*
  const getAllActivities = async () => {
    const q = query(
      activitiesRef,
      where("activityStatus", "==", "active"),
      orderBy("activityName", "asc")
    );
    const querySnapshot = await getDocs(q);
    const activity = [];
    var dateTime;
    querySnapshot.forEach((doc) => {
      dateTime = doc.data().activityDatetime.toDate();
      const {
        activityCategory,
        activityDesc,
        activityName,
        createdAt,
        volunteerSlot,
      } = doc.data();

      activity.push({
        id: doc.id,
        activityCategory,
        activityDatetime: dateTime,
        activityDesc,
        activityName,
        createdAt,
        volunteerSlot,
      });

      setActivities(activity);
    });

    if (initializing) setInitializing(false);
  };
  */

  console.log(activities);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log(searchText);

  return (
    <View>
      <SearchBar type={"activities"} setActivities={setActivities} />

      {activities === null ? (
        <Card>
          <Text>No results</Text>
        </Card>
      ) : (
        <FlatList
          data={activities}
          renderItem={({ item }) => (
            <Card>
              <Text>{capitalizeWords(item.activityName)}</Text>
              <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  joinActivity(item.id, item);
                }}
              >
                <Text style={styles.buttonOutlineText}>Join</Text>
              </TouchableOpacity>
            </Card>
          )}
        />
      )}
    </View>
  );
};

export default AllActivitiesScreen;

const styles = StyleSheet.create({
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: "85%",
  },
});
