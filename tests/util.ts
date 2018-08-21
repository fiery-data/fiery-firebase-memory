
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
