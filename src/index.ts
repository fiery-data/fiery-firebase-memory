
export namespace firebase
{

  export const SDK_VERSION: string = 'FFM-0.0.1'

  export const apps: firebase.app.App[] = []

  const appsMap: { [name: string]: firebase.app.App } = obj()

  const DEFAULT_APP_NAME: string = '[DEFAULT]'

  export function initializeApp(config: object, name?: string)
  {
    const desiredName = name || DEFAULT_APP_NAME

    if (desiredName in appsMap)
    {
      return appsMap[desiredName]
    }

    const newApp = new firebase.app.App(config, desiredName)

    appsMap[desiredName] = newApp
    apps.push(newApp)

    return newApp
  }

  export function app(name?: string): firebase.app.App
  {
    return appsMap[name || DEFAULT_APP_NAME]
  }

  export namespace app
  {
    export class App
    {
      public readonly name: string
      public readonly options: object

      firebase_: any
      // database_: firebase.database.Database
      firestore_: firebase.firestore.Firestore

      public constructor (options: object, name: string)
      {
        this.options = options
        this.name = name
        this.firebase_ = firebase
      }

      public auth ()
      {
        throw 'firebase.app.App.auth is not supported'
      }

      public database () //: firebase.database.Database
      {
        /*
        if (!this.database_)
        {
          this.database_ = new firebase.database.Database(this)
        }

        return this.database_
        */
      }

      public firestore (): firebase.firestore.Firestore
      {
        if (!this.firestore_)
        {
          this.firestore_ = new firebase.firestore.Firestore(this)
        }

        return this.firestore_
      }

      public delete ()
      {
        throw 'firebase.app.App.delete is not supported'
      }

      public messaging ()
      {
        throw 'firebase.app.App.messaging is not supported'
      }

      public storage ()
      {
        throw 'firebase.app.App.storage is not supported'
      }
    }
  }

  export function firestore(nameOrApp?: string | firebase.app.App): firebase.firestore.Firestore
  {
    const app: firebase.app.App =
      nameOrApp instanceof firebase.app.App
      ? nameOrApp as firebase.app.App
      : firebase.app(nameOrApp)

    return app.firestore()
  }

  export namespace firestore
  {

    type Off = () => any

    type ListenerMap = { [path: string]: Function[] }

    type DocsMap = { [path: string]: any }

    type CollectionsMap = { [path: string]: string[] }

    type QuerySnapshotObserver = (querySnapshot: QuerySnapshot) => any

    type QuerySnapshotError = (error: any) => any

    export type QueryDocumentSnapshot = DocumentSnapshot

    type SnapshotObserver = (snapshot: firebase.firestore.DocumentSnapshot) => any

    type SnapshotError = (error: any) => any

    type ChangeType = 'added' | 'modified' | 'removed'


    export class Firestore
    {
      public readonly app: firebase.app.App

      _docs: DocsMap
      _collections: CollectionsMap
      _listeners: ListenerMap
      _settings: Settings

      public constructor (app: firebase.app.App)
      {
        this.app = app
        this._docs = obj()
        this._collections = obj()
        this._listeners = obj()
      }

      public batch (): WriteBatch
      {
        throw 'firebase.firestore.Firestore.batch is not supported'
      }

      public collection (collectionPath: string): CollectionReference
      {
        return new CollectionReference(this, collectionPath)
      }

      public doc (documentPath: string): DocumentReference
      {
        return new DocumentReference(this, documentPath)
      }

      public disableNetwork (): firebase.Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.disableNetwork is not supported'
      }

      public enableNetwork (): firebase.Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.enableNetwork is not supported'
      }

      public enablePersistence (): firebase.Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.enablePersistence is not supported'
      }

      public setLogLevel (logLevel: string): void
      {
        // TODO

        throw 'firebase.firestore.Firestore.setLogLevel is not supported'
      }

      public runTransaction (updateFunction: (transaction: Transaction) => Promise<any>): firebase.Promise<any>
      {
        const trans = new Transaction()

        return updateFunction(trans)
      }

      public settings (settings: Settings): void
      {
        this._settings = settings
      }

      dataAt (path: string, create: boolean = false)
      {
        if (!(path in this._docs) && create)
        {
          this._docs[path] = obj()

          const { id, parentPath } = parsePath(path)
          let collection: string[] = this._collections[parentPath]

          if (!collection)
          {
            collection = this._collections[parentPath] =  []
          }

          if (collection.indexOf(id) === -1)
          {
            collection.push(id)
          }
        }

        return this._docs[path]
      }

      dataAtRemove (path: string)
      {
        const { id, parentPath } = parsePath(path)
        const collection: string[] = this._collections[parentPath]

        delete this._docs[path]

        if (collection)
        {
          const dataIndex: number = collection.indexOf(id)

          if (dataIndex !== -1)
          {
            collection.splice(dataIndex, 1)

            if (collection.length === 0)
            {
              delete this._collections[parentPath]
            }
          }
        }
      }

      documentsAt (path: string, create: boolean = false)
      {
        if (!(path in this._collections) && create)
        {
          this._collections[path] = []
        }

        return this._collections[path]
      }

      documentsAtRemove (path: string)
      {
        delete this._collections[path]
      }

      listenersAt (path: string)
      {
        if (!(path in this._listeners)) {
          this._listeners[path] = []
        }
        return this._listeners[path]
      }

      listenersAtAdd (path: string, listener: any)
      {
        this.listenersAt(path).push(listener)
      }

      listenersAtRemove (path: string, listener: any)
      {
        const listeners = this.listenersAt(path)
        const index = listeners.indexOf(listener)

        if (index !== -1) {
          listeners.splice(index, 1)
        }
        if (listeners.length === 0) {
          delete this._listeners[path]
        }
      }

      notifyAt (path: string)
      {
        this.listenersAt(path).forEach(listener => listener())
      }
    }

    export class Query
    {
      public readonly firestore: Firestore

      readonly _path: string
      _orderBy: OrderBy[] = []
      _startAfter: any[] = []
      _startAt: any[] = []
      _endAt: any[] = []
      _endBefore: any[] = []
      _where: Where[] = []
      _limit: number = Number.MAX_VALUE

      public constructor (firestore: Firestore, path: string)
      {
        this.firestore = firestore
        this._path = path
      }

      public endAt (...snapshotOrVarArgs: any[]): Query
      {
        return this.extend(q => q._endAt = q._endAt.concat(snapshotOrVarArgs))
      }

      public endBefore (...snapshotOrVarArgs: any[]): Query
      {
        return this.extend(q => q._endBefore = q._endBefore.concat(snapshotOrVarArgs))
      }

      public startAfter (...snapshotOrVarArgs: any[]): Query
      {
        return this.extend(q => q._startAfter = q._startAfter.concat(snapshotOrVarArgs))
      }

      public startAt (...snapshotOrVarArgs: any[]): Query
      {
        return this.extend(q => q._startAt = q._startAt.concat(snapshotOrVarArgs))
      }

      public limit (limit: number): Query
      {
        return this.extend(q => q._limit = limit)
      }

      public orderBy (fieldPath: string, directionStr: string = 'asc'): Query
      {
        return this.extend(q => q._orderBy.push(new OrderBy(fieldPath, directionStr)))
      }

      public where (fieldPath: string, operationStr: string, value: any): Query
      {
        return this.extend(q => q._where.push(new Where(fieldPath, operationStr, value)))
      }

      public get (options?: GetOptions): firebase.Promise<QuerySnapshot>
      {
        const promise = new firebase.Promise<QuerySnapshot>()

        promise.resolve(new QuerySnapshot(this, [], this.getResults()))

        return promise
      }

      public onSnapshot (
        optionsOrObserverOrOnNext: QueryListenOptions | QuerySnapshotObserver,
        observerOrOnNextOrOnError?: QuerySnapshotObserver | QuerySnapshotError,
        onError?: QuerySnapshotError): Off
      {
        const options: QueryListenOptions | undefined = (
          !isFunction(optionsOrObserverOrOnNext)
          ? optionsOrObserverOrOnNext
          : undefined)
        const observer: QuerySnapshotObserver = (
          isFunction(optionsOrObserverOrOnNext)
          ? optionsOrObserverOrOnNext
          : observerOrOnNextOrOnError) as QuerySnapshotObserver
        const errored: QuerySnapshotError | undefined = (
          isFunction(optionsOrObserverOrOnNext)
          ? observerOrOnNextOrOnError
          : onError)

        let prev = this.getResults()
        let snapshot = new QuerySnapshot(this, [], prev)

        observer(snapshot)

        const update = () =>
        {
          let next = this.getResults()
          let nextSnapshot = new QuerySnapshot(this, prev, next)

          if (!nextSnapshot.isEqual(snapshot))
          {
            snapshot = nextSnapshot
            prev = next
            observer(snapshot)
          }
        }

        this.firestore.listenersAtAdd(this._path, update)

        const off: Off = () =>
        {
          this.firestore.listenersAtRemove(this._path, update)
        }

        return off
      }

      extend (modify?: (copy: Query) => any): Query
      {
        const e = new Query(this.firestore, this._path)

        e._where = this._where.slice()
        e._orderBy = this._orderBy.slice()
        e._startAfter = this._startAfter.slice()
        e._startAt = this._startAt.slice()
        e._endBefore = this._endBefore.slice()
        e._endAt = this._endAt.slice()
        e._limit = this._limit

        if (modify) modify(e)

        return e
      }

      getResults (): QueryDocumentSnapshot[]
      {
        const parentPath = this._path + PATH_SEPARATOR
        const snapshots: QueryDocumentSnapshot[] = []
        const documents = this.firestore.documentsAt(this._path)

        if (!documents)
        {
          return snapshots
        }

        for (let id of documents)
        {
          const ref: DocumentReference = this.firestore.doc(parentPath + id)
          const doc: QueryDocumentSnapshot = ref.snapshot()
          const where: Where[] = this._where

          if (where.length === 0)
          {
            snapshots.push(doc)
          }
          else
          {
            let match: boolean = true

            for (var i = 0; match && i < where.length; i++)
            {
              if (!where[i].matches(doc))
              {
                match = false
              }
            }

            if (match)
            {
              snapshots.push(doc)
            }
          }
        }

        let start: number = 0
        let end: number = Math.min(this._limit, snapshots.length)

        const orderBy: OrderBy[] = this._orderBy

        if (orderBy.length)
        {
          snapshots.sort((a: QueryDocumentSnapshot, b: QueryDocumentSnapshot) =>
          {
            let compareTo: number = 0

            for (let i = 0; i < orderBy.length; i++)
            {
              compareTo = orderBy[i].compare(a, b)

              if (compareTo !== 0)
              {
                break
              }
            }

            return compareTo
          })

          const startAt: any[] = this._startAt
          const startAfter: any[] = this._startAfter
          const endAt: any[] = this._endAt
          const endBefore: any[] = this._endBefore

          for (let i = 0; i < orderBy.length; i++)
          {
            const orderFieldPath: string = orderBy[i]._fieldPath

            if (i < startAt.length)
            {
              start = Math.max(start, findMarker(snapshots, orderFieldPath, startAt[i]))
            }

            if (i < startAfter.length)
            {
              start = Math.max(start, findMarker(snapshots, orderFieldPath, startAfter[i], findLastIndex) + 1)
            }

            if (i < endAt.length)
            {
              const endAtIndex: number = findMarker(snapshots, orderFieldPath, endAt[i])

              if (endAtIndex >= 0)
              {
                end = Math.min(end, endAtIndex)
              }
            }

            if (i < endBefore.length)
            {
              const endBeforeIndex: number = findMarker(snapshots, orderFieldPath, endBefore[i]) - 1

              if (endBeforeIndex >= 0)
              {
                end = Math.min(end, endBeforeIndex)
              }
            }
          }
        }

        if (start >= end)
        {
          return []
        }

        if (start > 0)
        {
          snapshots.splice(0, start)
        }

        const limit: number = end - start

        if (limit !== snapshots.length)
        {
          snapshots.splice(limit, snapshots.length - limit)
        }

        return snapshots
      }
    }

    export class FieldValue
    {
      public readonly compute: (existing: any) => any

      public constructor(compute: (existing: any) => any)
      {
        this.compute = compute
      }

      public static arrayRemove (...values: any[]): FieldValue
      {
        return new FieldValue(existing =>
        {
          if (!isArray(existing))
          {
            return existing
          }

          let copy = existing.slice()

          for (let i = 0; i < values.length; i++)
          {
            let valueIndex = copy.indexOf(values[i])

            if (valueIndex !== -1)
            {
              copy.splice(valueIndex, 1)
            }
          }

          return copy
        })
      }

      public static arrayUnion (...values: any[]): FieldValue
      {
        return new FieldValue(existing =>
        {
          if (!isArray(existing))
          {
            return existing
          }

          let copy = existing.slice()

          for (let i = 0; i < values.length; i++)
          {
            let valueIndex = copy.indexOf(values[i])

            if (valueIndex === -1)
            {
              copy.push(values[i])
            }
          }

          return copy
        })
      }

      public static delete (): FieldValue
      {
        return new FieldValue(existing => undefined)
      }

      public static serverTimestamp (): FieldValue
      {
        return new FieldValue(existing => new Date())
      }
    }

    export class DocumentSnapshot
    {
      public readonly exists: boolean
      public readonly id: string
      public readonly metadata: SnapshotMetadata = { fromCache: true, hasPendingWrites: false }
      public readonly ref: DocumentReference

      readonly _data: any

      public constructor (id: string, data: any, ref: DocumentReference)
      {
        this.id = id
        this.exists = !!data
        this.ref = ref
        this._data = data
      }

      public data (): any
      {
        return this._data
      }

      public get (fieldPath: string): any
      {
        return accessor(this._data, fieldPath, FIELD_SEPERATOR).get()
      }

      public isEqual (other: DocumentSnapshot): boolean
      {
        return this.ref.path === other.ref.path && equals(this._data, other._data)
      }
    }

    export class QuerySnapshot
    {
      public readonly docs: QueryDocumentSnapshot[]
      public readonly empty: boolean
      public readonly metadata: SnapshotMetadata = { fromCache: true, hasPendingWrites: false }
      public readonly query: Query
      public readonly size: number

      readonly _prev: QueryDocumentSnapshot[]
      readonly _next: QueryDocumentSnapshot[]

      public constructor (query: Query, prev: QueryDocumentSnapshot[], next: QueryDocumentSnapshot[])
      {
        this.query = query
        this.docs = next
        this.empty = next.length > 0
        this.size = next.length
        this._prev = prev
        this._next = next
      }

      public docChanges (): DocumentChange[]
      {
        const changes: DocumentChange[] = []

        for (let i = 0; i < this._next.length; i++)
        {
          const doc: QueryDocumentSnapshot = this._next[i]
          const newIndex: number = i
          const oldIndex: number = this._prev.findIndex(prev => prev.id === doc.id)

          if (oldIndex === -1)
          {
            changes.push({ doc, newIndex, oldIndex, type: 'added' })
          }
          else if (oldIndex !== newIndex || !doc.isEqual(this._prev[oldIndex]))
          {
            changes.push({ doc, newIndex, oldIndex, type: 'modified' })
          }
        }

        for (let i = 0; i < this._prev.length; i++)
        {
          const doc: QueryDocumentSnapshot = this._prev[i]
          const newIndex: number = this._next.findIndex(next => next.id === doc.id)
          const oldIndex: number = i

          if (newIndex === -1)
          {
            changes.push({ doc, newIndex, oldIndex, type: 'removed' })
          }
        }

        return changes
      }

      public forEach (callback: (snapshot: QueryDocumentSnapshot, index: number) => any, thisArg?: any)
      {
        this._next.forEach(callback.bind(thisArg))
      }

      public isEqual (other: QuerySnapshot): boolean
      {
        const a: QueryDocumentSnapshot[] = this.docs
        const b: QueryDocumentSnapshot[] = other.docs

        if (a.length !== b.length)
        {
          return false
        }

        for (let i = 0; i < a.length; i++)
        {
          if (!a[i].isEqual(b[i]))
          {
            return false
          }
        }

        return true
      }
    }

    export class CollectionReference extends Query
    {
      public readonly id: string

      readonly _documentPath: string

      public constructor (firestore: Firestore, path: string)
      {
        const { id, parentPath } = parsePath(path)

        super(firestore, path)

        this.id = id
        this._documentPath = parentPath
      }

      public get parent (): DocumentReference
      {
        return this.firestore.doc(this._documentPath)
      }

      public doc (documentPath?: string): DocumentReference
      {
        return this.firestore.doc(this._path + PATH_SEPARATOR + (documentPath || newId()))
      }

      public add (data: any): firebase.Promise<DocumentReference>
      {
        return this.doc().set(data)
      }

      public isEqual (other: CollectionReference): boolean
      {
        return other._path === this._path
      }
    }

    export class DocumentReference
    {
      public readonly firestore: Firestore
      public readonly id: string
      public readonly path: string

      readonly _collectionPath: string

      public constructor (firestore: Firestore, documentPath: string)
      {
        const { id, parentPath } = parsePath(documentPath)

        this.firestore = firestore
        this.path = documentPath
        this.id = id
        this._collectionPath = parentPath
      }

      public get parent (): CollectionReference
      {
        return this.firestore.collection(this._collectionPath)
      }

      public collection (collectionPath: string): CollectionReference
      {
        return this.firestore.collection(this.path + PATH_SEPARATOR + collectionPath)
      }

      public set (data: any, options?: SetOptions): firebase.Promise<DocumentReference>
      {
        if (!options || !options.merge)
        {
          this.clearValues()
        }

        this.applyValues(data)
        this.notify()

        return new firebase.Promise<DocumentReference>().resolve(this)
      }

      public delete (): firebase.Promise<void>
      {
        if (this.firestore.dataAt(this.path))
        {
          this.clearValues()
          this.notify()
        }

        return new firebase.Promise<void>().resolve(void 0)
      }

      public update (data: any): firebase.Promise<void>
      {
        this.applyValues(data)
        this.notify()

        return new firebase.Promise<void>().resolve(void 0)
      }

      public get (options?: GetOptions): firebase.Promise<DocumentSnapshot>
      {
        return new firebase.Promise<DocumentSnapshot>().resolve(this.snapshot())
      }

      public onSnapshot (
        optionsOrObserverOrOnNext: SnapshotListenOptions | SnapshotObserver,
        observerOrOnNextOrOnError?: SnapshotObserver | SnapshotError,
        onError?: SnapshotError): Off
      {
        const options: SnapshotListenOptions | undefined = (
          !isFunction(optionsOrObserverOrOnNext)
          ? optionsOrObserverOrOnNext
          : undefined)
        const observer: SnapshotObserver = (
          isFunction(optionsOrObserverOrOnNext)
          ? optionsOrObserverOrOnNext
          : observerOrOnNextOrOnError) as SnapshotObserver
        const errored: SnapshotError | undefined = (
          isFunction(optionsOrObserverOrOnNext)
          ? observerOrOnNextOrOnError
          : onError)

        const update = () =>
        {
          observer(this.snapshot())
        }

        update()

        this.firestore.listenersAtAdd(this.path, update)

        const off = () =>
        {
          this.firestore.listenersAtRemove(this.path, update)
        }

        return off
      }

      clearValues (): void
      {
        this.firestore.dataAtRemove(this.path)
      }

      applyValues (values: any): void
      {
        const data: any = this.firestore.dataAt(this.path, true)

        for (let prop in values)
        {
          const access: Accessor = accessor(data, prop, FIELD_SEPERATOR)
          const prev: any = access.get()
          const next: any = parseValue(prev, values[prop])

          if (next === undefined)
          {
            access.delete()
          }
          else
          {
            access.set(next)
          }
        }
      }

      notify (): void
      {
        this.firestore.notifyAt(this._collectionPath)
        this.firestore.notifyAt(this.path)
      }

      snapshot (): DocumentSnapshot
      {
        return new DocumentSnapshot(this.id, copyData(this.firestore.dataAt(this.path)), this)
      }

    }

    export class FieldPath
    {

    }

    export class GeoPoint
    {
      public latitude: number
      public longitude: number

      public constructor (latitude: number, longitude: number)
      {
        this.latitude = latitude
        this.longitude = longitude
      }

      public isEqual (other: GeoPoint): boolean
      {
        return this.latitude === other.latitude
            && this.longitude === other.longitude
      }
    }

    export class Timestamp
    {

      readonly _seconds: number
      readonly _nanoseconds: number

      public constructor (seconds: number, nanoseconds: number = 0)
      {
        this._seconds = seconds
        this._nanoseconds = nanoseconds
      }

      public toMillis (): number
      {
        return this._seconds * 1000 + Math.floor(this._nanoseconds * 0.000001)
      }

      public toDate (): Date
      {
        return new Date(this.toMillis())
      }

      public static fromMillis (millis: number): Timestamp
      {
        return new Timestamp(Math.floor(millis / 1000), millis * 1000000)
      }

      public static fromDate (date: Date): Timestamp
      {
        return this.fromMillis(date.getTime())
      }

      public static now (): Timestamp
      {
        return this.fromMillis(Date.now())
      }
    }

    export class Transaction
    {
      // TODO
    }

    export class WriteBatch
    {
      // TODO
    }

    export interface QueryListenOptions
    {
      includeDocumentMetadataChanges?: boolean
      includeQueryMetadataChanges?: boolean
    }

    export interface SnapshotMetadata
    {
      fromCache: boolean
      hasPendingWrites: boolean
    }

    export interface Settings
    {
      timestampsInSnapshots?: boolean
    }

    export interface GetOptions
    {
      source?: 'default' | 'server' | 'client'
    }

    export interface SetOptions
    {
      merge?: boolean
    }

    export interface SnapshotOptions
    {
      serverTimestamps?: 'estimate' | 'previous' | 'none'
    }

    export interface DocumentChange
    {
      doc: DocumentSnapshot
      type: ChangeType
      newIndex: number
      oldIndex: number
    }

    export interface SnapshotListenOptions
    {
      includeMetadataChanges?: boolean
    }

    class Where
    {
      readonly _fieldPath: string
      readonly _opStr: string
      readonly _value: any

      public constructor (fieldPath: string, opStr: string, value: any)
      {
        this._fieldPath = fieldPath
        this._opStr = opStr
        this._value = value
      }

      public matches (doc: DocumentSnapshot): boolean
      {
        const val: any = doc.get(this._fieldPath)

        if (val === undefined)
        {
          return false
        }

        switch (this._opStr)
        {
          case '==':
            return compare(this._value, val) === 0
          case '>=':
            return compare(this._value, val) >= 0
          case '>':
            return compare(this._value, val) > 0
          case '<=':
            return compare(this._value, val) <= 0
          case '<':
            return compare(this._value, val) < 0
          case 'array-contains':
          case 'array_contains':
            return isArray(val) && val.indexOf(this._value) !== -1
        }

        return false
      }
    }

    class OrderBy
    {
      readonly _fieldPath: string
      readonly _directionStr: string

      public constructor (fieldPath: string, directionStr: string)
      {
        this._fieldPath = fieldPath
        this._directionStr = directionStr
      }

      public compare (a: DocumentSnapshot, b: DocumentSnapshot): number
      {
        const aval: any = a.get(this._fieldPath)
        const bval: any = b.get(this._fieldPath)
        const comparison: number = compare(aval, bval)

        return this._directionStr === 'asc' ? comparison : -comparison
      }
    }

    function parseValue (existing: any, value: any): any
    {
      return value instanceof firebase.firestore.FieldValue
        ? value.compute(existing)
        : value
    }

    function findMarker(snapshots: DocumentSnapshot[], fieldPath: string, marker: any,
      alternativeFind?: (snapshots: DocumentSnapshot[], test: ArrayTest<DocumentSnapshot>) => number)
    {
      if (marker instanceof firebase.firestore.DocumentSnapshot)
      {
        return snapshots.findIndex(snap => snap.ref.path === marker.ref.path)
      }
      else
      {
        const test = (snap: DocumentSnapshot) => equals(snap.get(fieldPath), marker)

        return alternativeFind ? alternativeFind(snapshots, test) : snapshots.findIndex(test)
      }
    }
  }


  export class Promise<T>
  {
    _kept: boolean = false
    _resolve: OnResolve<T>[] = []
    _reject: OnReject[] = []
    _resolved: T
    _error: Error

    public constructor (resolver?: (resolve: OnResolve<T>, reject: OnReject) => any)
    {
      if (resolver)
      {
        resolver(this.resolve.bind(this), this.reject.bind(this))
      }
    }

    public resolve (resolved: T): this
    {
      if (!this._kept)
      {
        this._kept = true
        this._resolved = resolved
        this._resolve.forEach(resolve => resolve(resolved))
        this._resolve.length = 0
        this._reject.length = 0
      }

      return this
    }

    public reject (error: Error): this
    {
      if (!this._kept)
      {
        this._kept = true
        this._error = error
        this._reject.forEach(reject => reject(error))
        this._reject.length = 0
        this._resolve.length = 0
      }

      return this
    }

    public then (resolve: OnResolve<T>): this
    {
      if (!isFunction(resolve))
      {
        return this;
      }

      if (!this._kept)
      {
        this._resolve.push(resolve)
      }
      else if (!this._error)
      {
        resolve(this._resolved)
      }

      return this
    }

    public catch (reject: OnReject): this
    {
      if (!isFunction(reject))
      {
        return this;
      }

      if (!this._kept)
      {
        this._reject.push(reject)
      }
      else if (this._error)
      {
        reject(this._error)
      }

      return this
    }
  }

  const PATH_SEPARATOR: string = '/'

  const FIELD_SEPERATOR: string = '.'

  interface Accessor
  {
    get (create?: boolean): any

    set (value: any): any

    delete (): any
  }

  type OnResolve<T> = (resolved: T) => any

  type OnReject = (error: Error) => any

  type ArrayTest<T> = (item: T, index: number) => boolean

  function isNumber (x: any): x is number
  {
    return typeof x === 'number'
  }

  function isString (x: any): x is string
  {
    return typeof x === 'string'
  }

  function isBoolean (x: any): x is boolean
  {
    return typeof x == 'boolean'
  }

  function isFunction (x: any): x is Function
  {
    return typeof x == 'function'
  }

  function isObject (x: any): x is any
  {
    return typeof x === 'object'
  }

  function isDefined (x?: any): boolean
  {
    return typeof x !== 'undefined'
  }

  function isValue (x?: any): boolean
  {
    return x !== null && typeof x !== 'undefined'
  }

  function isArray<T> (x: any): x is Array<T>
  {
    return x instanceof Array
  }

  function isDate (x: any): x is Date
  {
    return x instanceof Date
  }

  function obj (): any
  {
    return Object.create(null)
  }

  function sign (a: number): number
  {
    return a < 0 ? -1 : (a > 0 ? 1 : 0)
  }

  function compare (a: any, b: any): number
  {
    if (a === b) return 0
    if (a === undefined) return 1
    if (b === undefined) return -1

    if (isNumber(a) && isNumber(b))
    {
      return sign(a - b)
    }

    if (isDate(a) && isDate(b))
    {
      return sign(a.getTime() - b.getTime())
    }

    if (isString(a) && isString(b))
    {
      return a.localeCompare(b)
    }

    if (isBoolean(a) && isBoolean(b))
    {
      return ((a ? 1 : 0) - (b ? 1 : 0))
    }

    return 0
  }

  function equals (a: any, b: any)
  {
    if (compare(a, b) !== 0)
    {
      return false
    }

    if (a === b)
    {
      return true
    }

    const ta: string = typeof a
    const tb: string = typeof b

    if (ta !== tb)
    {
      return false
    }

    if (isDate(a) && isDate(b))
    {
      return a.getTime() === b.getTime()
    }

    if (isArray(a) && isArray(b))
    {
      if (a.length !== b.length)
      {
        return false
      }

      for (let i = 0; i < a.length; i++)
      {
        if (!equals(a[i], b[i]))
        {
          return false
        }
      }

      return true
    }

    if (ta === 'object')
    {
      for (let prop in a)
      {
        if (!(prop in b) || !equals(a[prop], b[prop]))
        {
          return false
        }
      }

      for (let prop in b)
      {
        if (!(prop in a))
        {
          return false
        }
      }

      return true
    }

    return false
  }

  function accessor (data: any, fieldPath: string, seperator: string | RegExp): Accessor
  {
    const parts: string[] = fieldPath.split(seperator)
    const last: string = parts[parts.length - 1]

    return {
      get (): any
      {
        let value: any = data

        for (let i = 0; i < parts.length; i++)
        {
          const p: string = parts[i]

          if (!p) continue

          if (!value || !(p in value))
          {
            return undefined
          }

          value = value[p]
        }

        return value
      },

      set (value: any)
      {
        let curr: any = data

        for (let i = 0; i < parts.length - 1; i++)
        {
          const p: string = parts[i]

          if (!p) continue

          if (!(p in curr))
          {
            curr[p] = {}
          }

          curr = curr[p]
        }

        curr[last] = value
      },

      delete (): any
      {
        let curr: any = data

        for (let i = 0; i < parts.length - 1; i++)
        {
          const p: string = parts[i]

          if (!p) continue

          if (!curr || !(p in curr))
          {
            return undefined
          }

          curr = curr[p]
        }

        if (!curr)
        {
          return undefined
        }

        const deleting = curr[last]

        delete curr[last]

        return deleting
      }
    }
  }

  function newId (): string
  {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let autoId = '';

    for (let i = 0; i < 20; i++)
    {
      autoId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return autoId
  }

  function parsePath (path: string): { parentPath: string, id: string }
  {
    const parts: string[] = path.split(PATH_SEPARATOR)
    const id: string = parts.pop() as string
    const parentPath: string = parts.join(PATH_SEPARATOR)

    return { id, parentPath }
  }

  function copyData (data: any): any
  {
    let copy = data

    if (isDate(data))
    {
      copy = new Date(data.getTime())
    }
    else if (isArray(data))
    {
      copy = data.map(copyData)
    }
    else if (isObject(data))
    {
      copy = obj()

      for (var prop in data)
      {
        copy[prop] = copyData(data[prop])
      }
    }

    return copy
  }

  function findLastIndex<T>(array: T[], test: ArrayTest<T>): number
  {
    for (let index = array.length - 1; index >= 0; index--)
    {
      if (test(array[index], index))
      {
        return index
      }
    }

    return -1
  }

}

export default firebase
