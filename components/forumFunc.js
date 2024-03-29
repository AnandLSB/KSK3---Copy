import { Alert } from "react-native";
import {
  collection,
  query,
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  where,
  documentId,
  arrayRemove,
  deleteDoc,
  addDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../config/firebase";
import messaging from "@react-native-firebase/messaging";

const auth = getAuth();

const joinForum = async (forumId) => {
  const collRef = collection(db, "volunteer");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  const q = query(
    collRef,
    where(documentId(), "==", auth.currentUser.uid),
    where("myForums", "array-contains", forumId)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    await updateDoc(userRef, {
      myForums: arrayUnion(forumId),
    })
      .catch((error) => {
        console.log(error);
      })
      .then(() => {
        messaging()
          .subscribeToTopic(forumId)
          .then(() => {
            console.log("Subscribed to topic: " + forumId);
          });
        Alert.alert("Joined Forum");
      });
  } else {
    Alert.alert("You are already a member of this forum");
  }
};

const leaveForum = async (forumId) => {
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  await updateDoc(userRef, {
    myForums: arrayRemove(forumId),
  })
    .then(() => {
      messaging()
        .unsubscribeFromTopic(forumId)
        .then(() => {
          console.log("Unsubscribed from topic: " + forumId);
        });
    })
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      Alert.alert("You have successfully left the forum!");
    });
};

const updateForumPost = async (forumId, newContent) => {
  await updateDoc(doc(db, "forumPost", forumId), {
    content: newContent,
  })
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      Alert.alert("Post Updated!");
    });
};

const deleteForumPost = async (forumId) => {
  await deleteDoc(doc(db, "forumPost", forumId))
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      Alert.alert("Post Deleted!");
    });
};

const addForumPost = async (postText, forumId) => {
  const forumPostRef = collection(db, "forumPost");
  const forumRef = doc(db, "forums", forumId);
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  await getDoc(userRef).then((userDoc) => {
    addDoc(forumPostRef, {
      content: postText,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser.uid,
      forumId: forumId,
      username: userDoc.data().Username,
    })
      .then(() => {
        updateDoc(forumRef, {
          updatedAt: serverTimestamp(),
        });
      })
      .then(console.log("Post Created"))
      .catch((error) => {
        console.error("Error adding document: ", error);
      });
  });
};

const addForum = async (forumTitle, forumDesc) => {
  const forumRef = collection(db, "forums");
  const userRef = doc(db, "volunteer", auth.currentUser.uid);

  await addDoc(forumRef, {
    title: forumTitle.toLowerCase(),
    desc: forumDesc,
    createdBy: auth.currentUser.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
    .then((docRef) => {
      updateDoc(userRef, {
        myForums: arrayUnion(docRef.id),
      });
      messaging().subscribeToTopic(docRef.id);
      console.log("Subscribed to topic: " + docRef.id);
    })
    .catch((error) => {
      console.error("Error adding document: ", error);
    })
    .then(() => {
      Alert.alert("Forum Created!");
    });
};

const editForum = async (forumId, newTitle, newDesc) => {
  await updateDoc(doc(db, "forums", forumId), {
    title: newTitle,
    desc: newDesc,
  })
    .catch((error) => {
      console.log(error);
    })
    .then(() => {
      Alert.alert("Forum Information Updated!");
    });
};

const deleteForum = async (forumId) => {
  const forumPostRef = collection(db, "forumPost");
  const volunteerRef = collection(db, "volunteer");
  const qForumPost = query(forumPostRef, where("forumId", "==", forumId));
  const qMyForum = query(
    volunteerRef,
    where("myForums", "array-contains", forumId)
  );

  await getDocs(qForumPost)
    .then((querySnapshot) => {
      querySnapshot.forEach((docPost) => {
        deleteDoc(doc(db, "forumPost", docPost.id));
      });
    })
    .then(() => {
      deleteDoc(doc(db, "forums", forumId));
    })
    .then(() => {
      getDocs(qMyForum).then((querySnapshot) => {
        querySnapshot.forEach((docUser) => {
          updateDoc(doc(db, "volunteer", docUser.id), {
            myForums: arrayRemove(forumId),
          });
        });
      });

      messaging().unsubscribeFromTopic(forumId);
      console.log("Unsubscribed from topic: " + forumId);
    })
    .catch(() => {
      console.log("Error deleting forum");
    })
    .then(() => {
      Alert.alert("Forum Deleted!");
    });
};

const createForumReport = async (forumId, reportText) => {
  const forumReportRef = collection(db, "reportedForums");

  await addDoc(forumReportRef, {
    forumId: forumId,
    reportText: reportText,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
  })
    .catch((error) => {
      console.error("Error adding document: ", error);
    })
    .then(() => {
      Alert.alert("Forum Reported!");
    });
};

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

export {
  joinForum,
  leaveForum,
  deleteForumPost,
  updateForumPost,
  addForumPost,
  addForum,
  editForum,
  deleteForum,
  createForumReport,
  getForumAuthor,
  getJoinedStatus,
};
