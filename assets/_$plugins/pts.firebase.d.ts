/**
 * Type declarations for pts.firebase.js
 * Firebase App SDK v12.18.0 + Firebase Analytics SDK v0.10.24 + Firebase Firestore SDK v4.17.1 + Firebase Auth SDK v1.13.5
 * Bound to globalThis.pTS.firebase / globalThis.pTS.firebase.analytics / globalThis.pTS.firebase.firestore / globalThis.pTS.firebase.auth
 */

// ─── Core Interfaces ────────────────────────────────────────────────────────────

interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    measurementId?: string;
}

interface FirebaseAppConfig {
    name?: string;
    automaticDataCollectionEnabled?: boolean;
}

interface FirebaseApp {
    readonly name: string;
    readonly options: FirebaseOptions;
    readonly config: FirebaseAppConfig;
    automaticDataCollectionEnabled: boolean;
}

interface FirebaseServerAppSettings {
    authIdToken?: string;
    appCheckToken?: string;
    releaseOnDeref?: object;
    automaticDataCollectionEnabled?: boolean;
}

interface FirebaseServerApp extends FirebaseApp {
    readonly settings: FirebaseServerAppSettings;
}

// ─── Error ──────────────────────────────────────────────────────────────────────

declare class FirebaseError extends Error {
    readonly code: string;
    readonly customData?: Record<string, unknown>;
    readonly name: string;
    constructor(code: string, message: string, customData?: Record<string, unknown>);
}

// ─── Internal Types ─────────────────────────────────────────────────────────────

type LogLevelString = 'debug' | 'verbose' | 'info' | 'warn' | 'error' | 'silent';

interface LogOptions {
    level?: LogLevelString;
}

interface LogCallbackParams {
    level: string;
    message: string;
    args: unknown[];
    type: string;
}

type LogCallback = (callbackParams: LogCallbackParams) => void;

interface Component<T = unknown> {
    readonly name: string;
    readonly type: string;
    instanceFactory: (...args: any[]) => T;
    multipleInstances: boolean;
    serviceProps: Record<string, unknown>;
    instantiationMode: string;
    onInstanceCreated: ((container: any, identifier: string, instance: T) => void) | null;
    setInstantiationMode(mode: string): Component<T>;
    setMultipleInstances(multipleInstances: boolean): Component<T>;
    setServiceProps(props: Record<string, unknown>): Component<T>;
    setInstanceCreatedCallback(callback: (container: any, identifier: string, instance: T) => void): Component<T>;
}

interface Provider<T = unknown> {
    get(identifier?: string): Promise<T>;
    getImmediate(options?: { identifier?: string; optional?: boolean }): T | null;
    getComponent(): Component<T> | null;
    setComponent(component: Component<T>): void;
    clearInstance(identifier?: string): void;
    delete(): Promise<void>;
    isComponentSet(): boolean;
    isInitialized(identifier?: string): boolean;
    getOptions(identifier?: string): Record<string, unknown>;
    initialize(options?: { options?: Record<string, unknown>; instanceIdentifier?: string }): T;
    onInit(callback: (instance: T, identifier: string) => void, identifier?: string): () => void;
}

// ─── Analytics Interfaces ───────────────────────────────────────────────────────

interface Analytics {
    readonly app: FirebaseApp;
}

interface AnalyticsSettings {
    config?: EventParams & { [key: string]: unknown };
}

interface GtagConfigParams {
    send_to?: string | string[];
    [key: string]: unknown;
}

interface ConsentSettings {
    ad_storage?: 'granted' | 'denied';
    analytics_storage?: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
    [key: string]: 'granted' | 'denied' | undefined;
}

interface AnalyticsCallOptions {
    global?: boolean;
}

interface EventParams {
    [key: string]: unknown;
}

interface ControlParams {
    event_callback?: (...args: unknown[]) => void;
    event_timeout?: number;
    groups?: string | string[];
    send_to?: string | string[];
}

interface CustomParams {
    [key: string]: unknown;
}

interface SettingsOptions {
    gtagName?: string;
    dataLayerName?: string;
}

// ─── Firestore Interfaces & Types ───────────────────────────────────────────────

type WhereFilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';
type OrderByDirection = 'desc' | 'asc';

interface DocumentData {
    [field: string]: any;
}

interface SetOptions {
    readonly merge?: boolean;
    readonly mergeFields?: (string | pTS.firebase.firestore.FieldPath)[];
}

interface SnapshotOptions {
    readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
}

interface SnapshotMetadata {
    readonly hasPendingWrites: boolean;
    readonly fromCache: boolean;
    isEqual(other: SnapshotMetadata): boolean;
}

interface FirestoreSettings {
    host?: string;
    ssl?: boolean;
    ignoreUndefinedProperties?: boolean;
    cacheSizeBytes?: number;
    experimentalForceLongPolling?: boolean;
    experimentalAutoDetectLongPolling?: boolean;
    localCache?: any;
}

// ─── Global Augmentation ────────────────────────────────────────────────────────

declare namespace pTS {
    export namespace firebase {
        export const FirebaseError: typeof FirebaseError;
        export const SDK_VERSION: Readonly<string>;
        export const DEFAULT_ENTRY_NAME: Readonly<string>;

        export function initializeApp(options?: FirebaseOptions, config?: FirebaseAppConfig | string): FirebaseApp;
        export function initializeServerApp(
            options: FirebaseOptions | FirebaseApp | FirebaseServerAppSettings,
            config?: FirebaseServerAppSettings
        ): FirebaseServerApp;
        export function getApp(name?: string): FirebaseApp;
        export function getApps(): FirebaseApp[];
        export function deleteApp(app: FirebaseApp): Promise<void>;
        export function registerVersion(libraryKeyOrName: string, version: string, variant?: string): void;
        export function setLogLevel(logLevel: LogLevelString): void;
        export function onLog(logCallback: LogCallback | null, options?: LogOptions): void;

        // ── Internal / Advanced API ─────────────────────────────────────────────
        export const _apps: Readonly<Map<string, FirebaseApp>>;
        export const _serverApps: Readonly<Map<string, FirebaseServerApp>>;
        export const _components: Readonly<Map<string, Component>>;
        export function _addComponent(app: FirebaseApp, component: Component): void;
        export function _addOrOverwriteComponent(app: FirebaseApp, component: Component): void;
        export function _registerComponent(component: Component): boolean;
        export function _getProvider<T = unknown>(app: FirebaseApp, name: string): Provider<T>;
        export function _removeServiceInstance(app: FirebaseApp, name: string, identifier?: string): void;
        export function _isFirebaseApp(value: unknown): value is FirebaseApp;
        export function _isFirebaseServerApp(value: unknown): value is FirebaseServerApp;
        export function _isFirebaseServerAppSettings(value: unknown): value is FirebaseServerAppSettings;
        export function _clearComponents(): void;

        // ── Analytics ───────────────────────────────────────────────────────────
        export namespace analytics {
            export function getAnalytics(app?: FirebaseApp): Analytics;
            export function initializeAnalytics(app: FirebaseApp, options?: AnalyticsSettings): Analytics;
            export function isSupported(): Promise<boolean>;
            export function logEvent(
                analytics: Analytics,
                eventName: string,
                eventParams?: EventParams & ControlParams & CustomParams,
                options?: AnalyticsCallOptions
            ): void;
            export function setCurrentScreen(analytics: Analytics, screenName: string, options?: AnalyticsCallOptions): void;
            export function setUserId(analytics: Analytics, id: string, options?: AnalyticsCallOptions): void;
            export function setUserProperties(
                analytics: Analytics,
                properties: Record<string, unknown>,
                options?: AnalyticsCallOptions
            ): void;
            export function setAnalyticsCollectionEnabled(analytics: Analytics, enabled: boolean): void;
            export function setDefaultEventParameters(params: CustomParams): void;
            export function setConsent(consentSettings: ConsentSettings): void;
            export function getGoogleAnalyticsClientId(analytics: Analytics): Promise<string>;
            export function settings(settings: SettingsOptions): void;
        }

        // ── Firestore ───────────────────────────────────────────────────────────
        export namespace firestore {
            export class Firestore {
                readonly type: 'firestore-lite' | 'firestore';
                readonly app: FirebaseApp;
                toJSON(): object;
            }

            export class FirestoreError extends Error {
                readonly code: string;
                readonly message: string;
                readonly stack?: string;
                readonly customData?: Record<string, unknown>;
            }

            export class GeoPoint {
                readonly latitude: number;
                readonly longitude: number;
                constructor(latitude: number, longitude: number);
                isEqual(other: GeoPoint): boolean;
                toJSON(): { latitude: number; longitude: number };
            }

            export class Timestamp {
                readonly seconds: number;
                readonly nanoseconds: number;
                constructor(seconds: number, nanoseconds: number);
                static now(): Timestamp;
                static fromDate(date: Date): Timestamp;
                static fromMillis(milliseconds: number): Timestamp;
                toDate(): Date;
                toMillis(): number;
                isEqual(other: Timestamp): boolean;
                toString(): string;
                toJSON(): { seconds: number; nanoseconds: number };
                valueOf(): string;
            }

            export class Bytes {
                static fromBase64String(base64: string): Bytes;
                static fromUint8Array(array: Uint8Array): Bytes;
                toBase64(): string;
                toUint8Array(): Uint8Array;
                isEqual(other: Bytes): boolean;
            }

            export class FieldPath {
                constructor(...fieldNames: string[]);
                isEqual(other: FieldPath): boolean;
                static documentId(): FieldPath;
            }

            export abstract class FieldValue {
                abstract isEqual(other: FieldValue): boolean;
                static serverTimestamp(): FieldValue;
                static delete(): FieldValue;
                static increment(n: number): FieldValue;
                static arrayUnion(...elements: any[]): FieldValue;
                static arrayRemove(...elements: any[]): FieldValue;
            }

            export class VectorValue {
                toArray(): number[];
                isEqual(other: VectorValue): boolean;
            }

            export class DocumentReference<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
                readonly type: 'document';
                readonly firestore: Firestore;
                readonly id: string;
                readonly path: string;
                readonly parent: CollectionReference<AppModelType, DbModelType>;
                withConverter<NewAppModelType = DocumentData, NewDbModelType extends DocumentData = DocumentData>(
                    converter: any
                ): DocumentReference<NewAppModelType, NewDbModelType>;
            }

            export class CollectionReference<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> extends Query<AppModelType, DbModelType> {
                readonly type: 'collection';
                readonly id: string;
                readonly path: string;
                readonly parent: DocumentReference<DocumentData, DocumentData> | null;
            }

            export class Query<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
                readonly type: 'query' | 'collection';
                readonly firestore: Firestore;
                withConverter<NewAppModelType = DocumentData, NewDbModelType extends DocumentData = DocumentData>(
                    converter: any
                ): Query<NewAppModelType, NewDbModelType>;
            }

            export class DocumentSnapshot<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
                readonly id: string;
                readonly ref: DocumentReference<AppModelType, DbModelType>;
                readonly metadata: SnapshotMetadata;
                exists(): this is QueryDocumentSnapshot<AppModelType, DbModelType>;
                data(options?: SnapshotOptions): AppModelType | undefined;
                get(fieldPath: string | FieldPath, options?: SnapshotOptions): any;
            }

            export class QueryDocumentSnapshot<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> extends DocumentSnapshot<AppModelType, DbModelType> {
                data(options?: SnapshotOptions): AppModelType;
            }

            export class QuerySnapshot<AppModelType = DocumentData, DbModelType extends DocumentData = DocumentData> {
                readonly query: Query<AppModelType, DbModelType>;
                readonly metadata: SnapshotMetadata;
                readonly size: number;
                readonly empty: boolean;
                readonly docs: Array<QueryDocumentSnapshot<AppModelType, DbModelType>>;
                forEach(callback: (result: QueryDocumentSnapshot<AppModelType, DbModelType>) => void, thisArg?: any): void;
                docChanges(options?: any): any[];
            }

            export abstract class QueryConstraint {
                abstract readonly type: string;
            }

            export class QueryFieldFilterConstraint extends QueryConstraint {
                readonly type: 'where';
            }

            export class QueryCompositeFilterConstraint extends QueryConstraint {
                readonly type: 'and' | 'or';
            }

            export class QueryOrderByConstraint extends QueryConstraint {
                readonly type: 'orderBy';
            }

            export class QueryLimitConstraint extends QueryConstraint {
                readonly type: 'limit' | 'limitToLast';
            }

            export class QueryStartAtConstraint extends QueryConstraint {
                readonly type: 'startAt' | 'startAfter';
            }

            export class QueryEndAtConstraint extends QueryConstraint {
                readonly type: 'endAt' | 'endBefore';
            }

            export class WriteBatch {
                set<AppModelType, DbModelType extends DocumentData>(
                    documentRef: DocumentReference<AppModelType, DbModelType>,
                    data: any,
                    options?: SetOptions
                ): WriteBatch;
                update(documentRef: DocumentReference<any, any>, data: any): WriteBatch;
                update(documentRef: DocumentReference<any, any>, field: string | FieldPath, value: any, ...moreFieldsAndValues: any[]): WriteBatch;
                delete(documentRef: DocumentReference<any, any>): WriteBatch;
                commit(): Promise<void>;
            }

            export class Transaction {
                get<AppModelType, DbModelType extends DocumentData>(
                    documentRef: DocumentReference<AppModelType, DbModelType>
                ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;
                set<AppModelType, DbModelType extends DocumentData>(
                    documentRef: DocumentReference<AppModelType, DbModelType>,
                    data: any,
                    options?: SetOptions
                ): Transaction;
                update(documentRef: DocumentReference<any, any>, data: any): Transaction;
                update(documentRef: DocumentReference<any, any>, field: string | FieldPath, value: any, ...moreFieldsAndValues: any[]): Transaction;
                delete(documentRef: DocumentReference<any, any>): Transaction;
            }

            export class AggregateField<T> {
                readonly type: string;
            }

            export class AggregateQuerySnapshot<T = any> {
                readonly query: Query<any, any>;
                data(): T;
            }

            export class LoadBundleTask {
                onProgress(next?: (progress: any) => any, error?: (error: any) => any, complete?: () => void): void;
                then<T, R>(onFulfilled?: (a: any) => T | PromiseLike<T>, onRejected?: (a: any) => R | PromiseLike<R>): Promise<T | R>;
                catch<T>(onRejected?: (a: any) => T | PromiseLike<T>): Promise<any | T>;
            }

            export class PersistentCacheIndexManager {
                readonly type: 'PersistentCacheIndexManager';
            }

            export const CACHE_SIZE_UNLIMITED: number;

            // ── Functions ───────────────────────────────────────────────────────────
            export function getFirestore(app?: FirebaseApp, databaseId?: string): Firestore;
            export function initializeFirestore(app: FirebaseApp, settings: FirestoreSettings, databaseId?: string): Firestore;

            export function collection(firestore: Firestore, path: string, ...pathSegments: string[]): CollectionReference<DocumentData, DocumentData>;
            export function collection<AppModelType, DbModelType extends DocumentData>(
                reference: CollectionReference<AppModelType, DbModelType>,
                path: string,
                ...pathSegments: string[]
            ): CollectionReference<DocumentData, DocumentData>;
            export function collection<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                path: string,
                ...pathSegments: string[]
            ): CollectionReference<DocumentData, DocumentData>;

            export function collectionGroup(firestore: Firestore, collectionId: string): Query<DocumentData, DocumentData>;

            export function doc(firestore: Firestore, path: string, ...pathSegments: string[]): DocumentReference<DocumentData, DocumentData>;
            export function doc<AppModelType, DbModelType extends DocumentData>(
                reference: CollectionReference<AppModelType, DbModelType>,
                path?: string,
                ...pathSegments: string[]
            ): DocumentReference<AppModelType, DbModelType>;
            export function doc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                path: string,
                ...pathSegments: string[]
            ): DocumentReference<DocumentData, DocumentData>;

            export function getDoc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>
            ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;
            export function getDocFromCache<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>
            ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;
            export function getDocFromServer<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>
            ): Promise<DocumentSnapshot<AppModelType, DbModelType>>;

            export function getDocs<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>
            ): Promise<QuerySnapshot<AppModelType, DbModelType>>;
            export function getDocsFromCache<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>
            ): Promise<QuerySnapshot<AppModelType, DbModelType>>;
            export function getDocsFromServer<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>
            ): Promise<QuerySnapshot<AppModelType, DbModelType>>;

            export function setDoc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                data: any,
                options?: SetOptions
            ): Promise<void>;

            export function updateDoc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                data: any
            ): Promise<void>;
            export function updateDoc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                field: string | FieldPath,
                value: any,
                ...moreFieldsAndValues: any[]
            ): Promise<void>;

            export function deleteDoc<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>
            ): Promise<void>;

            export function addDoc<AppModelType, DbModelType extends DocumentData>(
                reference: CollectionReference<AppModelType, DbModelType>,
                data: any
            ): Promise<DocumentReference<AppModelType, DbModelType>>;

            export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                observer: { next?: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void; error?: (error: FirestoreError) => void; complete?: () => void }
            ): () => void;
            export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
                reference: DocumentReference<AppModelType, DbModelType>,
                onNext: (snapshot: DocumentSnapshot<AppModelType, DbModelType>) => void,
                onError?: (error: FirestoreError) => void,
                onCompletion?: () => void
            ): () => void;
            export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>,
                observer: { next?: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void; error?: (error: FirestoreError) => void; complete?: () => void }
            ): () => void;
            export function onSnapshot<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>,
                onNext: (snapshot: QuerySnapshot<AppModelType, DbModelType>) => void,
                onError?: (error: FirestoreError) => void,
                onCompletion?: () => void
            ): () => void;

            export function query<AppModelType, DbModelType extends DocumentData>(
                query: Query<AppModelType, DbModelType>,
                ...queryConstraints: QueryConstraint[]
            ): Query<AppModelType, DbModelType>;

            export function where(fieldPath: string | FieldPath, opStr: WhereFilterOp, value: any): QueryFieldFilterConstraint;
            export function orderBy(fieldPath: string | FieldPath, directionStr?: OrderByDirection): QueryOrderByConstraint;
            export function limit(limit: number): QueryLimitConstraint;
            export function limitToLast(limit: number): QueryLimitConstraint;
            export function startAt(...fieldValuesOrDocumentSnapshot: any[]): QueryStartAtConstraint;
            export function startAfter(...fieldValuesOrDocumentSnapshot: any[]): QueryStartAtConstraint;
            export function endAt(...fieldValuesOrDocumentSnapshot: any[]): QueryEndAtConstraint;
            export function endBefore(...fieldValuesOrDocumentSnapshot: any[]): QueryEndAtConstraint;
            export function and(...queryConstraints: QueryConstraint[]): QueryCompositeFilterConstraint;
            export function or(...queryConstraints: QueryConstraint[]): QueryCompositeFilterConstraint;

            export function runTransaction<T>(
                firestore: Firestore,
                updateFunction: (transaction: Transaction) => Promise<T>,
                options?: any
            ): Promise<T>;

            export function writeBatch(firestore: Firestore): WriteBatch;

            export function serverTimestamp(): FieldValue;
            export function deleteField(): FieldValue;
            export function increment(n: number): FieldValue;
            export function arrayUnion(...elements: any[]): FieldValue;
            export function arrayRemove(...elements: any[]): FieldValue;
            export function vector(values?: number[]): VectorValue;

            export function count(): AggregateField<number>;
            export function sum(field: string | FieldPath): AggregateField<number>;
            export function average(field: string | FieldPath): AggregateField<number | null>;

            export function getAggregateFromServer<T extends Record<string, AggregateField<any>>>(
                query: Query<any, any>,
                aggregateSpec: T
            ): Promise<AggregateQuerySnapshot<any>>;
            export function getCountFromServer(query: Query<any, any>): Promise<AggregateQuerySnapshot<{ count: number }>>;

            export function enableNetwork(firestore: Firestore): Promise<void>;
            export function disableNetwork(firestore: Firestore): Promise<void>;
            export function terminate(firestore: Firestore): Promise<void>;
            export function waitForPendingWrites(firestore: Firestore): Promise<void>;
            export function clearIndexedDbPersistence(firestore: Firestore): Promise<void>;
            export function enableIndexedDbPersistence(firestore: Firestore, forceOwnership?: boolean): Promise<void>;
            export function enableMultiTabIndexedDbPersistence(firestore: Firestore): Promise<void>;

            export function memoryLocalCache(settings?: any): any;
            export function persistentLocalCache(settings?: any): any;
            export function persistentSingleTabManager(settings?: any): any;
            export function persistentMultipleTabManager(settings?: any): any;
            export function memoryEagerGarbageCollector(): any;
            export function memoryLruGarbageCollector(settings?: any): any;

            export function connectFirestoreEmulator(firestore: Firestore, host: string, port: number, options?: { mockUserToken?: any }): void;
            export function loadBundle(firestore: Firestore, bundleData: ArrayBuffer | ReadableStream<Uint8Array> | string): LoadBundleTask;
            export function namedQuery(firestore: Firestore, name: string): Promise<Query<DocumentData, DocumentData> | null>;
            export function setIndexConfiguration(firestore: Firestore, config: any): Promise<void>;

            export function getPersistentCacheIndexManager(firestore: Firestore): PersistentCacheIndexManager | null;
            export function enablePersistentCacheIndexAutoCreation(indexManager: PersistentCacheIndexManager): void;
            export function disablePersistentCacheIndexAutoCreation(indexManager: PersistentCacheIndexManager): void;
            export function deleteAllPersistentCacheIndexes(indexManager: PersistentCacheIndexManager): void;

            export function setLogLevel(logLevel: LogLevelString): void;
            export function documentId(): FieldPath;
            export function refEqual(left: any, right: any): boolean;
            export function queryEqual(left: Query<any, any>, right: Query<any, any>): boolean;
            export function snapshotEqual(left: any, right: any): boolean;
            export function aggregateFieldEqual(left: AggregateField<any>, right: AggregateField<any>): boolean;
            export function aggregateQuerySnapshotEqual(left: AggregateQuerySnapshot, right: AggregateQuerySnapshot): boolean;
        }

        // ── Auth ────────────────────────────────────────────────────────────────
        export namespace auth {
            export class Auth {
                readonly app: FirebaseApp;
                readonly name: string;
                readonly config: any;
                readonly currentUser: User | null;
                readonly tenantId: string | null;
                languageCode: string | null;
                settings: any;
                signOut(): Promise<void>;
                onAuthStateChanged(nextOrObserver: any, error?: any, completed?: any): () => void;
                onIdTokenChanged(nextOrObserver: any, error?: any, completed?: any): () => void;
                beforeAuthStateChanged(callback: (user: User | null) => void | Promise<void>, onCustomToken?: (customToken: string) => void | Promise<void>): () => void;
                setPersistence(persistence: Persistence): Promise<void>;
                useDeviceLanguage(): void;
                updateCurrentUser(user: User | null): Promise<void>;
            }

            export interface UserInfo {
                readonly displayName: string | null;
                readonly email: string | null;
                readonly phoneNumber: string | null;
                readonly photoURL: string | null;
                readonly providerId: string;
                readonly uid: string;
            }

            export interface UserMetadata {
                readonly creationTime?: string;
                readonly lastSignInTime?: string;
            }

            export class User implements UserInfo {
                readonly displayName: string | null;
                readonly email: string | null;
                readonly emailVerified: boolean;
                readonly isAnonymous: boolean;
                readonly metadata: UserMetadata;
                readonly phoneNumber: string | null;
                readonly photoURL: string | null;
                readonly providerData: UserInfo[];
                readonly providerId: string;
                readonly uid: string;
                readonly tenantId: string | null;
                delete(): Promise<void>;
                getIdToken(forceRefresh?: boolean): Promise<string>;
                getIdTokenResult(forceRefresh?: boolean): Promise<IdTokenResult>;
                reload(): Promise<void>;
                toJSON(): object;
            }

            export interface UserCredential {
                readonly user: User;
                readonly providerId: string | null;
                readonly operationType: string;
            }

            export interface IdTokenResult {
                readonly authTime: string;
                readonly claims: Record<string, unknown>;
                readonly expirationTime: string;
                readonly issuedAtTime: string;
                readonly signInProvider: string | null;
                readonly signInSecondFactor: string | null;
                readonly token: string;
            }

            export interface Persistence {
                readonly type: string;
            }

            export const browserLocalPersistence: Persistence;
            export const browserSessionPersistence: Persistence;
            export const indexedDBLocalPersistence: Persistence;
            export const inMemoryPersistence: Persistence;
            export const browserCookiePersistence: Persistence;
            export const browserPopupRedirectResolver: any;

            export abstract class AuthCredential {
                abstract readonly providerId: string;
                abstract readonly signInMethod: string;
                abstract toJSON(): object;
            }

            export class EmailAuthCredential extends AuthCredential {
                readonly providerId: 'password';
                readonly signInMethod: string;
                toJSON(): object;
            }

            export class OAuthCredential extends AuthCredential {
                readonly providerId: string;
                readonly signInMethod: string;
                readonly accessToken?: string;
                readonly idToken?: string;
                readonly secret?: string;
                toJSON(): object;
            }

            export class PhoneAuthCredential extends AuthCredential {
                readonly providerId: 'phone';
                readonly signInMethod: string;
                toJSON(): object;
            }

            export abstract class AuthProvider {
                abstract readonly providerId: string;
            }

            export class EmailAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'password';
                static readonly EMAIL_PASSWORD_SIGN_IN_METHOD: 'password';
                static readonly EMAIL_LINK_SIGN_IN_METHOD: 'emailLink';
                readonly providerId: 'password';
                static credential(email: string, password: string): EmailAuthCredential;
                static credentialWithLink(email: string, emailLink: string): EmailAuthCredential;
            }

            export class FacebookAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'facebook.com';
                readonly providerId: 'facebook.com';
                static credential(accessToken: string): OAuthCredential;
                addScope(scope: string): this;
                setCustomParameters(customOAuthParameters: Record<string, string>): this;
            }

            export class GithubAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'github.com';
                readonly providerId: 'github.com';
                static credential(accessToken: string): OAuthCredential;
                addScope(scope: string): this;
                setCustomParameters(customOAuthParameters: Record<string, string>): this;
            }

            export class GoogleAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'google.com';
                readonly providerId: 'google.com';
                static credential(idToken?: string | null, accessToken?: string | null): OAuthCredential;
                addScope(scope: string): this;
                setCustomParameters(customOAuthParameters: Record<string, string>): this;
            }

            export class TwitterAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'twitter.com';
                readonly providerId: 'twitter.com';
                static credential(token: string, secret: string): OAuthCredential;
                setCustomParameters(customOAuthParameters: Record<string, string>): this;
            }

            export class OAuthProvider extends AuthProvider {
                readonly providerId: string;
                constructor(providerId: string);
                credential(params: { idToken?: string; accessToken?: string; rawNonce?: string }): OAuthCredential;
                addScope(scope: string): this;
                setCustomParameters(customOAuthParameters: Record<string, string>): this;
            }

            export class PhoneAuthProvider extends AuthProvider {
                static readonly PROVIDER_ID: 'phone';
                static readonly PHONE_SIGN_IN_METHOD: 'phone';
                readonly providerId: 'phone';
                constructor(auth: Auth);
                verifyPhoneNumber(phoneNumber: string, applicationVerifier: ApplicationVerifier): Promise<string>;
                static credential(verificationId: string, verificationCode: string): PhoneAuthCredential;
            }

            export class SAMLAuthProvider extends AuthProvider {
                readonly providerId: string;
                constructor(providerId: string);
                credential(params: Record<string, string>): AuthCredential;
            }

            export interface ApplicationVerifier {
                readonly type: string;
                verify(): Promise<string>;
            }

            export class RecaptchaVerifier implements ApplicationVerifier {
                readonly type: string;
                constructor(containerOrId: any, parameters?: any, auth?: Auth);
                clear(): void;
                render(): Promise<number>;
                verify(): Promise<string>;
            }

            export interface ActionCodeSettings {
                url: string;
                handleCodeInApp?: boolean;
                iOS?: { bundleId: string };
                android?: { packageName: string; installApp?: boolean; minimumVersion?: string };
                dynamicLinkDomain?: string;
                linkDomain?: string;
            }

            export class ActionCodeURL {
                readonly apiKey: string;
                readonly mode: string;
                readonly oobCode: string;
                readonly continueUrl: string | null;
                readonly languageCode: string | null;
                readonly tenantId: string | null;
                static parseLink(link: string): ActionCodeURL | null;
            }

            export const ActionCodeOperation: Record<string, string>;
            export const OperationType: Record<string, string>;
            export const FactorId: Record<string, string>;
            export const ProviderId: Record<string, string>;
            export const SignInMethod: Record<string, string>;
            export const AuthErrorCodes: Record<string, string>;

            export class TotpSecret {
                readonly secretKey: string;
                readonly hashingAlgorithm: string;
                readonly codeLength: number;
                readonly codeIntervalSeconds: number;
                readonly enrollmentCompletionDeadline: string;
                generateQrCodeUrl(accountName?: string, issuer?: string): string;
            }

            export class TotpMultiFactorGenerator {
                static readonly FACTOR_ID: 'totp';
                static generateSecret(multiFactorSession: any): Promise<TotpSecret>;
                static assertionForEnrollment(secret: TotpSecret, code: string): any;
                static assertionForSignIn(enrollmentId: string, code: string): any;
            }

            export class PhoneMultiFactorGenerator {
                static readonly FACTOR_ID: 'phone';
                static assertion(phoneAuthCredential: PhoneAuthCredential): any;
            }

            export class MultiFactorUser {
                readonly enrolledFactors: any[];
                enroll(assertion: any, displayName?: string | null): Promise<void>;
                unenroll(infoOrUid: any): Promise<void>;
                getSession(): Promise<any>;
            }

            export class MultiFactorResolver {
                readonly session: any;
                readonly hints: any[];
                resolveSignIn(assertion: any): Promise<UserCredential>;
            }

            // ── Functions ───────────────────────────────────────────────────────────
            export function getAuth(app?: FirebaseApp): Auth;
            export function initializeAuth(app: FirebaseApp, deps?: any): Auth;

            export function onAuthStateChanged(auth: Auth, nextOrObserver: any, error?: any, completed?: any): () => void;
            export function onIdTokenChanged(auth: Auth, nextOrObserver: any, error?: any, completed?: any): () => void;
            export function beforeAuthStateChanged(auth: Auth, callback: (user: User | null) => void | Promise<void>, onCustomToken?: (customToken: string) => void | Promise<void>): () => void;

            export function signInWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
            export function createUserWithEmailAndPassword(auth: Auth, email: string, password: string): Promise<UserCredential>;
            export function signInAnonymously(auth: Auth): Promise<UserCredential>;
            export function signInWithCredential(auth: Auth, credential: AuthCredential): Promise<UserCredential>;
            export function signInWithCustomToken(auth: Auth, customToken: string): Promise<UserCredential>;
            export function signInWithPopup(auth: Auth, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
            export function signInWithRedirect(auth: Auth, provider: AuthProvider, resolver?: any): Promise<never | void>;
            export function getRedirectResult(auth: Auth, resolver?: any): Promise<UserCredential | null>;
            export function signInWithPhoneNumber(auth: Auth, phoneNumber: string, appVerifier: ApplicationVerifier): Promise<any>;
            export function signInWithEmailLink(auth: Auth, email: string, emailLink?: string): Promise<UserCredential>;

            export function signOut(auth: Auth): Promise<void>;

            export function sendPasswordResetEmail(auth: Auth, email: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
            export function confirmPasswordReset(auth: Auth, oobCode: string, newPassword: string): Promise<void>;
            export function verifyPasswordResetCode(auth: Auth, code: string): Promise<string>;
            export function sendSignInLinkToEmail(auth: Auth, email: string, actionCodeSettings: ActionCodeSettings): Promise<void>;
            export function isSignInWithEmailLink(auth: Auth, emailLink: string): boolean;
            export function sendEmailVerification(user: User, actionCodeSettings?: ActionCodeSettings): Promise<void>;
            export function verifyBeforeUpdateEmail(user: User, newEmail: string, actionCodeSettings?: ActionCodeSettings): Promise<void>;
            export function checkActionCode(auth: Auth, code: string): Promise<any>;
            export function applyActionCode(auth: Auth, code: string): Promise<void>;
            export function parseActionCodeURL(link: string): ActionCodeURL | null;

            export function fetchSignInMethodsForEmail(auth: Auth, email: string): Promise<string[]>;
            export function getAdditionalUserInfo(userCredential: UserCredential): any;
            export function getIdToken(user: User, forceRefresh?: boolean): Promise<string>;
            export function getIdTokenResult(user: User, forceRefresh?: boolean): Promise<IdTokenResult>;

            export function updateEmail(user: User, newEmail: string): Promise<void>;
            export function updatePassword(user: User, newPassword: string): Promise<void>;
            export function updatePhoneNumber(user: User, phoneCredential: PhoneAuthCredential): Promise<void>;
            export function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }): Promise<void>;
            export function updateCurrentUser(auth: Auth, user: User | null): Promise<void>;
            export function deleteUser(user: User): Promise<void>;
            export function reload(user: User): Promise<void>;

            export function linkWithCredential(user: User, credential: AuthCredential): Promise<UserCredential>;
            export function linkWithPopup(user: User, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
            export function linkWithRedirect(user: User, provider: AuthProvider, resolver?: any): Promise<never | void>;
            export function linkWithPhoneNumber(user: User, phoneNumber: string, appVerifier: ApplicationVerifier): Promise<any>;

            export function reauthenticateWithCredential(user: User, credential: AuthCredential): Promise<UserCredential>;
            export function reauthenticateWithPopup(user: User, provider: AuthProvider, resolver?: any): Promise<UserCredential>;
            export function reauthenticateWithRedirect(user: User, provider: AuthProvider, resolver?: any): Promise<never | void>;
            export function reauthenticateWithPhoneNumber(user: User, phoneNumber: string, appVerifier: ApplicationVerifier): Promise<any>;

            export function unlink(user: User, providerId: string): Promise<User>;
            export function setPersistence(auth: Auth, persistence: Persistence): Promise<void>;
            export function useDeviceLanguage(auth: Auth): void;
            export function connectAuthEmulator(auth: Auth, url: string, options?: { disableWarnings?: boolean }): void;

            export function multiFactor(user: User): MultiFactorUser;
            export function getMultiFactorResolver(auth: Auth, error: any): MultiFactorResolver;
            export function validatePassword(auth: Auth, password: string): Promise<any>;
            export function revokeAccessToken(auth: Auth, accessToken: string): Promise<void>;
            export function initializeRecaptchaConfig(auth: Auth): Promise<void>;
            export function prodErrorMap(): any;
            export function debugErrorMap(): any;
        }
    }
}
