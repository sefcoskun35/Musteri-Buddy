import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAN-Bkxe0tqZC3yZpQpIw_Bj0LQ5uQfGwU",
  authDomain: "musteri-buddy.firebaseapp.com",
  projectId: "musteri-buddy",
  storageBucket: "musteri-buddy.firebasestorage.app",
  messagingSenderId: "395650833082",
  appId: "1:395650833082:web:1b92d7d887b7d928db0083",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);