import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getDatabase} from 'firebase/database';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDa3_Bfm5ZztHLp62bjE0wDZ_H_PFJp4Ys",
    authDomain: "max-for-ceo.firebaseapp.com",
    projectId: "max-for-ceo",
    storageBucket: "max-for-ceo.appspot.com",
    messagingSenderId: "474517012693",
    appId: "1:474517012693:web:a4eacac670c74afd03625c",
    measurementId: "G-8K6VY0JSWR"
  };
  const firebaseApp = initializeApp(firebaseConfig);

  const storage = getStorage(firebaseApp);
  const db = getDatabase(firebaseApp);
  const analytics = getAnalytics(firebaseApp);
  export { storage,db };
