import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtexfPj1qoQxlmTKg3o2w7qf5fHC5UqvQ",
  authDomain: "estorm-dota.firebaseapp.com",
  projectId: "estorm-dota",
  storageBucket: "estorm-dota.appspot.com",
  messagingSenderId: "469841919445",
  appId: "1:469841919445:web:42aa55b945073d600f515c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };