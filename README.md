# `pts-firebase` - Firebase Web SDK Integration & Cloud Controller

> **Author**: pTSern  
> **Version**: `1.0.0`  
> **Cocos Creator Compatibility**: `>= 3.8.0`  
> **Category**: Backend Services, Authentication & Cloud Sync

---

## 1. Overview

`pts-firebase` seamlessly integrates the **Firebase Web SDK** into Cocos Creator projects. It provides a visual editor panel for configuring Firebase API credentials, automatic persistence into project settings and local config files, and a reactive runtime controller (`FireBase_Controller`) for user authentication, cloud saves, and Firestore/Realtime Database synchronization.

---

## 2. Process Architecture & Topology

```
┌─────────────────────────────────────────────────────────────┐
│                 Editor Panel & Main Process                 │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ Firebase Panel       │         │ Project Profile Sync │  │
│  │ (source/panel.ts)    │         │ (profile.project)    │  │
│  └──────────┬───────────┘         └──────────┬───────────┘  │
│             │                                │              │
│             ▼                                ▼              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Generates `assets/_$config/config.json`                │  │
│  │ (apiKey, authDomain, projectId, storageBucket, ...)   │  │
│  └──────────────────────────┬────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Runtime Pipeline                       │
│                                                             │
│  ┌──────────────────────┐         ┌──────────────────────┐  │
│  │ FireBase.Initialize  │────────►│ Firebase Web SDK     │  │
│  │ (Auth & DB bootstrap)│         │ (Auth, Firestore, DB)│  │
│  └──────────┬───────────┘         └──────────────────────┘  │
│             │                                               │
│             ▼                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ FireBase_Controller (extends Event_Driver)            │  │
│  │ - onAuthSuccess, onAuthFail                           │  │
│  │ - onSyncComplete, onSyncFail                          │  │
│  │ - pEngine.Json data synchronization                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Features & Subsystems

### 3.1. Editor Credentials Panel (`source/panel.ts`)
* Open via **Extension -> pTS Firebase -> Open Panel**.
* Dedicated interface for entering Firebase project parameters:
  * **API Key** (`apiKey`)
  * **Auth Domain** (`authDomain`)
  * **Database URL** (`databaseURL`)
  * **Project ID** (`projectId`)
  * **Storage Bucket** (`storageBucket`)
  * **Messaging Sender ID** (`messagingSenderId`)
  * **App ID** (`appId`)
  * **Measurement ID** (`measurementId`)
* **Auto-Save**: Changes automatically save to project preferences (`profile::project::changed_config`) and compile directly into `assets/_$config/config.json`.

---

### 3.2. Runtime Bootstrap (`FireBase.Initialize.ts`)
* Imports active `config.json` at startup.
* Initializes the Firebase application instance.
* Sets up authentication providers and maintains the local session token, UID, and creation timestamp:
  ```typescript
  interface IUserData {
      auth_token: string;
      created_at: string;
      uid: string;
  }
  ```
* Connects to Firestore collections (`users`, `login_codes`, `backup`).

---

### 3.3. Cloud Event Controller (`FireBase.Controller.ts`)
* Singleton component extending `Event_Driver` from `pts-core`.
* Exposes decoupled lifecycle events that other gameplay systems can subscribe to:
  * `onAuthSuccess`: Dispatched when anonymous or credentialed login completes.
  * `onAuthFail`: Dispatched on network or authentication errors.
  * `onSyncComplete`: Triggered when player cloud data syncs successfully.
  * `onSyncFail`: Dispatched if conflict or offline conditions occur.
* Integrates with `pEngine.Json` for schema-safe payload serialization and deserialization.

---

## 4. Usage Example

```typescript
import { _decorator, Component } from 'cc';
import { FireBase_Controller } from 'db://pts-firebase/scripts/FireBase.Controller';

const { ccclass } = _decorator;

@ccclass('PlayerCloudSync')
export class PlayerCloudSync extends Component {
    start() {
        const fb = FireBase_Controller.instance;

        fb.on('onAuthSuccess', (userData) => {
            console.log(`Logged in as Firebase User: ${userData.uid}`);
        }, this);

        fb.on('onSyncComplete', () => {
            console.log('Player progress saved to Firebase Firestore!');
        }, this);
    }
}
```

---

## 5. Integration with `pts-core`

* Inherits from `Event_Driver` for event routing across the game.
* Employs `pClass.singleton` and `pEngine.Json` for data serialization.
* Typings provided globally via `assets/_$plugins/pts.firebase.d.ts`.
