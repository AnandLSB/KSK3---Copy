import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { format } from "date-fns";

const PostScanScreen = ({ route }) => {
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

  console.log(route.params);

  if (route.params.status == "checkIn") {
    return (
      <View>
        <Text>Volunteer Session Checked In</Text>
        <Text>Activity: {activity.activityName}</Text>
        <Text>Activity Date: {activity.activityDatetime}</Text>
        <Text>Check In Time: {volunPart.checkInTime}</Text>

        <TouchableOpacity>
          <Text>Check Out</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (route.params.status == "checkOut") {
    return (
      <View>
        <Text>Volunteer Session Checked Out</Text>
        <Text>Activity: {activity.activityName}</Text>
        <Text>Activity Date: {activity.activityDatetime}</Text>
        <Text>Check In Time: {volunPart.checkInTime}</Text>
        <Text>Check Out Time: {volunPart.checkOutTime}</Text>
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

const styles = StyleSheet.create({});
