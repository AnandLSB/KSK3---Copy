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
  joinForum,
} from "../components/forumFunc";
import Dialog from "react-native-dialog";
import ReportDialog from "../components/reportDialog";

const ForumScreen = ({ route }) => {
  console.log("ForumScreen");
  let forumId = route.params.forumId;

  const auth = getAuth();
  const navigation = useNavigation();
  const forumPostRef = collection(db, "forumPost");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);
  const [forumPosts, setForumPosts] = React.useState([]);
  const [postText, setPostText] = React.useState("");
  const [editPostText, setEditPostText] = React.useState("");
  const [editPostId, setEditPostId] = React.useState("");
  const [editModalVisible, setEditModalVisible] = React.useState(false);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const qForumPost = query(forumPostRef, where("forumId", "==", forumId));
  const [isMember, setIsMember] = React.useState(false);
  const [reportText, setReportText] = React.useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(qForumPost, (querySnapshot) => {
      if (
        querySnapshot.metadata.fromCache &&
        querySnapshot.metadata.hasPendingWrites
      ) {
        return;
      }

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

  const checkMember = () => {
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.data().myForums.includes(forumId)) {
        setIsMember(true);
      } else {
        setIsMember(false);
      }
    });

    return () => unsubscribe();
  };

  checkMember();

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

  const TextSection = () => {
    return (
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
    );
  };

  forumPosts.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  return (
    <View style={styles.container}>
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
        <Text>ForumScreen</Text>
        <TouchableOpacity onPress={() => setReportModalVisible(true)}>
          <Text>Report</Text>
        </TouchableOpacity>

        {isMember ? <LeaveButton /> : <JoinButton />}
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
      {isMember ? <TextSection /> : null}
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
