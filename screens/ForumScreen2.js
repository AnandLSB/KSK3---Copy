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
import { addForumPost, leaveForum, joinForum } from "../components/forumFunc";
import { getAuth } from "firebase/auth";
import { useNavigation, StackActions } from "@react-navigation/native";

const ForumScreen2 = ({ route }) => {
  let forumId = route.params.forumId;
  const auth = getAuth();
  const navigation = useNavigation();
  //Member State
  const [isMember, setIsMember] = React.useState(false);

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

  const Message = ({ item }) => {
    return (
      <Card>
        <View>
          <Text>{item.content}</Text>
          <Text>Created By: {item.createdBy}</Text>
        </View>
      </Card>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.section}>
        <Text>ForumScreen2</Text>
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
