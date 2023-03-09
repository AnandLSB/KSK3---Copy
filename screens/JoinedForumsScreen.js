import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import Card from "../components/card";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { leaveForum, addForum } from "../components/forumFunc";
import { capitalizeWords } from "../components/activityFunc";
import Dialog from "react-native-dialog";
import { SearchBar } from "../components/search";
import Ionicons from "@expo/vector-icons/Ionicons";

const JoinedForumsScreen = () => {
  const auth = getAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [joinedForums, setJoinedForums] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [forumTitle, setForumTitle] = React.useState("");
  const [forumDesc, setForumDesc] = React.useState("");

  useLayoutEffect(() => {
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const joinedForums = [];

      if (snapshot.data().myForums.length > 0) {
        snapshot.get("myForums").forEach((forumDoc) => {
          joinedForums.push({
            id: forumDoc,
          });
        });

        getForumData(joinedForums).then((joinedForumsData) => {
          setJoinedForums(joinedForumsData);
          if (loading) setLoading(false);
        });
      } else {
        setJoinedForums(null);
        if (loading) setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFocused]);

  const getForumData = async (joinedForums) => {
    const joinedForumsData = [];

    for (let forum of joinedForums) {
      let docRef = doc(db, "forums", forum.id);
      const docInf = await getDoc(docRef);
      if (docInf.exists()) {
        const author = await getForumAuthor(docInf.data().createdBy);

        joinedForumsData.push({
          ...docInf.data(),
          id: docInf.id,
          createdBy: author,
          createdAt: docInf
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate(),
          updatedAt: docInf
            .data({ serverTimestamps: "estimate" })
            .updatedAt.toDate(),
        });
      }
    }

    return joinedForumsData;
  };

  const getForumAuthor = async (userID) => {
    var author;

    if (userID !== auth.currentUser.uid) {
      const userRef = doc(db, "volunteer", userID);

      await getDoc(userRef).then((userDoc) => {
        if (userDoc.exists()) {
          author = userDoc.data().Username;
        } else {
          author = "Unknown";
        }
      });
    } else {
      author = "You";
    }

    return author;
  };

  joinedForums?.sort((a, b) => {
    return b.updatedAt - a.updatedAt;
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Dialog.Container visible={modalVisible}>
          <Dialog.Title>Create a Forum</Dialog.Title>
          <Dialog.Input
            placeholder="Forum Title"
            value={forumTitle}
            onChangeText={(text) => setForumTitle(text)}
          />
          <Dialog.Input
            placeholder="Forum Description"
            value={forumDesc}
            onChangeText={(text) => setForumDesc(text)}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => setModalVisible(false)}
          />
          <Dialog.Button
            label="Create"
            onPress={() => {
              addForum(forumTitle, forumDesc);
              setModalVisible(false);
              setForumTitle("");
              setForumDesc("");
            }}
          />
        </Dialog.Container>
      </View>

      <SearchBar
        type={"myForums"}
        setJoinedForums={setJoinedForums}
        joinedForums={joinedForums}
      />

      {joinedForums === null ? (
        <Card>
          <Text>No Joined Forum Results</Text>
        </Card>
      ) : (
        <FlatList
          data={joinedForums}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ForumDetails", {
                  forumId: item.id,
                  forumTitle: item.title,
                  createdBy: item.createdBy,
                });
              }}
            >
              <Card>
                <View>
                  <Text style={{ fontWeight: "bold" }}>
                    {capitalizeWords(item.title)}
                  </Text>
                  <Text>{item?.desc}</Text>
                  <Text>Created by: {item.createdBy}</Text>
                </View>
                {/* Maybe add a recent message component onSnapshot for each forum */}
                <TouchableOpacity
                  onPress={() => {
                    leaveForum(item.id);
                  }}
                >
                  <Text>Leave</Text>
                </TouchableOpacity>
              </Card>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Ionicons name="add-circle" size={45} color="black" />
      </TouchableOpacity>
    </View>
  );
};

export default JoinedForumsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  fab: {
    position: "absolute",
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    right: 10,
    bottom: 10,
  },
});
