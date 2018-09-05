
export namespace firebase
{

  export const SDK_VERSION: string = 'FFM-0.0.4'

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
      public readonly options: Object

      firebase_: any
      // database_: firebase.database.Database
      firestore_: firebase.firestore.Firestore | undefined

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

      public delete (): Promise<any>
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

  export function firestore(app?: firebase.app.App): firebase.firestore.Firestore
  {
    return (app || firebase.app()).firestore()
  }

  export namespace firestore
  {

    type Off = () => any

    type ListenerMap = { [path: string]: Function[] }

    type DocsMap = { [path: string]: any }

    type CollectionsMap = { [path: string]: string[] }

    type QuerySnapshotObserver = (querySnapshot: QuerySnapshot) => void

    type QuerySnapshotError = (error: any) => any

    export type QueryDocumentSnapshot = DocumentSnapshot

    type SnapshotObserver = (snapshot: DocumentSnapshot) => void

    type SnapshotError = (error: any) => any

    type DocumentChangeType = 'added' | 'modified' | 'removed'

    type WhereFilterOp = '<' | '<=' | '==' | '>=' | '>' | 'array-contains' | 'array_contains'

    type OrderByDirection = 'desc' | 'asc'

    type DocumentData = { [field: string]: any }

    type UpdateData = { [fieldPath: string]: any }

    type LogLevel = 'debug' | 'error' | 'silent'

    const defaultMetadata: SnapshotMetadata =
    {
      fromCache:  false,
      hasPendingWrites: false,

      isEqual (other: SnapshotMetadata): boolean
      {
        return this.fromCache === other.fromCache
            && this.hasPendingWrites === other.hasPendingWrites
      }
    }

    export class Firestore
    {
      public readonly app: firebase.app.App

      _docs: DocsMap
      _collections: CollectionsMap
      _listeners: ListenerMap
      _settings: Settings | undefined

      public constructor (app: firebase.app.App)
      {
        this.app = app
        this._docs = obj()
        this._collections = obj()
        this._listeners = obj()

        this.INTERNAL =
        {
          delete: () =>
          {
            this._docs = obj()
            this._collections = obj()
            this._listeners = obj()

            return Promise.resolve()
          }
        }
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

      public disableNetwork (): Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.disableNetwork is not supported'
      }

      public enableNetwork (): Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.enableNetwork is not supported'
      }

      public enablePersistence (): Promise<void>
      {
        // TODO

        throw 'firebase.firestore.Firestore.enablePersistence is not supported'
      }

      public setLogLevel (logLevel: LogLevel): void
      {
        // TODO

        throw 'firebase.firestore.Firestore.setLogLevel is not supported'
      }

      public runTransaction<T> (updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>
      {
        const trans = new Transaction()

        return updateFunction(trans)
      }

      public settings (settings: Settings): void
      {
        this._settings = settings
      }

      INTERNAL: { delete: () => Promise<void> }

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

      public endAt (snapshot: DocumentSnapshot): Query
      public endAt (...fieldValues: any[]): Query
      {
        return this.extend(q => {
          if (fieldValues instanceof DocumentSnapshot) {
            q._endAt.push(fieldValues)
          } else {
            q._endAt = q._endAt.concat(fieldValues)
          }
        })
      }

      public endBefore (snapshot: DocumentSnapshot): Query
      public endBefore (...fieldValues: any[]): Query
      {
        return this.extend(q => {
          if (fieldValues instanceof DocumentSnapshot) {
            q._endBefore.push(fieldValues)
          } else {
            q._endBefore = q._endBefore.concat(fieldValues)
          }
        })
      }

      public startAfter (snapshot: DocumentSnapshot): Query
      public startAfter (...fieldValues: any[]): Query
      {
        return this.extend(q => {
          if (fieldValues instanceof DocumentSnapshot) {
            q._startAfter.push(fieldValues)
          } else {
            q._startAfter = q._startAfter.concat(fieldValues)
          }
        })
      }

      public startAt (snapshot: DocumentSnapshot): Query
      public startAt (...fieldValues: any[]): Query
      {
        return this.extend(q => {
          if (fieldValues instanceof DocumentSnapshot) {
            q._startAt.push(fieldValues)
          } else {
            q._startAt = q._startAt.concat(fieldValues)
          }
        })
      }

      public limit (limit: number): Query
      {
        return this.extend(q => q._limit = limit)
      }

      public orderBy (fieldPath: string, directionStr: OrderByDirection = 'asc'): Query
      {
        return this.extend(q => q._orderBy.push(new OrderBy(fieldPath, directionStr)))
      }

      public where (fieldPath: string, operationStr: WhereFilterOp, value: any): Query
      {
        return this.extend(q => q._where.push(new Where(fieldPath, operationStr, value)))
      }

      public get (options?: GetOptions): Promise<QuerySnapshot>
      {
        return Promise.resolve(new QuerySnapshot(this, [], this.getResults()))
      }

      public isEqual (other: Query): boolean
      {
        return false // TODO
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
        let end: number = snapshots.length

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

        if (end !== snapshots.length && this._limit)
        {
          start = snapshots.length - this._limit
        }

        if (start > 0)
        {
          snapshots.splice(0, start)
        }

        const limit: number = Math.min(end - start, this._limit)

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

      public isEqual (other: FieldValue): boolean
      {
        return false
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
      public readonly metadata: SnapshotMetadata = defaultMetadata
      public readonly ref: DocumentReference

      readonly _data: any

      public constructor (id: string, data: any, ref: DocumentReference)
      {
        this.id = id
        this.exists = !!data
        this.ref = ref
        this._data = data
      }

      public data (options?: SnapshotOptions): DocumentData | undefined
      {
        return this._data
      }

      public get (fieldPath: string | FieldPath, options?: SnapshotOptions): any
      {
        return accessor(this._data, fieldPath as string, FIELD_SEPERATOR).get()
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
      public readonly metadata: SnapshotMetadata = defaultMetadata
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
            changes.push({ doc: doc.ref.snapshot(), newIndex, oldIndex, type: 'removed' })
          }
        }

        return changes
      }

      public forEach (callback: (snapshot: QueryDocumentSnapshot) => void, thisArg?: any)
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
      public readonly path: string

      readonly _documentPath: string

      public constructor (firestore: Firestore, path: string)
      {
        const { id, parentPath } = parsePath(path)

        super(firestore, path)

        this.id = id
        this.path = path
        this._documentPath = parentPath
      }

      public get parent (): DocumentReference | null
      {
        return this._documentPath ? this.firestore.doc(this._documentPath) : null
      }

      public doc (documentPath?: string): DocumentReference
      {
        return this.firestore.doc(this._path + PATH_SEPARATOR + (documentPath || newId()))
      }

      public add (data: DocumentData): Promise<DocumentReference>
      {
        const doc = this.doc()
        const setPromise = doc.set(data)

        return new Promise((resolve, reject) => {
          setPromise
            .then(() => resolve(doc))
            .catch((error) => reject(error))
        })
      }

      public isEqual (other: CollectionReference): boolean
      {
        return other.path === this.path
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

      public isEqual (other: DocumentReference): boolean
      {
        return this.path === other.path
      }

      public set (data: DocumentData, options?: SetOptions): Promise<void>
      {
        if (!options || !options.merge)
        {
          this.clearValues()
        }

        this.applyValues(data)
        this.notify()

        return Promise.resolve()
      }

      public delete (): Promise<void>
      {
        if (this.firestore.dataAt(this.path))
        {
          this.clearValues()
          this.notify()
        }

        return Promise.resolve()
      }

      public update (field: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Promise<void>
      public update (data: UpdateData): Promise<void>
      {
        this.applyValues(data)
        this.notify()

        return Promise.resolve()
      }

      public get (options?: GetOptions): Promise<DocumentSnapshot>
      {
        return Promise.resolve(this.snapshot())
      }

      public onSnapshot (
        optionsOrObserverOrOnNext: DocumentListenOptions | SnapshotObserver,
        observerOrOnNextOrOnError?: SnapshotObserver | SnapshotError,
        onError?: SnapshotError): Off
      {
        const options: DocumentListenOptions | undefined = (
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

      applyValues (values: UpdateData | DocumentData): void
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
      public constructor(...fieldNames: string[])
      {

      }

      public isEqual (other: FieldPath): boolean
      {
        return false // TODO
      }

      public static documentId (): FieldPath
      {
        return new FieldPath()
      }
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

      readonly seconds: number
      readonly nanoseconds: number

      public constructor (seconds: number, nanoseconds: number = 0)
      {
        this.seconds = seconds
        this.nanoseconds = nanoseconds
      }

      public toMillis (): number
      {
        return this.seconds * 1000 + Math.floor(this.nanoseconds * 0.000001)
      }

      public toDate (): Date
      {
        return new Date(this.toMillis())
      }

      public isEqual (other: Timestamp): boolean
      {
        return this.seconds === other.seconds
            && this.nanoseconds === other.nanoseconds
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
      public get (documentRef: DocumentReference): Promise<DocumentSnapshot>
      {
        throw 'firebase.firestore.Transaction.get not supported'
      }

      public set (documentRef: DocumentReference, data: DocumentData, options?: SetOptions): Transaction
      {
        throw 'firebase.firestore.Transaction.set not supported'
      }

      public update (documentRef: DocumentReference, fieldOrData: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Transaction
      {
        throw 'firebase.firestore.Transaction.update not supported'
      }

      public delete (documentRef: DocumentReference): Transaction
      {
        throw 'firebase.firestore.Transaction.delete not supported'
      }
    }

    export class WriteBatch
    {
      public set (documentRef: DocumentReference, data: DocumentData, options?: SetOptions): WriteBatch
      {
        throw 'firebase.firestore.WriteBatch.set not supported'
      }

      public update (documentRef: DocumentReference, fieldOrData: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Transaction
      {
        throw 'firebase.firestore.WriteBatch.update not supported'
      }

      public delete (documentRef: DocumentReference): Transaction
      {
        throw 'firebase.firestore.WriteBatch.delete not supported'
      }

      public commit (): Promise<void>
      {
        throw 'firebase.firestore.WriteBatch.commit not supported'
      }
    }

    export interface QueryListenOptions
    {
      readonly includeDocumentMetadataChanges?: boolean
      readonly includeQueryMetadataChanges?: boolean
    }

    export interface SnapshotMetadata
    {
      readonly fromCache: boolean
      readonly hasPendingWrites: boolean

      isEqual(other: SnapshotMetadata): boolean
    }

    export interface Settings
    {
      host?: string
      ssl?: boolean
      timestampsInSnapshots?: boolean
    }

    export interface GetOptions
    {
      readonly source?: 'default' | 'server' | 'client'
    }

    export interface SetOptions
    {
      readonly merge?: boolean
    }

    export interface SnapshotOptions
    {
      readonly serverTimestamps?: 'estimate' | 'previous' | 'none'
    }

    export interface DocumentChange
    {
      readonly doc: QueryDocumentSnapshot
      readonly type: DocumentChangeType
      readonly newIndex: number
      readonly oldIndex: number
    }

    export interface SnapshotListenOptions
    {
      includeMetadataChanges?: boolean
    }

    export interface DocumentListenOptions
    {
      readonly includeMetadataChanges?: boolean
    }

    class Where
    {
      readonly _fieldPath: string
      readonly _opStr: WhereFilterOp
      readonly _value: any

      public constructor (fieldPath: string, opStr: WhereFilterOp, value: any)
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
      readonly _directionStr: OrderByDirection

      public constructor (fieldPath: string, directionStr: OrderByDirection)
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

  /* use ES6 Promise

  class Deferred<T, R>
  {
    resolve: Resolver<R, any>
    reject: Rejecter
    next: Promise<R>
    callback: Resolver<T, R>

    constructor(callback: Resolver<T, R>)
    {
      this.callback = callback
      this.resolve = () => {}
      this.reject = () => {}

      this.next = new Promise<R>((resolve, reject) => {
        this.resolve = resolve
        this.reject = reject
      })
    }

    resolved (value: T): void
    {
      let result = this.callback(value)

      if (result instanceof Promise)
      {
        result.then(nextValue => {
          this.resolve(nextValue)
        })

        result.catch(nextError => {
          this.reject(nextError)
        })
      }
    }

    rejected (reason: Error): void
    {
      this.reject(reason)
    }
  }

  export class Promise<T>
  {
    _done: boolean = false
    _resolved: boolean = false
    _value: T | undefined
    _error: Error | undefined
    _rejecters: Rejecter[] = []
    _nexts: Deferred<T, any>[] = []

    public constructor (callback: (resolve: Resolver<T, any>, reject: Rejecter) => void)
    {
      callback(
        value => {
          if (!this._done) {
            this._done = true
            this._resolved = true
            this._value = value
            this._nexts.forEach(next => next.resolved(value))
          }
        },
        error => {
          if (!this._done) {
            this._done = true
            this._error = error
            this._nexts.forEach(next => next.rejected(error))
            this._rejecters.forEach(reject => reject(error))
          }
        }
      )
    }

    public then<R> (resolve: Resolver<T, R>): Promise<R>
    {
      const deferred = new Deferred<T, R>(resolve)

      if (this._done)
      {
        if (this._resolved)
        {
          deferred.resolved(this._value as T)
        }
      }
      else
      {
        this._nexts.push(deferred)
      }

      return deferred.next
    }

    public catch (reject: Rejecter): this
    {
      if (this._done)
      {
        if (!this._resolved)
        {
          reject(this._error as Error)
        }
      }
      else
      {
        this._rejecters.push(reject)
      }

      return this
    }

    public static resolve<T> (resolved?: T): Promise<T>
    public static resolve<T> (resolved: T): Promise<T>
    {
      return new Promise<T>((resolve, reject) => {
        resolve(resolved)
      })
    }

    public static reject<T> (reason?: Error): Promise<T>
    public static reject<T> (reason: Error): Promise<T>
    {
      return new Promise<T>((resolve, reject) => {
        reject(reason)
      })
    }

    public static all<T> (promises: Promise<T>[]): Promise<T>
    {
      return new Promise<T>((resolve, reject) =>
      {
        let completed = 0

        promises.forEach(p =>
        {
          p.then(resolved =>
          {
            if (++completed === promises.length) {
              resolve(resolved)
            }
          })

          p.catch(reject)
        })
      })
    }
  }
  */

  const PATH_SEPARATOR: string = '/'

  const FIELD_SEPERATOR: string = '.'

  interface Accessor
  {
    get (create?: boolean): any

    set (value: any): any

    delete (): any
  }

  type Resolver<T, R> = (value: T) => void | Promise<R>

  type Rejecter = (reason: Error) => void

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

    if (isBoolean(data) || !isValue(data) || isString(data) || isNumber(data))
    {
      return data
    }
    else if (isDate(data))
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


/*
namespace firebase
{

  export function database(nameOrApp?: string | firebase.app.App)
  {
    const app: firebase.app.App =
      nameOrApp instanceof firebase.app.App
      ? nameOrApp as firebase.app.App
      : firebase.app(nameOrApp)

    return app.database();
  }

  export namespace database
  {

    type DataMap = { [path: string]: any }

    type PriorityMap = { [path: string]: Priority }

    type DisconnectCallback = () => any

    type KeyValue = { key?: string, value: number | string | boolean | null }

    type SnapshotCallback = (snapshot: DataSnapshot, prevChildKey?: string) => any

    type EventType = 'value' | 'child_added' | 'child_removed' | 'child_changed' | 'child_moved'

    type OnComplete = (error?: Error) => any

    type Priority = string | number | null

    type TransactionResult = { committed: boolean, snapshot: null | DataSnapshot }

    type EventListenersMap = { [T in EventType]: { [path: string]: SnapshotCallback[] } }


    export class Database
    {
      public readonly app: firebase.app.App

      _data: DataMap
      _priority: PriorityMap
      _disconnect: DisconnectCallback[]
      _listeners: EventListenersMap

      public constructor (app: firebase.app.App)
      {
        this.app = app
        this._data = obj()
        this._priority = obj()
        this._disconnect = []
        this._listeners = obj()
        this._listeners['value'] = obj()
        this._listeners['child_added'] = obj()
        this._listeners['child_removed'] = obj()
        this._listeners['child_changed'] = obj()
        this._listeners['child_moved'] = obj()
      }

      public goOffline (): void
      {
        this._disconnect.forEach(d => d())
        this._disconnect = []
      }

      public goOnline (): void
      {
        throw 'firebase.database.Database.goOnline is not supported'
      }

      public refFromURL (url: string): Reference
      {
        throw 'firebase.database.Database.refFromURL is not supported'
      }

      public ref (path: string | null = null): Reference
      {
        return new Reference(this, path)
      }

      notifyAt (type: EventType, path: string | null, snapshot: DataSnapshot, prevChildKey?: string)
      {
        const byType = this._listeners[type]
        const callbacks = byType[path || '']

        if (isArray(callbacks))
        {
          callbacks.forEach(call => call(snapshot, prevChildKey))
        }
      }

      listenersAt (type: EventType, path: string | null, create: boolean = false)
      {
        const byType = this._listeners[type]
        let callbacks = byType[path || '']

        if (!callbacks && create)
        {
          callbacks = byType[path || ''] = []
        }

        return callbacks
      }

      accessAt (path: string | null): Accessor
      {
        return {
          get (): any
          {

          },
          set (value: any)
          {

          },
          delete ()
          {

          }
        }
        // return accessor(this._data, path || '', PATH_SEPARATOR)
      }

      dataAt (path: string | null, create: boolean = false, defaultValue?: any): any
      {
        if (path === null)
        {
          return this._data
        }

        const access: Accessor = accessor(this._data, path, PATH_SEPARATOR)
        let data: any = access.get()

        if (!isValue(data) && create)
        {
          const value: any = isDefined(defaultValue)
            ? defaultValue
            : obj()

          access.set(data = value)
        }

        return data
      }

      dataAtRemove (path: string | null): void
      {
        if (path === null)
        {
          this._data = obj()
        }
        else
        {
          const access: Accessor = accessor(this._data, path, PATH_SEPARATOR)

          access.delete()
        }
      }

      priorityAt (path: string | null): Priority
      {
        return this._priority[path || '']
      }

      priorityAtSet (path: string | null, priority: Priority): void
      {
        this._priority[path || ''] = priority
      }

      priorityAtRemove (path: string | null): void
      {
        delete this._priority[path || '']
      }

      addDisconnect (disconnect: DisconnectCallback): DisconnectCallback
      {
        this._disconnect.push(disconnect)

        return disconnect
      }

      removeDisconnect (disconnect: DisconnectCallback): void
      {
        const i: number = this._disconnect.indexOf(disconnect)

        if (i !== -1) this._disconnect.splice(i, 1)
      }
    }

    export class Query
    {

      public readonly ref: Reference

      _endAt: KeyValue[] = []
      _startAt: KeyValue[] = []
      _equalTo: KeyValue[] = []
      _limitToFirst: number = -1
      _limitToLast: number = -1
      _orderByChild: string
      _orderByKey: boolean = false
      _orderByPriority: boolean = false
      _orderByValue: boolean = false

      public constructor(ref?: Reference)
      {
        this.ref = (ref || this) as Reference
      }

      public endAt (value: any, key?: string): Query
      {
        return this.extend(q => q._endAt.push({value, key}))
      }

      public startAt (value: any, key?: string): Query
      {
        return this.extend(q => q._startAt.push({value, key}))
      }

      public equalTo (value: any, key?: string): Query
      {
        return this.extend(q => q._equalTo.push({value, key}))
      }

      public limitToFirst (limit: number): Query
      {
        return this.extend(q => q._limitToFirst = limit)
      }

      public limitToLast (limit: number): Query
      {
        return this.extend(q => q._limitToLast = limit)
      }

      public orderByChild (path: string): Query
      {
        return this.extend(q => q._orderByChild = path)
      }

      public orderByKey (): Query
      {
        return this.extend(q => q._orderByKey = true)
      }

      public orderByPriority (): Query
      {
        return this.extend(q => q._orderByPriority = true)
      }

      public orderByValue (): Query
      {
        return this.extend(q => q._orderByValue = true)
      }

      public off (eventType?: EventType, callback?: SnapshotCallback, context?: any): void
      {
        // TODO
      }

      public on (eventType: EventType, callback: SnapshotCallback, cancelCallbackOrContext?: (error: Error) => any | object, context?: object): SnapshotCallback
      {
        // TODO

        const handler: SnapshotCallback = (snapshot: DataSnapshot) =>
        {
          // TODO
        }

        return handler
      }

      public once (eventType: EventType, callback?: SnapshotCallback, failureCallbackOrContext?: (error: Error) => any | object, context?: object): Promise<DataSnapshot>
      {
        const promise = new Promise<DataSnapshot>()
        const handler = this.on(eventType, (snapshot, key) =>
        {
          if (callback)
          {
            callback.call(context, snapshot, key)
          }

          promise.resolve(snapshot)

          this.off(eventType, handler)

        }, failureCallbackOrContext, context)

        return promise
      }

      public toJSON (): object
      {
        throw 'firebase.database.Query.toJSON is not supported'
      }

      public toString (): string | null
      {
        return this.ref.toString()
      }

      extend(modify?: (query: Query) => any): Query
      {
        const q = new Query(this.ref)

        q._startAt = this._startAt.slice()
        q._endAt = this._endAt.slice()
        q._equalTo = this._endAt.slice()
        q._limitToFirst = this._limitToFirst
        q._limitToLast = this._limitToLast
        q._orderByChild = this._orderByChild
        q._orderByKey = this._orderByKey
        q._orderByPriority = this._orderByPriority
        q._orderByValue = this._orderByValue

        if (modify) modify(q)

        return q
      }

    }


    export class Reference extends Query
    {
      public readonly key: string | null

      readonly _database: Database
      readonly _path: string | null
      readonly _parentPath: string | null

      public constructor(database: Database, path: string | null = null)
      {
        const { id, parentPath } = path ? parsePath(path) : { id: null, parentPath: null }

        super()

        this.key = id
        this._path = path
        this._database = database
        this._parentPath = parentPath
      }

      public get parent (): Reference | null
      {
        return this._parentPath ? this._database.ref(this._parentPath) : null
      }

      public get root (): Reference
      {
        return this._database.ref()
      }

      public child (path: string): Reference
      {
        return this._database.ref(this._path + PATH_SEPARATOR + path)
      }

      public toString (): string | null
      {
        return this._path
      }

      public isEqual (other: Reference): boolean
      {
        return this._path === other._path
      }

      public onDisconnect (): OnDisconnect
      {
        return new OnDisconnect(this)
      }

      public push (value: any, onComplete?: OnComplete): ThenableReference
      {
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.Reference#push

        return new ThenableReference(this._database, this._path)
      }

      public set (value: any, onComplete?: OnComplete): Promise<void>
      {
        if (!isValue(value))
        {
          return this.remove(onComplete)
        }

        this._database.priorityAtRemove(this._path)
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.Reference#set

        return this.getCompletePromise(onComplete)
      }

      public update (values: any, onComplete?: OnComplete): Promise<void>
      {
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.Reference#update

        return this.getCompletePromise(onComplete)
      }

      public remove (onComplete?: OnComplete): Promise<void>
      {
        const db = this._database
        db.priorityAtRemove(this._path)
        db.dataAtRemove(this._path)

        return this.getCompletePromise(onComplete)
      }

      public setWithPriority (newVal: any, newPriority: Priority, onComplete?: OnComplete): Promise<void>
      {
        const setPromise = this.set(newVal, onComplete)

        const db = this._database
        db.priorityAtSet(this._path, newPriority)

        return setPromise
      }

      public setPriority (priority: Priority, onComplete?: OnComplete): Promise<void>
      {
        const db = this._database
        db.priorityAtSet(this._path, priority)

        return this.getCompletePromise(onComplete)
      }

      public transaction (transactionUpdate: (value: any) => any, onComplete?: OnComplete, applyLocally: boolean = true): Promise<TransactionResult>
      {
        const data = this._database.dataAt(this._path)
        const updated = transactionUpdate(data)
        const snapshot = this.snapshot(updated)
        const committed = true
        const result = { committed, snapshot }

        this.set(updated)

        return new Promise<TransactionResult>().resolve(result)
      }

      getCompletePromise (onComplete?: OnComplete): Promise<void>
      {
        return new Promise<void>()
          .then(onComplete as (resolved: void) => any)
          .catch(onComplete as (error: Error) => any)
          .resolve(void 0)
      }

      snapshot (data?: any): DataSnapshot | null
      {
        return new DataSnapshot(this, data)
      }
    }

    export class DataSnapshot
    {
      public readonly key: string | null
      public readonly ref: Reference

      readonly _data: any

      public constructor(ref: Reference, data?: any)
      {
        this.ref = ref
        this.key = ref.key
        this._data = data || ref._database.dataAt(ref._path)
      }

      public child (path: string): DataSnapshot
      {
        return new DataSnapshot(this.ref.child(path))
      }

      public exists (): boolean
      {
        return isDefined(this._data)
      }

      public exportVal (): any
      {
        return this._data
      }

      public val (): any
      {
        return this._data
      }

      public forEach (action: (snapshot: DataSnapshot) => any): boolean
      {
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.DataSnapshot#forEach

        return false
      }

      public getPriority (): Priority
      {
        return this.ref._database._priority[this.ref._path as string]
      }

      public hasChild (path: string): boolean
      {
        return this._data && path in this._data
      }

      public hasChildren (): boolean
      {
        if (!this._data)
        {
          return false
        }

        for (let prop in this._data)
        {
          if (isValue(this._data[prop]))
          {
            return true
          }
        }

        return false
      }

      public numChildren (): number
      {
        let num: number = 0

        if (this._data)
        {
          for (let prop in this._data)
          {
            if (isValue(this._data[prop]))
            {
              num++
            }
          }
        }

        return num
      }

      public toJSON (): object
      {
        return this._data as object
      }
    }

    export class ThenableReference extends Reference
    {
      public constructor(database: Database, path: string | null = null)
      {
        super(database, path)
      }
    }

    export class ServerValue
    {
      public readonly compute: (existing: any) => any

      public constructor(compute: (existing: any) => any)
      {
        this.compute = compute
      }

      public static readonly TIMESTAMP = new ServerValue(() => new Date())
    }

    export class OnDisconnect
    {
      readonly _ref: Reference
      readonly _disconnects: DisconnectCallback[]

      public constructor(ref: Reference)
      {
        this._ref = ref
        this._disconnects = []
      }

      public cancel (onComplete?: OnComplete): Promise<void>
      {
        this._disconnects.forEach(d => this._ref._database.removeDisconnect(d))
        this._disconnects.length = 0

        return this._ref.getCompletePromise(onComplete)
      }

      public remove (onComplete?: OnComplete): Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.remove(onComplete))
      }

      public set (value: any, onComplete?: OnComplete): Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.set(value, onComplete))
      }

      public update (values: any, onComplete?: OnComplete): Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.update(values, onComplete))
      }

      public setWithPriority (newVal: any, newPriority: Priority, onComplete?: OnComplete): Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.setWithPriority(newVal, newPriority, onComplete))
      }

      addDisconnect (onComplete: OnComplete | undefined, action: () => Promise<void>): Promise<void>
      {
        const promise = new Promise<void>()

        const disconnect: DisconnectCallback = () =>
        {
          const innerPromise = action()

          innerPromise.then(resolved =>
          {
            if (onComplete) onComplete()

            return promise.resolve(resolved)
          })

          innerPromise.catch(error =>
          {
            if (onComplete) onComplete(error)

            return promise.reject(error)
          })

          return innerPromise
        }

        this._disconnects.push(this._ref._database.addDisconnect(disconnect))

        return promise
      }
    }
  }
}
*/
