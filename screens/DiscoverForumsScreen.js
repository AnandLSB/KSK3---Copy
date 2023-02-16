import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
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
import { SearchBar } from "../components/search";
import { capitalizeWords } from "../components/activityFunc";

const DiscoverForumsScreen = () => {
  console.log("DiscoverForumsScreen");
  const auth = getAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [forums, setForums] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  /*
  useLayoutEffect(() => {
    const forumsRef = collection(db, "forums");
    const qForum = query(forumsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(qForum, (qSnapshot) => {
      const forums = [];

      qSnapshot.forEach((docFor) => {
        Promise.all([
          getForumAuthor(docFor.data().createdBy),
          getJoinedStatus(docFor.id),
        ]).then((values) => {
          forums.push({
            ...docFor.data(),
            id: docFor.id,
            createdBy: values[0],
            joined: values[1],
            createdAt: docFor
              .data({ serverTimestamps: "estimate" })
              .createdAt.toDate(),
          });
        });
      });
      setForums(forums);
    });

    return () => unsubscribe();
  }, []);
  */
  useLayoutEffect(() => {
    const forumsRef = collection(db, "forums");
    const qForum = query(forumsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(qForum, async (qSnapshot) => {
      const forums = [];

      for (const doc of qSnapshot.docs) {
        const joined = await getJoinedStatus(doc.id);
        const author = await getForumAuthor(doc.data().createdBy);

        forums.push({
          ...doc.data(),
          id: doc.id,
          createdBy: author,
          joined: joined,
          createdAt: doc
            .data({ serverTimestamps: "estimate" })
            .createdAt.toDate(),
        });
      }

      setForums(forums);
    });

    if (loading) setLoading(false);

    return () => unsubscribe();
  }, []);

  forums?.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  const getForumAuthor = async (userID) => {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar type={"forums"} setForums={setForums} />

      {forums === null ? (
        <Card>
          <Text>No results</Text>
        </Card>
      ) : (
        <FlatList
          data={forums}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("ForumDetails", {
                  forumId: item.id,
                  forumTitle: item.title,
                  createdBy: item.createdBy,
                });
              }}
            >
              <Card>
                <View>
                  <Text style={{ fontWeight: "bold" }}>
                    {capitalizeWords(item.title)}
                  </Text>
                  <Text>{item?.desc}</Text>
                  <Text>Created by: {item.createdBy}</Text>
                </View>
                <View style={styles.buttonCont}>
                  {item.joined ? null : <JoinButton forumId={item.id} />}
                </View>
              </Card>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      )}
    </View>
  );
};

export default DiscoverForumsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 5,
  },
  buttonOutlineText: {
    color: "black",
    fontWeight: "700",
    fontSize: 14,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 5,
    width: "85%",
  },
  buttonCont: {
    justifyContent: "center",
    alignItems: "center",
  },
});
