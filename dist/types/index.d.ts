export declare namespace firebase {
    const SDK_VERSION: string;
    const apps: firebase.app.App[];
    function initializeApp(config: object, name?: string): app.App;
    function app(name?: string): firebase.app.App;
    namespace app {
        class App {
            readonly name: string;
            readonly options: Object;
            firebase_: any;
            firestore_: firebase.firestore.Firestore | undefined;
            constructor(options: object, name: string);
            auth(): void;
            database(): void;
            firestore(): firebase.firestore.Firestore;
            delete(): Promise<any>;
            messaging(): void;
            storage(): void;
        }
    }
    function firestore(app?: firebase.app.App): firebase.firestore.Firestore;
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
        type QuerySnapshotObserver = (querySnapshot: QuerySnapshot) => void;
        type QuerySnapshotError = (error: any) => any;
        type QueryDocumentSnapshot = DocumentSnapshot;
        type SnapshotObserver = (snapshot: DocumentSnapshot) => void;
        type SnapshotError = (error: any) => any;
        type DocumentChangeType = 'added' | 'modified' | 'removed';
        type WhereFilterOp = '<' | '<=' | '==' | '>=' | '>' | 'array-contains' | 'array_contains';
        type OrderByDirection = 'desc' | 'asc';
        type DocumentData = {
            [field: string]: any;
        };
        type UpdateData = {
            [fieldPath: string]: any;
        };
        type LogLevel = 'debug' | 'error' | 'silent';
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
            disableNetwork(): Promise<void>;
            enableNetwork(): Promise<void>;
            enablePersistence(): Promise<void>;
            setLogLevel(logLevel: LogLevel): void;
            runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
            settings(settings: Settings): void;
            INTERNAL: {
                delete: () => Promise<void>;
            };
            onDocumentGet(path: string, doc: any): void;
            onDocumentCreate(path: string, emptyDoc: any): void;
            onDocumentUpdate(path: string, values: UpdateData | DocumentData, doc: any): void;
            onDocumentRemove(path: string, id: string, doc: any): void;
            onCollectionCreate(path: string, docs: any[]): void;
            onCollectionUpdate(path: string, docs: string[], id: string, doc: any): void;
            onCollectionRemove(path: string): void;
            onListenerAdd(path: string): void;
            onListenerRemove(path: string): void;
            onListenerNotify(path: string): void;
            dataAt(path: string, create?: boolean): any;
            dataAtRemove(path: string): void;
            documentsAt(path: string): string[];
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
            endAt(snapshot: DocumentSnapshot): Query;
            endBefore(snapshot: DocumentSnapshot): Query;
            startAfter(snapshot: DocumentSnapshot): Query;
            startAt(snapshot: DocumentSnapshot): Query;
            limit(limit: number): Query;
            orderBy(fieldPath: string, directionStr?: OrderByDirection): Query;
            where(fieldPath: string, operationStr: WhereFilterOp, value: any): Query;
            get(options?: GetOptions): Promise<QuerySnapshot>;
            isEqual(other: Query): boolean;
            onSnapshot(optionsOrObserverOrOnNext: QueryListenOptions | QuerySnapshotObserver, observerOrOnNextOrOnError?: QuerySnapshotObserver | QuerySnapshotError, onError?: QuerySnapshotError): Off;
            extend(modify?: (copy: Query) => any): Query;
            getResults(): QueryDocumentSnapshot[];
        }
        class FieldValue {
            readonly compute: (existing: any) => any;
            constructor(compute: (existing: any) => any);
            isEqual(other: FieldValue): boolean;
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
            data(options?: SnapshotOptions): DocumentData | undefined;
            get(fieldPath: string | FieldPath, options?: SnapshotOptions): any;
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
            forEach(callback: (snapshot: QueryDocumentSnapshot) => void, thisArg?: any): void;
            isEqual(other: QuerySnapshot): boolean;
        }
        class CollectionReference extends Query {
            readonly id: string;
            readonly path: string;
            readonly _documentPath: string;
            constructor(firestore: Firestore, path: string);
            readonly parent: DocumentReference | null;
            doc(documentPath?: string): DocumentReference;
            add(data: DocumentData): Promise<DocumentReference>;
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
            isEqual(other: DocumentReference): boolean;
            set(data: DocumentData, options?: SetOptions): Promise<void>;
            delete(): Promise<void>;
            update(field: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Promise<void>;
            get(options?: GetOptions): Promise<DocumentSnapshot>;
            onSnapshot(optionsOrObserverOrOnNext: DocumentListenOptions | SnapshotObserver, observerOrOnNextOrOnError?: SnapshotObserver | SnapshotError, onError?: SnapshotError): Off;
            clearValues(): void;
            applyValues(values: UpdateData | DocumentData): void;
            notify(): void;
            snapshot(): DocumentSnapshot;
        }
        class FieldPath {
            constructor(...fieldNames: string[]);
            isEqual(other: FieldPath): boolean;
            static documentId(): FieldPath;
        }
        class GeoPoint {
            latitude: number;
            longitude: number;
            constructor(latitude: number, longitude: number);
            isEqual(other: GeoPoint): boolean;
        }
        class Timestamp {
            readonly seconds: number;
            readonly nanoseconds: number;
            constructor(seconds: number, nanoseconds?: number);
            toMillis(): number;
            toDate(): Date;
            isEqual(other: Timestamp): boolean;
            static fromMillis(millis: number): Timestamp;
            static fromDate(date: Date): Timestamp;
            static now(): Timestamp;
        }
        class Transaction {
            get(documentRef: DocumentReference): Promise<DocumentSnapshot>;
            set(documentRef: DocumentReference, data: DocumentData, options?: SetOptions): Transaction;
            update(documentRef: DocumentReference, fieldOrData: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Transaction;
            delete(documentRef: DocumentReference): Transaction;
        }
        class WriteBatch {
            set(documentRef: DocumentReference, data: DocumentData, options?: SetOptions): WriteBatch;
            update(documentRef: DocumentReference, fieldOrData: string | FieldPath | UpdateData, value?: any, ...moreFieldsAndValues: any[]): Transaction;
            delete(documentRef: DocumentReference): Transaction;
            commit(): Promise<void>;
        }
        interface QueryListenOptions {
            readonly includeDocumentMetadataChanges?: boolean;
            readonly includeQueryMetadataChanges?: boolean;
        }
        interface SnapshotMetadata {
            readonly fromCache: boolean;
            readonly hasPendingWrites: boolean;
            isEqual(other: SnapshotMetadata): boolean;
        }
        interface Settings {
            host?: string;
            ssl?: boolean;
            timestampsInSnapshots?: boolean;
        }
        interface GetOptions {
            readonly source?: 'default' | 'server' | 'client';
        }
        interface SetOptions {
            readonly merge?: boolean;
        }
        interface SnapshotOptions {
            readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
        }
        interface DocumentChange {
            readonly doc: QueryDocumentSnapshot;
            readonly type: DocumentChangeType;
            readonly newIndex: number;
            readonly oldIndex: number;
        }
        interface SnapshotListenOptions {
            includeMetadataChanges?: boolean;
        }
        interface DocumentListenOptions {
            readonly includeMetadataChanges?: boolean;
        }
        class Where {
            readonly _fieldPath: string;
            readonly _opStr: WhereFilterOp;
            readonly _value: any;
            constructor(fieldPath: string, opStr: WhereFilterOp, value: any);
            matches(doc: DocumentSnapshot): boolean;
        }
        class OrderBy {
            readonly _fieldPath: string;
            readonly _directionStr: OrderByDirection;
            constructor(fieldPath: string, directionStr: OrderByDirection);
            compare(a: DocumentSnapshot, b: DocumentSnapshot): number;
        }
    }
}
export default firebase;
