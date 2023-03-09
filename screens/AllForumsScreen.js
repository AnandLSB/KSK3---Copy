import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useLayoutEffect } from "react";
import {
  onSnapshot,
  collection,
  query,
  orderBy,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  where,
  documentId,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { getAuth } from "firebase/auth";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { joinForum } from "../components/forumFunc";

const AllForumsScreen = () => {
  console.log("AllForumsScreen");
  const auth = getAuth();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const forumsRef = collection(db, "forums");
  const [forums, setForums] = React.useState([]);
  const [initializing, setInitializing] = React.useState(true);
  const qForum = query(forumsRef, orderBy("createdAt", "desc"));

  useLayoutEffect(() => {
    setInitializing(true);
    getForums();
  }, [isFocused]);

  const getForums = async () => {
    setForums([]);
    var forum = {};
    var joined;
    const querySnapshot = await getDocs(qForum);

    querySnapshot.forEach((docFor) => {
      let userRef = doc(db, "volunteer", docFor.data().createdBy);
      let myRef = doc(db, "volunteer", auth.currentUser.uid);

      getDoc(myRef).then((myInfo) => {
        if (myInfo.data().myForums.includes(docFor.id)) {
          joined = true;
        } else {
          joined = false;
        }
      });

      getDoc(userRef).then((userInfo) => {
        forum = docFor.data();

        if (docFor.data().createdBy === auth.currentUser.uid) {
          forum.createdBy = "You";
        } else {
          if (userInfo.exists()) {
            forum.createdBy = userInfo.data().Username;
          } else {
            forum.createdBy = "Unknown";
          }
        }

        forum.createdAt = docFor
          .data({ serverTimestamps: "estimate" })
          .createdAt.toDate();
        forum.id = docFor.id;
        forum.joined = joined;

        setForums((forums) => [...forums, forum]);
      });
    });

    removeDuplicates(forums);

    setTimeout(() => {
      setInitializing(false);
    }, 900);
  };

  const removeDuplicates = (arr) => {
    let unique = [];
    for (let i = 0; i < arr.length; i++) {
      if (unique.indexOf(arr[i]) === -1) {
        unique.push(arr[i]);
      }
    }
    return unique;
  };

  const JoinButton = (props) => {
    const navigation = useNavigation();
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            joinForum(props.forumId);
            navigation.navigate("ForumDetails", {
              forumId: props.forumId,
            });
          }}
        >
          <Text style={styles.buttonOutlineText}>Join</Text>
        </TouchableOpacity>
      </View>
    );
  };

  forums.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log(forums);

  return (
    <View>
      <Text>AllForumsScreen</Text>
      <FlatList
        data={forums}
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

              {item.joined ? null : <JoinButton forumId={item.id} />}
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default AllForumsScreen;

const styles = StyleSheet.create({
  buttonOutlineText: {
    color: "#0782F9",
    fontWeight: "700",
    fontSize: 16,
  },
});

/*
    const unsubscribe = onSnapshot(qForum, (querySnapshot) => {
      setForums([]);
      var forum = {};

      querySnapshot.forEach((docFor) => {
        let userRef = doc(db, "volunteer", docFor.data().createdBy);

        getDoc(userRef).then((userInfo) => {
          forum = docFor.data();

          if (docFor.data().createdBy === auth.currentUser.uid) {
            forum.createdBy = "You";
          } else {
            forum.createdBy = userInfo.data().Username;
          }

          forum.createdAt = docFor
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate();
          forum.id = docFor.id;

          setForums((forums) => [...forums, forum]);

          removeDuplicates(forums);
        });
      });
    });
    */

//return () => unsubscribe();
