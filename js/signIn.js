// Import the necessary Firebase SDK functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const signInForm = document.getElementById("sign-in-form");
  const signUpForm = document.getElementById("sign-up-form");
  const showSignUp = document.getElementById("show-signup");
  const showSignIn = document.getElementById("show-signin");
  const signInBtn = document.getElementById("sign-in-btn");
  const signUpBtn = document.getElementById("sign-up-btn");

  // Toggle between sign-up and sign-in forms
  showSignIn.addEventListener("click", () => {
    signUpForm.style.display = "none";
    signInForm.style.display = "block";
  });

  showSignUp.addEventListener("click", () => {
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
  });

  // Handle sign-up form submission
  signUpBtn.addEventListener("click", async () => {
    const name = document.getElementById("sign-up-name").value;
    const email = document.getElementById("sign-up-email").value;
    const password = document.getElementById("sign-up-password").value;
    try {
      // Create user with email and password
      const authCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with name
      await updateProfile(authCredential.user, { displayName: name });

      // Save user data to Firestore
      const userDocRef = doc(db, "users", authCredential.user.uid);
      await setDoc(userDocRef, { email: email, name: name });

      // Notify user of successful sign-up
      M.toast({ html: "Sign up successful!" });
      
      // Redirect to home page
      window.location.href = "/";

      // Hide sign-up form and show sign-in form
      signUpForm.style.display = "none";
      signInForm.style.display = "block";
    } catch (e) {
      // Handle errors
      M.toast({ html: e.message });
    }
  });

  // Handle sign-in form submission
  signInBtn.addEventListener("click", async () => {
    const email = document.getElementById("sign-in-email").value;
    const password = document.getElementById("sign-in-password").value;
    try {
      // Sign in user with email and password
      await signInWithEmailAndPassword(auth, email, password);

      // Notify user of successful sign-in
      M.toast({ html: "Sign-in successful!" });
      
      // Redirect to home page
      window.location.href = "/";
    } catch (e) {
      // Handle errors
      console.error("Sign-in error: ", e);
      M.toast({ html: e.message });
    }
  });
});
