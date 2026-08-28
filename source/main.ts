import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

export interface IFirebaseConfig {
    apiKey: string;
    authDomain: string;
    databaseURL: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

const CONFIG_KEYS: (keyof IFirebaseConfig)[] = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
];

function getConfigFilePath(): string {
    return path.resolve(__dirname, '..', 'assets', '_$config', 'config.json');
}

export function readConfigFromDisk(): IFirebaseConfig {
    const configPath = getConfigFilePath();
    const defaultConfig: IFirebaseConfig = {
        apiKey: '',
        authDomain: '',
        databaseURL: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        measurementId: ''
    };

    if (fs.existsSync(configPath)) {
        try {
            const raw = fs.readFileSync(configPath, 'utf8');
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
                for (const key of CONFIG_KEYS) {
                    if (typeof parsed[key] === 'string') {
                        defaultConfig[key] = parsed[key];
                    }
                }
            }
        } catch (e) {
            console.error(`[${pkg.name}] Error reading config.json:`, e);
        }
    }
    return defaultConfig;
}

export function writeConfigToDisk(config: Partial<IFirebaseConfig>): boolean {
    const configPath = getConfigFilePath();
    const configDir = path.dirname(configPath);

    try {
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }

        const current = readConfigFromDisk();
        const updated: IFirebaseConfig = {
            apiKey: typeof config.apiKey === 'string' ? config.apiKey : current.apiKey,
            authDomain: typeof config.authDomain === 'string' ? config.authDomain : current.authDomain,
            databaseURL: typeof config.databaseURL === 'string' ? config.databaseURL : current.databaseURL,
            projectId: typeof config.projectId === 'string' ? config.projectId : current.projectId,
            storageBucket: typeof config.storageBucket === 'string' ? config.storageBucket : current.storageBucket,
            messagingSenderId: typeof config.messagingSenderId === 'string' ? config.messagingSenderId : current.messagingSenderId,
            appId: typeof config.appId === 'string' ? config.appId : current.appId,
            measurementId: typeof config.measurementId === 'string' ? config.measurementId : current.measurementId
        };

        fs.writeFileSync(configPath, JSON.stringify(updated, null, 4), 'utf8');
        console.log(`[${pkg.name}] Successfully saved Firebase config to: ${configPath}`);
        return true;
    } catch (e) {
        console.error(`[${pkg.name}] Failed to write config.json:`, e);
        return false;
    }
}

async function syncProfileWithDisk() {
    const diskConfig = readConfigFromDisk();
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};

    let needSaveProfile = false;
    for (const key of CONFIG_KEYS) {
        if (profile[key] === undefined || profile[key] === '') {
            if (diskConfig[key]) {
                await Editor.Profile.setProject(pkg.name, key, diskConfig[key]);
                needSaveProfile = true;
            }
        }
    }
}


function openUrl(url: string) {
    try {
        const { shell } = require('electron');
        if (shell && typeof shell.openExternal === 'function') {
            shell.openExternal(url);
            return;
        }
    } catch {}

    try {
        const { exec } = require('child_process');
        if (process.platform === 'win32') {
            exec(`start "" "${url}"`);
        } else if (process.platform === 'darwin') {
            exec(`open "${url}"`);
        } else {
            exec(`xdg-open "${url}"`);
        }
    } catch (e) {
        console.error('Failed to open URL:', url, e);
    }
}

export async function checkPtsCoreDependency(showDialog: boolean = true): Promise<boolean> {
    try {
        const coreDir = path.join(Editor.Project.path, 'extensions', 'pts-core');
        const pkgFile = path.join(coreDir, 'package.json');
        const isInstalled = fs.existsSync(pkgFile);

        if (!isInstalled) {
            console.error(`[${pkg.name}] ⚠️ Missing HARD Dependency: 'pts-core' was not found in ${coreDir}.`);

            if (showDialog && Editor.Dialog && typeof Editor.Dialog.warn === 'function') {
                const res = await Editor.Dialog.warn(`[${pkg.name}] Missing Hard Dependency: pts-core`, {
                    detail: `The extension "${pkg.name}" has a HARD DEPENDENCY on "pts-core".\n\nWithout "pts-core", scripts, events, and utilities will fail to compile and run.\n\nPlease install "pts-core" from GitHub.`,
                    buttons: ['Install pts-core (GitHub)', 'Cancel'],
                    default: 0,
                    cancel: 1
                });

                const isConfirmed = res === 0 || (res && res.response === 0) || res === true;
                if (isConfirmed) {
                    openUrl('https://github.com/pTSern/pts-core');
                }
            }
            return false;
        }
        return true;
    } catch (e) {
        console.error(`[${pkg.name}] Error checking pts-core dependency:`, e);
        return false;
    }
}

export const methods: { [key: string]: (...any: any[]) => any } = {
    async openPanel() {
        await checkPtsCoreDependency(true);
        Editor.Panel.open(pkg.name);
    },
    async saveConfig(customConfig?: Partial<IFirebaseConfig>) {
        if (customConfig && typeof customConfig === 'object') {
            writeConfigToDisk(customConfig);
            for (const key of CONFIG_KEYS) {
                if (customConfig[key] !== undefined) {
                    await Editor.Profile.setProject(pkg.name, key, customConfig[key]);
                }
            }
        } else {
            const profile = await Editor.Profile.getProject(pkg.name) as any || {};
            const configToSave: Partial<IFirebaseConfig> = {};
            for (const key of CONFIG_KEYS) {
                configToSave[key] = profile[key] || '';
            }
            writeConfigToDisk(configToSave);
        }
    },
    async "profile::project::changed_config"(key: string, value: string) {
        const profile = await Editor.Profile.getProject(pkg.name) as any || {};
        const autoSave = typeof profile.auto_save === 'boolean' ? profile.auto_save : true;

        if (autoSave) {
            const configToSave: Partial<IFirebaseConfig> = {};
            for (const k of CONFIG_KEYS) {
                configToSave[k] = k === key ? value : (profile[k] || '');
            }
            writeConfigToDisk(configToSave);
        }
    },
    async "profile::project::changed_auto_save"(key: string, value: boolean) {
        if (value) {
            const profile = await Editor.Profile.getProject(pkg.name) as any || {};
            const configToSave: Partial<IFirebaseConfig> = {};
            for (const k of CONFIG_KEYS) {
                configToSave[k] = profile[k] || '';
            }
            writeConfigToDisk(configToSave);
        }
    }
};

export function load() {
    checkPtsCoreDependency(false);
    syncProfileWithDisk();
}

export function unload() {}
