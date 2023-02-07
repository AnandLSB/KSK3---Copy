import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
import { format } from "date-fns";

const ForumScreen2 = ({ route }) => {
  let forumId = route.params.forumId;
  const auth = getAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = React.useState(true);

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
        snapshot.docs.map((doc) => {
          const getAuthor = (uid) => {
            if (uid === auth.currentUser.uid) {
              return "You";
            } else {
              return doc.data().username;
            }
          };
          return {
            id: doc.id,
            createdAt: doc
              .data({ serverTimestamps: "estimate" })
              .createdAt.toDate(),
            createdBy: doc.data().createdBy,
            content: doc.data().content,
            username: getAuthor(doc.data().createdBy),
          };
        })
      );

      /*
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
      */
      if (loading) setLoading(false);
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
          <Text style={{ color: "#e55039" }}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const Post = ({ item }) => {
    return (
      <Card>
        <View style={styles.section}>
          <View>
            <View style={{ paddingVertical: 5 }}>
              <Text style={{ fontWeight: "500" }}>
                {item.username} at {format(item.createdAt, "PPp")}
              </Text>
            </View>

            <Text>{item.content}</Text>
          </View>
          {item.createdBy === auth.currentUser.uid ? (
            <ManagePost forumId={item.id} />
          ) : null}
        </View>
      </Card>
    );
  };

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

      <View
        style={[
          styles.section,
          { borderColor: "black", borderWidth: 1, borderRadius: 5 },
        ]}
      >
        <View style={{ padding: 5 }}>
          <Text style={{ fontWeight: "500", fontSize: 15 }}>
            {route.params.forumTitle}
          </Text>
          <Text style={{ fontWeight: "400" }}>
            Created by: {route.params.createdBy}
          </Text>
        </View>

        <View style={{ paddingRight: 5 }}>
          <TouchableOpacity onPress={() => setReportModalVisible(true)}>
            <Text
              style={[
                styles.buttonOutlineText,
                { color: "black", paddingBottom: 5 },
              ]}
            >
              Report
            </Text>
          </TouchableOpacity>
          {isMember ? <LeaveButton /> : <JoinButton />}
        </View>
      </View>

      <FlatList
        data={forumPosts}
        windowSize={5}
        initialNumToRender={10}
        removeClippedSubviews={true}
        renderItem={({ item }) => <Post item={item} />}
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
        <View style={[styles.buttonCont, { paddingRight: 10 }]}>
          <TouchableOpacity
            disabled={!isMember}
            onPress={() => {
              if (postText !== "") {
                addForumPost(postText, forumId);
                setPostText("");
              } else {
                Alert.alert("Empty Field Detected", "Please enter a post");
              }
            }}
          >
            <Text
              style={[
                styles.buttonOutlineText,
                { color: "black", fontSize: 15 },
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ForumScreen2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  input: {
    backgroundColor: "#E9ECEF",
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
    color: "#718093",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
