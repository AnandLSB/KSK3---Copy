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
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { format } from "date-fns";

//Uncomment the line below to reproduce error
//import { joinActivity } from "../components/activityFunc";

const HomeScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();
  const allActivitiesRef = collection(db, "activities");
  const myActivitiesRef = collection(db, "volunteerParticipation");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  const [initializing, setInitializing] = React.useState(true);
  const [allActivity, setActivity] = React.useState([]);
  const [myActivity, setMyActivity] = React.useState([]);

  useEffect(() => {
    getActivities();
  }, []);

  const getActivities = async () => {
    setMyActivity([]);
    setActivity([]);

    //only activities that are not full are retrieved
    const qAll = query(
      allActivitiesRef,
      where("volunteerSlot", ">", 0),
      orderBy("volunteerSlot", "desc"),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const qMy = query(
      myActivitiesRef,
      where("volunteerId", "==", auth.currentUser.uid)
    );

    const querySnapshotAll = await getDocs(qAll);
    const querySnapshotMy = await getDocs(qMy);

    var allDateTime;
    var allAct = {};

    querySnapshotAll.forEach((docAll) => {
      console.log(docAll.id, " => ", docAll.data());

      console.log(docAll.data().volunteerSlot);

      allDateTime = docAll.data().activityDatetime.toDate();

      allAct = docAll.data();
      allAct.activityDatetime = allDateTime;
      allAct.id = docAll.id;

      setActivity((allActivity) => [...allActivity, allAct]);
    });

    var dateTime;
    var activity = {};

    querySnapshotMy.forEach((docMy) => {
      //console.log(docMy.id, " => ", docMy.data());

      let activityRef = docMy.data().activityId;
      let docRef = doc(db, "activities", activityRef);
      const docSnap = getDoc(docRef).then((doc) => {
        if (doc.exists()) {
          //console.log("Document data:", doc.data());

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

  async function joinActivity(activityId) {
    const collRef = collection(db, "volunteer");

    //check if user has already joined the activity
    const q = query(
      collRef,
      where(documentId(), "==", auth.currentUser.uid),
      where("myActivities", "array-contains", activityId)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      await updateDoc(userRef, {
        myActivities: arrayUnion(activityId),
      })
        .then(() => {
          updateDoc(doc(db, "activities", activityId), {
            volunteerSlot: increment(-1),
          })
            .catch((error) => {
              console.error("Error updating document: ", error);
            })
            .then(() => {
              Alert.alert("You have successfully joined the activity!");
            });
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    } else {
      Alert.alert("You have already joined this activity!");
    }
  }

  //console.log(myActivity);
  //console.log(allActivity);

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
                  joinActivity(item.id);
                }}
              >
                <Text style={styles.buttonOutlineText}>Join</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

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
