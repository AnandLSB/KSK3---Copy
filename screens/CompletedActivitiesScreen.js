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
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  useEffect(() => {
    getCompletedActivities();
  }, []);

  const getCompletedActivities = async () => {
    setCompletedActivities([]);
    const docSnap = await getDoc(userRef);

    if (docSnap.data().myCompleteAct.length > 0) {
      docSnap.get("myCompleteAct").forEach((item) => {
        let actRef = doc(db, "activities", item);
        var activity = {};
        var dateTime;

        getDoc(actRef).then((docInf) => {
          if (docInf.exists()) {
            dateTime = docInf.data().activityDatetime.toDate();

            activity = docInf.data();
            activity.activityDatetime = dateTime;
            activity.activityId = docInf.id;

            setCompletedActivities((completedActivities) =>
              Array.from(new Set([...completedActivities, activity]))
            );
          }
        });
      });
    } else {
      //TODO: Display message to user that they have no completed activities
    }
  };

  return (
    <View>
      <Text>CompletedActivitiesScreen</Text>
      <FlatList
        data={completedActivities}
        renderItem={({ item }) => (
          <Card>
            <Text>{capitalizeWords(item.activityName)}</Text>
            <Text>{format(item.activityDatetime, "dd MMM yyyy")}</Text>
          </Card>
        )}
      />
    </View>
  );
};

export default CompletedActivitiesScreen;

const styles = StyleSheet.create({});
