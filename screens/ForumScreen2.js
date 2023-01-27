import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useCallback, useEffect, useLayoutEffect } from "react";
import { collection, query, onSnapshot, where, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import {
  addForumPost,
  leaveForum,
  joinForum,
  deleteForumPost,
  updateForumPost,
} from "../components/forumFunc";
import { getAuth } from "firebase/auth";
import { useNavigation, StackActions } from "@react-navigation/native";
import Dialog from "react-native-dialog";
import ReportDialog from "../components/reportDialog";

const ForumScreen2 = ({ route }) => {
  let forumId = route.params.forumId;
  const auth = getAuth();
  const navigation = useNavigation();
  //Member State
  const [isMember, setIsMember] = React.useState(false);

  //Edit Post State
  const [editPostId, setEditPostId] = React.useState("");
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [editPostText, setEditPostText] = React.useState("");

  //Report Forum State
  const [reportModalVisible, setReportModalVisible] = React.useState(false);

  //Forum Post State
  const [forumPosts, setForumPosts] = React.useState([]);
  const [postText, setPostText] = React.useState("");

  console.log(forumId);

  useLayoutEffect(() => {
    const collectionRef = collection(db, "forumPost");
    const q = query(collectionRef, where("forumId", "==", forumId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setForumPosts(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          createdAt: doc
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate(),
          createdBy: doc.data().createdBy,
          content: doc.data().content,
          username: doc.data().username,
        }))
      );
    });

    checkMember();

    return () => unsubscribe();
  }, []);

  forumPosts.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  const checkMember = () => {
    const userRef = doc(db, "volunteer", auth.currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.data().myForums.includes(forumId)) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    });

    return () => unsubscribe();
  };

  const JoinButton = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            joinForum(forumId);
          }}
        >
          <Text style={styles.buttonOutlineText}>Join</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const LeaveButton = () => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            leaveForum(forumId);
            navigation.dispatch(StackActions.pop(1));
          }}
        >
          <Text style={styles.buttonOutlineText}>Leave</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const ManagePost = (props) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            setEditPostId(props.forumId);
            setEditModalVisible(true);
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

  const Message = ({ item }) => {
    return (
      <Card>
        <View style={styles.section}>
          <View>
            <Text>{item.content}</Text>
            <Text>Created By: {item.username}</Text>
          </View>
          {item.createdBy === auth.currentUser.uid ? (
            <ManagePost forumId={item.id} />
          ) : null}
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Dialog.Container visible={editModalVisible}>
          <Dialog.Title>Edit Your Forum Post</Dialog.Title>
          <Dialog.Input
            placeholder="New Post Content"
            value={editPostText}
            onChangeText={(text) => setEditPostText(text)}
          />
          <Dialog.Button
            label="Cancel"
            onPress={() => {
              setEditModalVisible(false);
              setEditPostText("");
            }}
          />
          <Dialog.Button
            label="Update"
            onPress={() => {
              updateForumPost(editPostId, editPostText);
              setEditModalVisible(false);
              setEditPostText("");
            }}
          />
        </Dialog.Container>
      </View>

      <ReportDialog
        visible={reportModalVisible}
        setVisible={setReportModalVisible}
        forumId={forumId}
      />

      <View style={styles.section}>
        <Text>ForumScreen2</Text>
        <TouchableOpacity onPress={() => setReportModalVisible(true)}>
          <Text>Report</Text>
        </TouchableOpacity>
        {isMember ? <LeaveButton /> : <JoinButton />}
      </View>

      <FlatList
        data={forumPosts}
        windowSize={5}
        initialNumToRender={10}
        removeClippedSubviews={true}
        renderItem={({ item }) => <Message item={item} />}
        keyExtractor={(item) => item.id.toString()}
        inverted
      />

      <View style={styles.section}>
        <TextInput
          placeholder="Enter your post here"
          value={postText}
          onChangeText={(text) => setPostText(text)}
          style={styles.input}
          editable={isMember}
        />
        <TouchableOpacity
          disabled={!isMember}
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

export default ForumScreen2;

const styles = StyleSheet.create({
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
