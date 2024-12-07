// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
require("firebase/app");
import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    onAuthStateChanged,
    User
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCG8BxzoYOoWvxHEwaUz16qzgL1CvuT-L4",
    authDomain: "binni-yt-clone.firebaseapp.com",
    projectId: "binni-yt-clone",
    appId: "1:734812794510:web:97354ab866b36ac9b0a3df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export function signOut() {
    return auth.signOut();
}

export function onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
}