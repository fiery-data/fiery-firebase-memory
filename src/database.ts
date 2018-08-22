
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

      public once (eventType: EventType, callback?: SnapshotCallback, failureCallbackOrContext?: (error: Error) => any | object, context?: object): firebase.Promise<DataSnapshot>
      {
        const promise = new firebase.Promise<DataSnapshot>()
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

      public set (value: any, onComplete?: OnComplete): firebase.Promise<void>
      {
        if (!isValue(value))
        {
          return this.remove(onComplete)
        }

        this._database.priorityAtRemove(this._path)
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.Reference#set

        return this.getCompletePromise(onComplete)
      }

      public update (values: any, onComplete?: OnComplete): firebase.Promise<void>
      {
        // TODO https://firebase.google.com/docs/reference/js/firebase.database.Reference#update

        return this.getCompletePromise(onComplete)
      }

      public remove (onComplete?: OnComplete): firebase.Promise<void>
      {
        const db = this._database
        db.priorityAtRemove(this._path)
        db.dataAtRemove(this._path)

        return this.getCompletePromise(onComplete)
      }

      public setWithPriority (newVal: any, newPriority: Priority, onComplete?: OnComplete): firebase.Promise<void>
      {
        const setPromise = this.set(newVal, onComplete)

        const db = this._database
        db.priorityAtSet(this._path, newPriority)

        return setPromise
      }

      public setPriority (priority: Priority, onComplete?: OnComplete): firebase.Promise<void>
      {
        const db = this._database
        db.priorityAtSet(this._path, priority)

        return this.getCompletePromise(onComplete)
      }

      public transaction (transactionUpdate: (value: any) => any, onComplete?: OnComplete, applyLocally: boolean = true): firebase.Promise<TransactionResult>
      {
        const data = this._database.dataAt(this._path)
        const updated = transactionUpdate(data)
        const snapshot = this.snapshot(updated)
        const committed = true
        const result = { committed, snapshot }

        this.set(updated)

        return new firebase.Promise<TransactionResult>().resolve(result)
      }

      getCompletePromise (onComplete?: OnComplete): firebase.Promise<void>
      {
        return new firebase.Promise<void>()
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

      public cancel (onComplete?: OnComplete): firebase.Promise<void>
      {
        this._disconnects.forEach(d => this._ref._database.removeDisconnect(d))
        this._disconnects.length = 0

        return this._ref.getCompletePromise(onComplete)
      }

      public remove (onComplete?: OnComplete): firebase.Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.remove(onComplete))
      }

      public set (value: any, onComplete?: OnComplete): firebase.Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.set(value, onComplete))
      }

      public update (values: any, onComplete?: OnComplete): firebase.Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.update(values, onComplete))
      }

      public setWithPriority (newVal: any, newPriority: Priority, onComplete?: OnComplete): firebase.Promise<void>
      {
        return this.addDisconnect(onComplete, () => this._ref.setWithPriority(newVal, newPriority, onComplete))
      }

      addDisconnect (onComplete: OnComplete | undefined, action: () => firebase.Promise<void>): firebase.Promise<void>
      {
        const promise = new firebase.Promise<void>()

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
