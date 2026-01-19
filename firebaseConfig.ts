import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

//TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyAG8q9TrzC4RahkMXMernlHk6F9rCpAC5A",
    authDomain: "fitnessapp-prototype-30690.firebaseapp.com",
    projectId: "fitnessapp-prototype-30690",
    storageBucket: "fitnessapp-prototype-30690.firebasestorage.app",
    messagingSenderId: "366718411288",
    appId: "1:366718411288:web:57775120875b7d9e02d96d",
    measurementId: "G-SE4SW1V38J" // optional
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// export
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});