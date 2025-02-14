// Import the functions you need from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { currentUser } from "./auth.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTwGX_CQ81d3b5cdfIDKVyHeNp-SmQeOg",
  authDomain: "tracker-61a00.firebaseapp.com",
  projectId: "tracker-61a00",
  storageBucket: "tracker-61a00.firebasestorage.app",
  messagingSenderId: "366967901447",
  appId: "1:366967901447:web:5376661214d9d9762b89a2",
  measurementId: "G-3EW1W0MM8X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Firebase Auth
const auth = getAuth(app);

// Export auth and firestore functions
export { auth, db };

export async function addTaskToFirebase(task) {
  try {
    if(!currentUser){
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    console.log("userID: ", userId)
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {email: currentUser.email}, {merge:true});

    const tasksRef = collection(userRef, "tasks");

    const docRef = await addDoc(tasksRef, task);
    return { id: docRef.id, ...task };
  } catch (e) {
    console.error("Error adding task: ", e);
  }
}

export async function getTasksFromFirebase() {
  const tasks = [];
  try {
    if(!currentUser){
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    const taskRef = collection(doc, (db,"users", userId), "tasks")
    const querySnapshot = await getDocs(taskRef);
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
  } catch (e) {
    console.error("Error retrieving tasks: ", e);
  }
  return tasks;
}

export async function deleteTaskFromFirebase(id) {
  try {
    if(!currentUser){
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    await deleteDoc(doc(db, "users", userId, "tasks", id));
  } catch (e) {
    console.error("Error deleting task: ", e);
  }
}

export async function updateTaskInFirebase(id, updatedData) {
  console.log(updatedData, id);
  try {
    if(!currentUser){
      throw new Error("User is not authenticated");
    }
    const userId = currentUser.uid;
    const taskRef = doc(db, "users", userId, "tasks", id);
    await updateDoc(taskRef, updatedData);
  } catch (e) {
    console.error("Error updating task: ", e);
  }
}
