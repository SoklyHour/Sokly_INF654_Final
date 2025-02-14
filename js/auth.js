import { auth } from "./firebaseDB.js"; // Now auth is correctly imported
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { loadTasks, syncTasks } from "./ui.js";

export let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");

  // Check if the user is authenticated
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in.
      currentUser = user;
      console.log("User ID: ", user.uid);
      console.log("Email: ", user.email);
      console.log("Name: ", user.displayName);

      if (logoutBtn) {
        logoutBtn.style.display = "block";
      }
      loadTasks();
      syncTasks();
    } else {
      // No user is signed in.
      console.log("No user is currently signed in.");
      // If the user is not signed in, redirect to the auth page
      window.location.href = "/auth.html";
    }
  });

  // Handle logout functionality
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        M.toast({ html: "Logout successful!" });
        logoutBtn.style.display = "none";
        window.location.href = "/auth.html";
      } catch (error) {
        M.toast({ html: error.message });
      }
    });
  }
});
