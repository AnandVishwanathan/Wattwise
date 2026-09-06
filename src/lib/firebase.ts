import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTXHpJTWiOnzzz9fum09cTM7xvsFMYEcs",
  authDomain: "oose-project-f8602.firebaseapp.com",
  projectId: "oose-project-f8602",
  storageBucket: "oose-project-f8602.firebasestorage.app",
  messagingSenderId: "788481265257",
  appId: "1:788481265257:web:de7210a2c8b579bc751cf8",
  measurementId: "G-CHSTXC6C3E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
