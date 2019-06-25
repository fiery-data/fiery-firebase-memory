
import firebase from '../src'


export function populate(db: firebase.firestore.Firestore, map: any)
{
  for (var path in map)
  {
    const data: any = db.dataAt(path, true)
    const copy: any = map[path]

    for (var prop in copy)
    {
      if (copy.hasOwnProperty(prop))
      {
        data[prop] = copy[prop]
      }
    }
  }
}

export function pluck<T>(querySnapshot: firebase.firestore.QuerySnapshot, fieldPath: string): T[]
{
  let plucked: T[] = []

  querySnapshot.forEach(snap => {
    plucked.push(snap.get(fieldPath))
  })

  return plucked
}

export function handleChanges<E>(target: E[], changes: firebase.firestore.DocumentChange[]): E[]
{
  for (const change of changes) 
  {
    if (change.type !== 'added') 
    {
      target.splice(change.oldIndex, 1)
    }

    if (change.type !== 'removed') 
    {
      target.splice(change.newIndex, 0, change.doc.data() as E)
    }
  }
  
  return target
}
