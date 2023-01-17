import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { leaveForum, addForum } from "../components/forumFunc";
import Dialog from "react-native-dialog";

const JoinedForumsScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [joinedForums, setJoinedForums] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(false);

  const [forumTitle, setForumTitle] = React.useState("");
  const [forumDesc, setForumDesc] = React.useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(userRef, (forumDoc) => {
      setJoinedForums([]);

      if (forumDoc.data().myForums.length > 0) {
        forumDoc.get("myForums").forEach((item) => {
          let docRef = doc(db, "forums", item);
          var forum = {};

          getDoc(docRef).then((docInf) => {
            if (docInf.exists()) {
              let userRef = doc(db, "volunteer", docInf.data().createdBy);

              getDoc(userRef).then((docUser) => {
                forum = docInf.data();
                forum.id = docInf.id;
                forum.createdAt = docInf.data().createdAt.toDate();

                if (docInf.data().createdBy === auth.currentUser.uid) {
                  forum.createdBy = "You";
                } else {
                  forum.createdBy = docUser.data().Username;
                }

                setJoinedForums((joinedForums) => [...joinedForums, forum]);
              });
            }
          });
        });
      }
    });

    return () => unsubscribe();
  }, []);

  console.log(joinedForums);

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
