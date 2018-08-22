
## Fiery Firebase Memory

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
