<p align="center">
  <img src="https://avatars1.githubusercontent.com/u/42543587?s=200&v=4" alt="Fiery Firebase Memory">  
</p>

This is a clone of Firebase Realtime Database & Firestore in TypeScript/JS which stores the data in memory.

**!!! At the moment, only the Firestore code is "fully" developed !!!**

### Installation

`npm install fiery-firebase-memory`

Example with default app (just like normal firebase)

```typescript
import firebase from 'fiery-firebase-memory'

firebase.initializeApp({
  // config for default app - doesn't mean anything for this library
});

var fs = firebase.firestore();

// fs.app is available

fs.doc('path/to/doc')
  .set({ values: 'many', created_at: new Date() });

fs.collection('path/to')
  .where('values', '==', 'many')
  .orderBy('created_at')
  .onSnapshot(querySnapshot => {
    // realtime changes on the results of the query
  })
;
```

Example with named app

```typescript
var app = firebase.initializeApp({ /* config */ }, 'namedApp');
var fs = firebase.firestore('namedApp');
```

### Where can I access the stored data?

- **firestoreInstance.\_docs**: an object of documents where the key is their full path
- **firestoreInstance.\_collections**: an object of collections (array of document ids) where the key is their full path

### Currently Unsupported Functionality

- firebase#database
- firebase.app.App#auth
- firebase.app.App#database
- firebase.app.App#delete
- firebase.app.App#messaging
- firebase.app.App#storage
- firebase.firestore.Firestore#disableNetwork
- firebase.firestore.Firestore#enableNetwork
- firebase.firestore.Firestore#enablePersistence
- firebase.firestore.Firestore#setLogLevel
- firebase.firestore.FieldPath
- firebase.firestore.Transaction
- firebase.firestore.WriteBatch
