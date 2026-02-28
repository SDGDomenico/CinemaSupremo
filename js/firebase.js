import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBEIbxNgUwFjIxGTZkEw3MMlWanzJizCNM",
  authDomain: "cinemasupremo-auth.firebaseapp.com",
  projectId: "cinemasupremo-auth",
  storageBucket: "cinemasupremo-auth.firebasestorage.app",
  messagingSenderId: "1015356833401",
  appId: "1:1015356833401:web:eb4f50abce31a2176d5ea8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);