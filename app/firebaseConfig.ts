import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

//TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
    apiKey: "AIzaSyBK_E7v5GlFo_el9rqhFq5zRquHIQSjSRc",
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
export const auth = getAuth(app);