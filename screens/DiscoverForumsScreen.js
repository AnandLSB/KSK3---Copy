import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useLayoutEffect, useEffect } from "react";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import Card from "../components/card";
import { getAuth } from "firebase/auth";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { joinForum } from "../components/forumFunc";

const DiscoverForumsScreen = () => {
  console.log("DiscoverForumsScreen");
  const auth = getAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [forums, setForums] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  useLayoutEffect(() => {
    const forumsRef = collection(db, "forums");
    const qForum = query(forumsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(qForum, (qSnapshot) => {
      const forums = [];

      qSnapshot.forEach((docFor) => {
        Promise.all([
          getPostAuthor(docFor.data().createdBy),
          getJoinedStatus(docFor.id),
        ]).then((values) => {
          forums.push({
            ...docFor.data(),
            id: docFor.id,
            createdBy: values[0],
            joined: values[1],
            createdAt: docFor.data().createdAt.toDate(),
          });
        });
      });
      setForums(forums);
    });

    return () => unsubscribe();
  }, []);

  forums.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  useEffect(() => {
    setLoading(false);
  }, [isFocused]);

  const getPostAuthor = async (userID) => {
    var author;

    if (userID !== auth.currentUser.uid) {
      const userRef = doc(db, "volunteer", userID);

      await getDoc(userRef).then((userDoc) => {
        author = userDoc.data().Username;
      });
    } else {
      author = "You";
    }

    return author;
  };

  const getJoinedStatus = async (forumID) => {
    const myRef = doc(db, "volunteer", auth.currentUser.uid);
    var joined;

    await getDoc(myRef).then((myDoc) => {
      if (myDoc.data().myForums.includes(forumID)) {
        joined = true;
      } else {
        joined = false;
      }
    });

    return joined;
  };

  const JoinButton = (props) => {
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

  if (loading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View>
      <Text>DiscoverForumsScreen</Text>

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
                <Text>{item.title}</Text>
                <Text>{item.desc}</Text>
                <Text>{item.createdBy}</Text>
                <Text>{JSON.stringify(item.joined)}</Text>
              </View>
              {item.joined ? null : <JoinButton forumId={item.id} />}
            </Card>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default DiscoverForumsScreen;

const styles = StyleSheet.create({});
