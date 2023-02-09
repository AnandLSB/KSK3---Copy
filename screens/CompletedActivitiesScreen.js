import { StyleSheet, Text, View, FlatList } from "react-native";
import React, { useEffect } from "react";
import { getAuth } from "@firebase/auth";
import { getDoc, doc } from "@firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";
import { capitalizeWords } from "../components/activityFunc";

const CompletedActivitiesScreen = () => {
  const auth = getAuth();
  const [completedActivities, setCompletedActivities] = React.useState([]);
  const [hasActivity, setHasActivity] = React.useState(false);
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  useEffect(() => {
    getCompletedActivities();
  }, []);

  const getCompletedActivities = async () => {
    setCompletedActivities([]);
    const docSnap = await getDoc(userRef);

    if (docSnap.data().myCompleteAct.length > 0) {
      setHasActivity(true);
      docSnap.get("myCompleteAct").forEach((item) => {
        let actRef = doc(db, "activities", item);
        var activity = {};
        var dateTime, dateTimeEnd;

        getDoc(actRef).then((docInf) => {
          if (docInf.exists()) {
            dateTime = docInf.data().activityDatetime.toDate();
            dateTimeEnd = docInf.data().activityDatetimeEnd.toDate();

            activity = docInf.data();
            activity.activityDatetime = dateTime;
            activity.activityDatetimeEnd = dateTimeEnd;
            activity.activityId = docInf.id;

            setCompletedActivities((completedActivities) =>
              Array.from(new Set([...completedActivities, activity]))
            );
          }
        });
      });
    } else {
      setHasActivity(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ padding: 5 }}>
        <Text style={{ textAlign: "center", fontWeight: "500", fontSize: 15 }}>
          A summary of the volunteer activities you have completed with the
          Kechara Soup Kitchen!
        </Text>
      </View>

      {hasActivity ? (
        <FlatList
          data={completedActivities}
          renderItem={({ item }) => (
            <Card>
              <View>
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
                <Text>Category: {item.activityCategory}</Text>
              </View>
            </Card>
          )}
        />
      ) : (
        <Card>
          <Text>You have not completed any activities yet!</Text>
        </Card>
      )}
    </View>
  );
};

export default CompletedActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
