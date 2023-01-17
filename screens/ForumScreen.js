import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  doc,
  getDoc,
  documentId,
  addDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect } from "react";
import { useNavigation, StackActions } from "@react-navigation/native";
import { db } from "../config/firebase";
import Card from "../components/card";
import {
  leaveForum,
  deleteForumPost,
  updateForumPost,
  addForumPost,
} from "../components/forumFunc";
import Dialog from "react-native-dialog";

const ForumScreen = ({ route }) => {
  console.log("ForumScreen");
  let forumId = route.params.forumId;

  const auth = getAuth();
  const navigation = useNavigation();
  const forumPostRef = collection(db, "forumPost");
  const [forumPosts, setForumPosts] = React.useState([]);
  const [postText, setPostText] = React.useState("");
  const [editPostText, setEditPostText] = React.useState("");
  const [editPostId, setEditPostId] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false);
  const qForumPost = query(forumPostRef, where("forumId", "==", forumId));

  useEffect(() => {
    const unsubscribe = onSnapshot(qForumPost, (querySnapshot) => {
      if (
        querySnapshot.metadata.fromCache &&
        querySnapshot.metadata.hasPendingWrites
      ) {
        return;
      }

      //Check if the forumId is in the users myForums array

      setForumPosts([]);
      var forumPost = {};

      querySnapshot.forEach((docForPost) => {
        let userRef = doc(db, "volunteer", docForPost.data().createdBy);

        getDoc(userRef).then((userInfo) => {
          forumPost = docForPost.data();
          forumPost.createdBy = userInfo.data().Username;
          forumPost.uid = docForPost.data().createdBy;
          forumPost.id = docForPost.id;
          forumPost.createdAt = docForPost
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate();

          setForumPosts((forumPosts) => [...forumPosts, forumPost]);
        });
      });
    });

    return () => unsubscribe();
  }, []);

  const ManagePost = (props) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            setEditPostId(props.forumId);
            setModalVisible(true);
          }}
        >
          <Text>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            deleteForumPost(props.forumId);
          }}
        >
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  forumPosts.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  //TODO: Check whether user is in the forum, display join or leave button accordingly
  //TODO: Disable the text input for unjoined users

  return (
    <View style={styles.container}>
      <View>
        <Dialog.Container visible={modalVisible}>
          <Dialog.Title>Edit Your Forum Post</Dialog.Title>
          <Dialog.Input
            placeholder="New Post Content"
            value={editPostText}
            onChangeText={(text) => setEditPostText(text)}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => setModalVisible(false)}
          />
          <Dialog.Button
            label="Update"
            onPress={() => {
              updateForumPost(editPostId, editPostText);
              setModalVisible(false);
              setEditPostText("");
            }}
          />
        </Dialog.Container>
      </View>

      <View style={styles.section}>
        <Text>ForumScreen</Text>
        <TouchableOpacity
          onPress={() => {
            leaveForum(forumId);
            navigation.dispatch(StackActions.pop(1));
          }}
        >
          <Text style={styles.buttonOutlineText}>Leave Forum</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={forumPosts}
        renderItem={({ item }) => (
          <Card>
            <View>
              <Text>{item.content}</Text>
              <Text>Created by {item.createdBy}</Text>
              <Text>UID: {item.uid}</Text>
            </View>
            {item.uid === auth.currentUser.uid ? (
              <ManagePost forumId={item.id} />
            ) : null}
          </Card>
        )}
      />
      <View style={styles.section}>
        <TextInput
          placeholder="Enter your post here"
          value={postText}
          onChangeText={(text) => setPostText(text)}
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => {
            addForumPost(postText, forumId);
            setPostText("");
          }}
        >
          <Text style={styles.buttonOutlineText}>Post</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: "85%",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 5,
  },
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
});
