import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useLayoutEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { format } from "date-fns";
import { capitalizeWords, joinActivity } from "../components/activityFunc";
import { useNavigation, StackActions } from "@react-navigation/core";

const ActivityInfoScreen = ({ route }) => {
  const activityID = route.params.activityId;
  const navigation = useNavigation();
  const activityRef = doc(db, "activities", activityID);
  const [activity, setActivity] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  useLayoutEffect(() => {
    getDoc(activityRef).then((activityDoc) => {
      setActivity({
        ...activityDoc.data(),
        id: activityDoc.id,
        activityDatetime: activityDoc.data().activityDatetime.toDate(),
        activityDatetimeEnd: activityDoc.data().activityDatetimeEnd.toDate(),
        createdAt: activityDoc.data().createdAt.toDate(),
      });

      if (loading) setLoading(false);
    });
  }, []);

  console.log(activity);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Name</Text>
          <Text style={styles.textInfo}>
            {capitalizeWords(activity?.activityName)}
          </Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Description</Text>
          <Text style={styles.textInfo}>{activity.activityDesc}</Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Category</Text>
          <Text style={styles.textInfo}>{activity.activityCategory}</Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Volunteer Slot</Text>
          <Text style={styles.textInfo}>{activity.volunteerSlot}</Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Start Date</Text>
          <Text style={styles.textInfo}>
            {format(activity.activityDatetime, "dd MMM yyyy")} at{" "}
            {format(activity.activityDatetime, "p")}
          </Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity End Date</Text>
          <Text style={styles.textInfo}>
            {format(activity.activityDatetimeEnd, "dd MMM yyyy")} at{" "}
            {format(activity.activityDatetimeEnd, "p")}
          </Text>
        </View>

        <View style={{ paddingVertical: 5 }}>
          <Text style={styles.title}>Activity Creation Date</Text>
          <Text style={styles.textInfo}>
            {format(activity.createdAt, "dd MMM yyyy")}
          </Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => {
            joinActivity(activity.id, activity);
            navigation.dispatch(StackActions.pop(1));
          }}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Join</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ActivityInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  infoContainer: {
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  title: {
    paddingBottom: 2,
    fontWeight: "bold",
    fontSize: 16,
  },
  textInfo: {
    fontSize: 14,
    fontWeight: "500",
    borderColor: "black",
    borderBottomWidth: 1,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  button: {
    backgroundColor: "#0782F9",
    width: "95%",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
    marginLeft: 5,
  },
  buttonOutline: {
    backgroundColor: "#E9ECEF",
    borderColor: "black",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
});
