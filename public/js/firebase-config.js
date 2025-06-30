// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAjZndEPjdJVSrpLl_IPeJrNpkLVco7Vok",
  authDomain: "agroai-c0e2a.firebaseapp.com",
  databaseURL: "https://agroai-c0e2a-default-rtdb.firebaseio.com",
  projectId: "agroai-c0e2a",
  storageBucket: "agroai-c0e2a.appspot.com",
  messagingSenderId: "12326306122",
  appId: "1:12326306122:web:1a0999d84774b2381c41b3",
  
};

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Make `db` accessible globally for other JS files
window.db = firebase.database();
