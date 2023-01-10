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
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";

const AllActivitiesScreen = () => {
  const activitiesRef = collection(db, "activities");
  const navigation = useNavigation();
  const [activities, setActivities] = React.useState([]);
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    getAllActivities();
  }, []);

  const getAllActivities = async () => {
    const q = query(activitiesRef, orderBy("activityName", "asc"));
    const querySnapshot = await getDocs(q);
    const activity = [];
    var dateTime;
    querySnapshot.forEach((doc) => {
      console.log(doc.data().activityDatetime.toDate());
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

  console.log(activities);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View>
      <Text>Search Bar Here</Text>
      <FlatList
        data={activities}
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
              <Text style={styles.buttonOutlineText}>Join</Text>
            </TouchableOpacity>
          </Card>
        )}
      />
    </View>
  );
};

export default AllActivitiesScreen;

const styles = StyleSheet.create({
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
});
