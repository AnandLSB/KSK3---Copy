import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
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
import Dialog from "react-native-dialog";

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
    const unsubscribe = onSnapshot(userRef, (forumDoc) => {
      setJoinedForums([]);

      if (forumDoc.data().myForums.length > 0) {
        forumDoc.get("myForums").forEach((item) => {
          let docRef = doc(db, "forums", item);
          var forum = {};

          getDoc(docRef).then((docInf) => {
            if (docInf.exists()) {
              let userRef = doc(db, "volunteer", docInf.data().createdBy);

              getDoc(userRef)
                .then((docUser) => {
                  forum = docInf.data();
                  forum.id = docInf.id;
                  forum.createdAt = docInf
                    .data({ serverTimestamps: "estimate" })
                    .createdAt.toDate();

                  if (docInf.data().createdBy === auth.currentUser.uid) {
                    forum.createdBy = "You";
                  } else {
                    forum.createdBy = docUser.data().Username;
                  }
                })
                .finally(() => {
                  setJoinedForums((joinedForums) => [...joinedForums, forum]);
                });
            }
          });
        });
      }
    });

    return () => unsubscribe();
  }, [isFocused]);

  /*
  useLayoutEffect(() => {
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      const joinedForums = [];
      if (snapshot.data().myForums.length > 0) {
        snapshot.get("myForums").forEach((forumDoc) => {
          let docRef = doc(db, "forums", forumDoc);

          getDoc(docRef).then((docInf) => {
            joinedForums.push({
              ...docInf.data(),
              id: docInf.id,
            });
          });
        });
      }

      setJoinedForums(joinedForums);
    });
    setLoading(!loading);
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    setLoading(false);
  }, [isFocused]);

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  */
  console.log(joinedForums);

  //TODO: Show recent posts for each forum
  //TODO: Sort alphabetically or by update timestamp?

  return (
    <View>
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

      <Text>JoinedForumsScreen</Text>
      <TouchableOpacity
        onPress={() => {
          setModalVisible(true);
        }}
      >
        <Text>Create Forum</Text>
      </TouchableOpacity>
      <FlatList
        data={joinedForums}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("ForumDetails", {
                forumId: item.id,
              });
            }}
          >
            <Card>
              <View>
                <Text>{item.id}</Text>
                <Text>Title: {item.title}</Text>
                <Text>Desc: {item.desc}</Text>
                <Text>Created By: {item.createdBy}</Text>
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
    </View>
  );
};

export default JoinedForumsScreen;

const styles = StyleSheet.create({});
