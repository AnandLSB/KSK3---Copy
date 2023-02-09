import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { getAuth } from "firebase/auth";
import Card from "../components/card";
import { useRoute } from "@react-navigation/native";
import Dialog from "react-native-dialog";
import { editForum, deleteForum } from "../components/forumFunc";
import { capitalizeWords } from "../components/activityFunc";

const CreatedForumsScreen = () => {
  const auth = getAuth();
  const route = useRoute();
  const forumsRef = collection(db, "forums");
  const [myforums, setMyForums] = React.useState([]);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false);
  const [forumId, setForumId] = React.useState("");
  const qMyForum = query(
    forumsRef,
    where("createdBy", "==", auth.currentUser.uid)
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(qMyForum, (querySnapshot) => {
      setMyForums([]);
      var forum = {},
        username;

      querySnapshot.forEach((docFor) => {
        let userRef = doc(db, "volunteer", docFor.data().createdBy);

        getDoc(userRef).then((userInfo) => {
          if (docFor.data().createdBy === auth.currentUser.uid) {
            username = "You";
          } else {
            username = userInfo.data().Username;
          }

          forum = docFor.data();
          forum.createdBy = username;
          forum.createdAt = docFor
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate();
          forum.id = docFor.id;

          setMyForums((myforums) => [...myforums, forum]);
        });
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Dialog.Container visible={modalVisible}>
          <Dialog.Title>Edit Forum Information</Dialog.Title>
          <Dialog.Input
            placeholder="Forum Title"
            value={newTitle}
            onChangeText={(text) => setNewTitle(text)}
          />
          <Dialog.Input
            placeholder="Forum Description"
            value={newDesc}
            onChangeText={(text) => setNewDesc(text)}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => setModalVisible(false)}
          />
          <Dialog.Button
            label="Save"
            onPress={() => {
              editForum(forumId, newTitle, newDesc);
              setModalVisible(false);
              setNewTitle("");
              setNewDesc("");
            }}
          />
        </Dialog.Container>
      </View>

      <View style={[styles.section, { justifyContent: "space-between" }]}>
        <Text style={[styles.buttonOutlineTextSection, { color: "black" }]}>
          Your Created Forums:
        </Text>
      </View>

      <FlatList
        data={myforums}
        renderItem={({ item }) => (
          <Card>
            <View>
              <Text>Title: {capitalizeWords(item.title)}</Text>
              <Text>Desc: {item.desc}</Text>
              <Text>Created By: {item.createdBy}</Text>
            </View>
            <View>
              <TouchableOpacity
                onPress={() => {
                  setForumId(item.id);
                  setNewTitle(item.title);
                  setNewDesc(item.desc);
                  setModalVisible(true);
                }}
              >
                <Text>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Forum",
                    "Are you sure you want to delete this forum?",
                    [
                      {
                        text: "Cancel",
                      },
                      {
                        text: "OK",
                        onPress: () => deleteForum(item.id),
                      },
                    ],
                    { cancelable: true }
                  );
                }}
              >
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />
    </View>
  );
};

export default CreatedForumsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    padding: 5,
  },
  buttonOutlineTextSection: {
    color: "#EB4335",
    fontWeight: "700",
    fontSize: 14,
  },
});
