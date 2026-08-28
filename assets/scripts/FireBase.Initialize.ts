import { pObject, pString } from "db://pts-core/scripts/utils";

import * as _$config from "../_$config/config.json"
import { js } from "cc";
import { DEV } from "cc/env";
const config = ((_$config as any).default || _$config) as typeof _$config;

interface _IUserData {
    auth_token: string;
    created_at: string;
    uid: string;
}

type _TDocKeys = 'users' | 'login_codes' | 'game_data';
type Firestore = pTS.firebase.firestore.Firestore;
type Auth = pTS.firebase.auth.Auth;

export interface _TGetter {
    app: FirebaseApp;
    analytics: Analytics;
    firestore: Firestore;
    auth: Auth;
}

export type _TGetBackUp = {
    all: object[]
    latest: object
}

export type _TBackUp = {
    set(data: object): void
    get<_TKey extends keyof _TGetBackUp>(data: _TKey): _TGetBackUp[_TKey]
}

interface _IFireBase {
    auth(code?: string): Promise<_IUserData>;
    write(key: _TDocKeys, segment: string, packages: any): Promise<void>;
    key(key: _TDocKeys, segment: string): ReturnType<typeof pTS.firebase.firestore.doc>;
    backup<_TKey extends keyof _TBackUp>(method: _TKey, ...params: Parameters<_TBackUp[_TKey]>): Promise<ReturnType<_TBackUp[_TKey]>>;
    logout(): Promise<void>;
    track(event: string, data?: object): void;
    get<_TKey extends (keyof _TGetter)>(key: _TKey): _TGetter[_TKey]
}

const _$: _IFireBase = js.createMap(true);

let _$user: { uid: string, auth_token: string } = void 0

const _$init = new Promise<void>(_rs => {
    pObject.hook(globalThis['pTS'], 'firebase').then((_$fb: typeof pTS.firebase) => {
        const _$app = _$fb.initializeApp(config);
        const _$analysis = _$fb.analytics.getAnalytics(_$app);
        const _$firestore = _$fb.firestore.getFirestore(_$app);
        const _$auth = _$fb.auth.getAuth(_$app);

        _$.get = function(key): any {
            switch(key) {
                case "app": return _$app;
                case "analytics": return _$analysis;
                case "firestore": return _$firestore;
                case "auth": return _$auth;
                default: return null
            }
        }

        _$.key = function(key, segment) {
            return _$fb.firestore.doc(_$firestore, key, segment);
        }

        _$.write = function(key, segment, packages) {
            return _$fb.firestore.setDoc(_$.key(key, segment), packages);
        }

        _$.backup = function(key, ...params): any {
            if(!_$user) return;
            switch(key) {
                case 'set': {
                    return _$.write('game_data', _$user.uid, params[0]);
                }
                case 'get': {
                    switch(params[0]) {
                        case 'all': return []
                        case 'latest': return {}
                    }
                }
            }

            return
        }

        _$.track = function(event, data) {
        }

        _$.logout = async function() {
            try {
                _$fb.auth.signOut(_$auth);
                _$user = void 0;
            } catch (error) {
                console.error("Error logging out:", error);
            }
        }

        async function _auth() {
            const _credential = await pTS.firebase.auth.signInAnonymously(_$auth);
            const _user = _credential.user;
            const _token = pString.uuid([2,4,8,4,2]);

            const _package = {
                created_at: ( new Date() ).toISOString(),
                auth_token: _token,
            }

            _$user = {
                auth_token: _token,
                uid: _user.uid,
            }

            await Promise.all([
                _$.write('users', _user.uid, _package),
                _$.write('login_codes', _token, { owner: _user.uid, created_at: _$fb.firestore.serverTimestamp() })
            ])

            return { ..._package, uid: _user.uid }
        }

        _$.auth = async function(code?: string) {
            try {
                if(!code) return _auth();

                code = code.trim().toUpperCase();
                const _ref = _$.key('login_codes', code);

                const _mirrage = await _$fb.firestore.runTransaction(_$firestore, async _transaction => {
                    const _snap = await _transaction.get(_ref);
                    if(!_snap.exists()) {
                        throw new Error(`Login code ${code} does not exist.`);
                    }

                    const _ouuid = _snap.data().owner;
                    const _ouref = _$.key('users', _ouuid);
                    const _ousnap = await _transaction.get(_ouref);

                    if(!_ousnap.exists()) {
                        throw new Error(`User with UID ${_ouuid} does not exist.`);
                    }

                    const _player = _ousnap.data();
                    return Object.assign(_player, { uid: _ouuid }) as _IUserData;
                })

                _$user = {
                    auth_token: _mirrage.auth_token,
                    uid: _mirrage.uid
                }

                return _mirrage
            } catch (error) {
                console.error("Error logging in anonymously:", error);
                return null
            }
        }

        _rs();
    })
});

type _$TMethodKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

async function _caller<K extends keyof _TGetter>(method: 'get', key: K): Promise<_TGetter[K]>;
async function _caller(method: 'backup', subMethod: 'set', data: object): Promise<void>;
async function _caller<K extends keyof _TGetBackUp>(method: 'backup', subMethod: 'get', data: K): Promise<_TGetBackUp[K]>;
async function _caller<TMethod extends Exclude<_$TMethodKeys<_IFireBase>, 'get' | 'backup'>>(
    method: TMethod,
    ...args: Parameters<_IFireBase[TMethod]>
): Promise<Awaited<ReturnType<_IFireBase[TMethod]>>>;
async function _caller(method: string, ...args: any[]): Promise<any> {
    await _$init;
    if (typeof (_$ as any)[method] !== "function") {
        throw new Error(`Method ${String(method)} not found in FireBase`);
    }

    const _fn = (_$ as any)[method];
    return await _fn(...args);
}

export const FireBase = Object.assign(_caller, {
    ready() { return _$init; },
})

export namespace FireBase {
    export type IUserData = _IUserData;
}

DEV && (window['FireBase'] = FireBase)
