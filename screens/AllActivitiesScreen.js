import { useNavigation } from "@react-navigation/core";
import { getAuth } from "firebase/auth";
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
  orderBy,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";
import {
  joinActivity,
  checkClash,
  capitalizeWords,
} from "../components/activityFunc";
import { SearchBar } from "../components/search";

const AllActivitiesScreen = () => {
  console.log("AllActivitiesScreen");
  const auth = getAuth();
  const navigation = useNavigation();
  const activitiesRef = collection(db, "activities");
  const [activities, setActivities] = React.useState([]);
  const [initializing, setInitializing] = React.useState(true);

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
          activityDatetimeEnd: actDoc.data().activityDatetimeEnd.toDate(),
        });
      });

      setActivities(activities);
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
      <SearchBar type={"activities"} setActivities={setActivities} />

      {activities === null ? (
        <Card>
          <Text>No results</Text>
        </Card>
      ) : (
        <FlatList
          data={activities}
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
      )}
    </View>
  );
};

export default AllActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },
  input: {
    backgroundColor: "#E9ECEF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: "85%",
  },
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
