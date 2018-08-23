export declare namespace firebase {
    const SDK_VERSION: string;
    const apps: firebase.app.App[];
    function initializeApp(config: object, name?: string): app.App;
    function app(name?: string): firebase.app.App;
    namespace app {
        class App {
            readonly name: string;
            readonly options: object;
            firebase_: any;
            firestore_: firebase.firestore.Firestore | undefined;
            constructor(options: object, name: string);
            auth(): void;
            database(): void;
            firestore(): firebase.firestore.Firestore;
            delete(): void;
            messaging(): void;
            storage(): void;
        }
    }
    function firestore(nameOrApp?: string | firebase.app.App): firebase.firestore.Firestore;
    namespace firestore {
        type Off = () => any;
        type ListenerMap = {
            [path: string]: Function[];
        };
        type DocsMap = {
            [path: string]: any;
        };
        type CollectionsMap = {
            [path: string]: string[];
        };
        type QuerySnapshotObserver = (querySnapshot: QuerySnapshot) => any;
        type QuerySnapshotError = (error: any) => any;
        type QueryDocumentSnapshot = DocumentSnapshot;
        type SnapshotObserver = (snapshot: firebase.firestore.DocumentSnapshot) => any;
        type SnapshotError = (error: any) => any;
        type ChangeType = 'added' | 'modified' | 'removed';
        class Firestore {
            readonly app: firebase.app.App;
            _docs: DocsMap;
            _collections: CollectionsMap;
            _listeners: ListenerMap;
            _settings: Settings | undefined;
            constructor(app: firebase.app.App);
            batch(): WriteBatch;
            collection(collectionPath: string): CollectionReference;
            doc(documentPath: string): DocumentReference;
            disableNetwork(): firebase.Promise<void>;
            enableNetwork(): firebase.Promise<void>;
            enablePersistence(): firebase.Promise<void>;
            setLogLevel(logLevel: string): void;
            runTransaction(updateFunction: (transaction: Transaction) => Promise<any>): firebase.Promise<any>;
            settings(settings: Settings): void;
            dataAt(path: string, create?: boolean): any;
            dataAtRemove(path: string): void;
            documentsAt(path: string, create?: boolean): string[];
            documentsAtRemove(path: string): void;
            listenersAt(path: string): Function[];
            listenersAtAdd(path: string, listener: any): void;
            listenersAtRemove(path: string, listener: any): void;
            notifyAt(path: string): void;
        }
        class Query {
            readonly firestore: Firestore;
            readonly _path: string;
            _orderBy: OrderBy[];
            _startAfter: any[];
            _startAt: any[];
            _endAt: any[];
            _endBefore: any[];
            _where: Where[];
            _limit: number;
            constructor(firestore: Firestore, path: string);
            endAt(...snapshotOrVarArgs: any[]): Query;
            endBefore(...snapshotOrVarArgs: any[]): Query;
            startAfter(...snapshotOrVarArgs: any[]): Query;
            startAt(...snapshotOrVarArgs: any[]): Query;
            limit(limit: number): Query;
            orderBy(fieldPath: string, directionStr?: string): Query;
            where(fieldPath: string, operationStr: string, value: any): Query;
            get(options?: GetOptions): firebase.Promise<QuerySnapshot>;
            onSnapshot(optionsOrObserverOrOnNext: QueryListenOptions | QuerySnapshotObserver, observerOrOnNextOrOnError?: QuerySnapshotObserver | QuerySnapshotError, onError?: QuerySnapshotError): Off;
            extend(modify?: (copy: Query) => any): Query;
            getResults(): QueryDocumentSnapshot[];
        }
        class FieldValue {
            readonly compute: (existing: any) => any;
            constructor(compute: (existing: any) => any);
            static arrayRemove(...values: any[]): FieldValue;
            static arrayUnion(...values: any[]): FieldValue;
            static delete(): FieldValue;
            static serverTimestamp(): FieldValue;
        }
        class DocumentSnapshot {
            readonly exists: boolean;
            readonly id: string;
            readonly metadata: SnapshotMetadata;
            readonly ref: DocumentReference;
            readonly _data: any;
            constructor(id: string, data: any, ref: DocumentReference);
            data(): any;
            get(fieldPath: string): any;
            isEqual(other: DocumentSnapshot): boolean;
        }
        class QuerySnapshot {
            readonly docs: QueryDocumentSnapshot[];
            readonly empty: boolean;
            readonly metadata: SnapshotMetadata;
            readonly query: Query;
            readonly size: number;
            readonly _prev: QueryDocumentSnapshot[];
            readonly _next: QueryDocumentSnapshot[];
            constructor(query: Query, prev: QueryDocumentSnapshot[], next: QueryDocumentSnapshot[]);
            docChanges(): DocumentChange[];
            forEach(callback: (snapshot: QueryDocumentSnapshot, index: number) => any, thisArg?: any): void;
            isEqual(other: QuerySnapshot): boolean;
        }
        class CollectionReference extends Query {
            readonly id: string;
            readonly _documentPath: string;
            constructor(firestore: Firestore, path: string);
            readonly parent: DocumentReference;
            doc(documentPath?: string): DocumentReference;
            add(data: any): firebase.Promise<DocumentReference>;
            isEqual(other: CollectionReference): boolean;
        }
        class DocumentReference {
            readonly firestore: Firestore;
            readonly id: string;
            readonly path: string;
            readonly _collectionPath: string;
            constructor(firestore: Firestore, documentPath: string);
            readonly parent: CollectionReference;
            collection(collectionPath: string): CollectionReference;
            set(data: any, options?: SetOptions): firebase.Promise<DocumentReference>;
            delete(): firebase.Promise<void>;
            update(data: any): firebase.Promise<void>;
            get(options?: GetOptions): firebase.Promise<DocumentSnapshot>;
            onSnapshot(optionsOrObserverOrOnNext: SnapshotListenOptions | SnapshotObserver, observerOrOnNextOrOnError?: SnapshotObserver | SnapshotError, onError?: SnapshotError): Off;
            clearValues(): void;
            applyValues(values: any): void;
            notify(): void;
            snapshot(): DocumentSnapshot;
        }
        class FieldPath {
        }
        class GeoPoint {
            latitude: number;
            longitude: number;
            constructor(latitude: number, longitude: number);
            isEqual(other: GeoPoint): boolean;
        }
        class Timestamp {
            readonly _seconds: number;
            readonly _nanoseconds: number;
            constructor(seconds: number, nanoseconds?: number);
            toMillis(): number;
            toDate(): Date;
            static fromMillis(millis: number): Timestamp;
            static fromDate(date: Date): Timestamp;
            static now(): Timestamp;
        }
        class Transaction {
        }
        class WriteBatch {
        }
        interface QueryListenOptions {
            includeDocumentMetadataChanges?: boolean;
            includeQueryMetadataChanges?: boolean;
        }
        interface SnapshotMetadata {
            fromCache: boolean;
            hasPendingWrites: boolean;
        }
        interface Settings {
            timestampsInSnapshots?: boolean;
        }
        interface GetOptions {
            source?: 'default' | 'server' | 'client';
        }
        interface SetOptions {
            merge?: boolean;
        }
        interface SnapshotOptions {
            serverTimestamps?: 'estimate' | 'previous' | 'none';
        }
        interface DocumentChange {
            doc: DocumentSnapshot;
            type: ChangeType;
            newIndex: number;
            oldIndex: number;
        }
        interface SnapshotListenOptions {
            includeMetadataChanges?: boolean;
        }
        class Where {
            readonly _fieldPath: string;
            readonly _opStr: string;
            readonly _value: any;
            constructor(fieldPath: string, opStr: string, value: any);
            matches(doc: DocumentSnapshot): boolean;
        }
        class OrderBy {
            readonly _fieldPath: string;
            readonly _directionStr: string;
            constructor(fieldPath: string, directionStr: string);
            compare(a: DocumentSnapshot, b: DocumentSnapshot): number;
        }
    }
    class Deferred<T, R> {
        resolve: Resolver<R, any>;
        reject: Rejecter;
        next: Promise<R>;
        callback: Resolver<T, R>;
        constructor(callback: Resolver<T, R>);
        resolved(value: T): void;
        rejected(reason: Error): void;
    }
    class Promise<T> {
        _done: boolean;
        _resolved: boolean;
        _value: T | undefined;
        _error: Error | undefined;
        _rejecters: Rejecter[];
        _nexts: Deferred<T, any>[];
        constructor(callback: (resolve: Resolver<T, any>, reject: Rejecter) => void);
        then<R>(resolve: Resolver<T, R>): Promise<R>;
        catch(reject: Rejecter): this;
        static resolve<T>(resolved?: T): Promise<T>;
        static reject<T>(reason?: Error): Promise<T>;
        static all<T>(promises: Promise<T>[]): Promise<T>;
    }
    type Resolver<T, R> = (value: T) => void | Promise<R>;
    type Rejecter = (reason: Error) => void;
}
export default firebase;
