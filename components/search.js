import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React from "react";
import {
  collection,
  query,
  orderBy,
  startAt,
  endAt,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getForumAuthor, getJoinedStatus } from "./forumFunc";

const searchActivity = async (searchText, setActivities) => {
  const activitiesRef = collection(db, "activities");
  const activities = [];

  const q = query(
    activitiesRef,
    orderBy("activityName"),
    startAt(searchText.toLowerCase()),
    endAt(searchText.toLowerCase() + "\uf8ff")
  );

  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    if (doc.data().activityStatus === "active") {
      activities.push({
        ...doc.data(),
        id: doc.id,
        activityDatetime: doc.data().activityDatetime.toDate(),
      });
    }
  });
  if (activities.length > 0) {
    setActivities(activities);
  } else {
    setActivities(null);
  }
};

const searchForum = async (searchText, setForums) => {
  const forumRef = collection(db, "forums");
  const forums = [];

  const q = query(
    forumRef,
    orderBy("title"),
    startAt(searchText.toLowerCase()),
    endAt(searchText.toLowerCase() + "\uf8ff")
  );

  const querySnapshot = await getDocs(q);

  for (const doc of querySnapshot.docs) {
    const author = await getForumAuthor(doc.data().createdBy);
    const joined = await getJoinedStatus(doc.id);

    forums.push({
      ...doc.data(),
      id: doc.id,
      createdBy: author,
      joined: joined,
      createdAt: doc.data({ serverTimestamps: "estimate" }).createdAt.toDate(),
    });
  }

  if (forums.length > 0) {
    setForums(forums);
  } else {
    setForums(null);
  }
};

const searchMyForums = async (searchText, setJoinedForums, joinedForums) => {
  const filteredForums = joinedForums.filter((item) =>
    item.title.toLowerCase().includes(searchText.toLowerCase())
  );

  if (filteredForums.length > 0) {
    setJoinedForums(filteredForums);
  } else {
    setJoinedForums(null);
  }
};

const SearchBar = (props) => {
  const [searchText, setSearchText] = React.useState("");

  return (
    <View style={styles.section}>
      <TextInput
        style={styles.input}
        placeholder="Search Here"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      <TouchableOpacity
        onPress={() => {
          if (props.type === "forums") {
            searchForum(searchText, props.setForums);
          } else if (props.type === "activities") {
            searchActivity(searchText, props.setActivities);
          } else if (props.type === "myForums") {
            searchMyForums(
              searchText,
              props.setJoinedForums,
              props.joinedForums
            );
          }

          setSearchText("");
        }}
      >
        <Text style={styles.buttonOutlineText}>Search</Text>
      </TouchableOpacity>
    </View>
  );
};

export { SearchBar };

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
