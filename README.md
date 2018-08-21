
## Fiery Firebase Memory

This is a clone of Firebase Realtime Database & Firestore in TypeScript/JS which stores the data in memory.

### Installation

`npm install fiery-firebase-memory`

Example with default app (just like normal firebase)

```typescript
import firebase from 'fiery-firebase-memory'

firebase.initializeApp({
  // config for default app
});

var db = firebase.firestore();

// db.app is available

db.doc('path/to/doc')
  .set({ values: 'many', created_at: new Date() });

db.collection('path/to')
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
var db = firebase.firestore('namedApp');
```
