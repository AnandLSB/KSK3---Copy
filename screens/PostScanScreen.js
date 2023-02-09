import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeWords } from "../components/activityFunc";
import { useNavigation } from "@react-navigation/native";

const PostScanScreen = ({ route }) => {
  const navigation = useNavigation();
  const activityId = route.params.activityId;
  const volunPartId = route.params.volunPartId;
  const [activity, setActivity] = React.useState({});
  const [volunPart, setVolunPart] = React.useState({});

  useEffect(() => {
    getScreenInfo();
  }, []);

  const getScreenInfo = async () => {
    const actRef = doc(db, "activities", activityId);
    const volunPartRef = doc(db, "volunteerParticipation", volunPartId);
    var date,
      activity = {},
      volunPart = {};

    setActivity({});
    setVolunPart({});

    await getDoc(actRef)
      .then((actInf) => {
        date = format(actInf.data().activityDatetime.toDate(), "dd MMM yyyy");

        activity = actInf.data();
        activity.id = actInf.id;
        activity.activityDatetime = date;
        activity.activityName = capitalizeWords(activity.activityName);

        setActivity(activity);
      })
      .then(() => {
        getDoc(volunPartRef).then((volunPartInf) => {
          volunPart = volunPartInf.data();
          volunPart.id = volunPartInf.id;
          volunPart.checkInTime = format(
            volunPartInf
              .data({ serverTimestamps: "estimate" })
              .checkInTime.toDate(),
            "p"
          );

          if (route.params.status == "checkOut") {
            volunPart.checkOutTime = format(
              volunPartInf
                .data({ serverTimestamps: "estimate" })
                .checkOutTime.toDate(),
              "p"
            );
          }

          setVolunPart(volunPart);
        });
      });
  };

  if (route.params.status == "checkIn") {
    return (
      <View style={styles.container}>
        <View style={{ padding: 10, alignItems: "center" }}>
          <Ionicons name="md-checkbox" size={84} color="green" />
          <Text style={{ fontWeight: "500", fontSize: 18 }}>
            Volunteer Session Checked In
          </Text>
        </View>

        <View style={{ alignItems: "center", marginBottom: 80 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity: {activity.activityName}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity Category: {activity.activityCategory}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity Date: {activity.activityDatetime}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Check In Time: {volunPart.checkInTime}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => {
            navigation.navigate("Dashboard");
          }}
        >
          <Text style={styles.buttonOutlineText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (route.params.status == "checkOut") {
    return (
      <View style={styles.container}>
        <View style={{ padding: 10, alignItems: "center" }}>
          <Ionicons name="md-checkbox" size={84} color="green" />
          <Text style={{ fontWeight: "500", fontSize: 18 }}>
            Volunteer Session Checked Out
          </Text>
        </View>

        <View style={{ alignItems: "center", marginBottom: 80 }}>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity: {activity.activityName}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity Category: {activity.activityCategory}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Activity Date: {activity.activityDatetime}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Check In Time: {volunPart.checkInTime}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: "500", padding: 5 }}>
            Check Out Time: {volunPart.checkOutTime}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.buttonOutline]}
          onPress={() => {
            navigation.navigate("Dashboard");
          }}
        >
          <Text style={styles.buttonOutlineText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    return (
      <View>
        <Text>Invalid</Text>
      </View>
    );
  }
};

export default PostScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonOutline: {
    backgroundColor: "#E9ECEF",
    marginTop: 5,
    borderColor: "black",
    borderWidth: 2,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#0782F9",
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
});
