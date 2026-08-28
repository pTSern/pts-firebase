import pkg from '../package.json';
import path from 'path';
import fs from 'fs';

export const template = `
<div class="panel-container">
    <div class="panel-header">
        <div class="header-title">Firebase Configuration</div>
        <div class="header-desc">Manage Firebase Web SDK initialization parameters saved to assets/_$config/config.json</div>
    </div>

    <div class="form-container">
        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Web API Key (apiKey)">API Key</ui-label>
            <ui-input slot="content" class="api-key" placeholder="AIzaSy..." show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Auth Domain (e.g. your-app.firebaseapp.com)">Auth Domain</ui-label>
            <ui-input slot="content" class="auth-domain" placeholder="your-app.firebaseapp.com" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Realtime Database URL (optional)">Database URL</ui-label>
            <ui-input slot="content" class="database-url" placeholder="https://your-app-default-rtdb.firebaseio.com" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Project ID (projectId)">Project ID</ui-label>
            <ui-input slot="content" class="project-id" placeholder="your-project-id" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Storage Bucket URL (storageBucket)">Storage Bucket</ui-label>
            <ui-input slot="content" class="storage-bucket" placeholder="your-app.appspot.com" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Cloud Messaging Sender ID (messagingSenderId)">Messaging Sender ID</ui-label>
            <ui-input slot="content" class="messaging-sender-id" placeholder="123456789012" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Firebase Web Application ID (appId)">App ID</ui-label>
            <ui-input slot="content" class="app-id" placeholder="1:123456789012:web:abcdef123456" show-clear></ui-input>
        </ui-prop>

        <ui-prop>
            <ui-label slot="label" tooltip="Google Analytics Measurement ID (e.g. G-XXXXXXX)">Measurement ID</ui-label>
            <ui-input slot="content" class="measurement-id" placeholder="G-XXXXXXXXXX" show-clear></ui-input>
        </ui-prop>

        <div class="divider"></div>

        <ui-prop>
            <ui-label slot="label" tooltip="Automatically write changes to config.json when inputs change">Auto Save</ui-label>
            <ui-checkbox slot="content" class="auto-save"></ui-checkbox>
        </ui-prop>
    </div>

    <div class="actions-container">
        <ui-button class="save-btn" type="success">Save to config.json</ui-button>
        <ui-button class="reload-btn" type="secondary">Reload from Disk</ui-button>
        <ui-button class="clear-btn" type="warning">Clear Fields</ui-button>
    </div>

    <div class="status-bar">
        <span class="status-text">Ready</span>
    </div>
</div>
`;

export const style = `
:host {
    display: flex;
    flex-direction: column;
    padding: 14px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: var(--color-normal-text, #ddd);
}

.panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 12px;
    overflow: hidden;
}

.panel-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-normal-border, #444);
}

.header-title {
    font-size: 15px;
    font-weight: bold;
    color: #ffca28;
}

.header-desc {
    font-size: 11px;
    opacity: 0.7;
}

.form-container {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
}

.divider {
    height: 1px;
    background: var(--color-normal-border, #3a3a3a);
    margin: 4px 0;
}

.actions-container {
    display: flex;
    gap: 10px;
    padding-top: 8px;
    border-top: 1px solid var(--color-normal-border, #444);
}

.actions-container ui-button {
    flex: 1;
}

.status-bar {
    display: flex;
    align-items: center;
    font-size: 11px;
    padding: 4px 6px;
    background: var(--color-normal-fill, #252525);
    border-radius: 3px;
    border: 1px solid var(--color-normal-border, #333);
}

.status-text {
    opacity: 0.85;
}
`;

export const $ = {
    apiKey: '.api-key',
    authDomain: '.auth-domain',
    databaseURL: '.database-url',
    projectId: '.project-id',
    storageBucket: '.storage-bucket',
    messagingSenderId: '.messaging-sender-id',
    appId: '.app-id',
    measurementId: '.measurement-id',
    autoSave: '.auto-save',
    saveBtn: '.save-btn',
    reloadBtn: '.reload-btn',
    clearBtn: '.clear-btn',
    statusText: '.status-text'
};

const FIELDS = [
    'apiKey',
    'authDomain',
    'databaseURL',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
    'measurementId'
] as const;

type FieldKey = typeof FIELDS[number];

let activePanel: any = null;

function getConfigPath(): string {
    return path.resolve(Editor.Project.path, 'extensions', pkg.name, 'assets', '_$config', 'config.json');
}

function readConfigDisk(): Record<FieldKey, string> {
    const configPath = getConfigPath();
    const config: Record<FieldKey, string> = {
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
            const data = JSON.parse(raw);
            if (data && typeof data === 'object') {
                for (const key of FIELDS) {
                    if (typeof data[key] === 'string') {
                        config[key] = data[key];
                    }
                }
            }
        } catch (e) {
            console.error(`[${pkg.name}] Error reading config from disk:`, e);
        }
    }
    return config;
}

function writeConfigDisk(data: Record<FieldKey, string>): boolean {
    const configPath = getConfigPath();
    const configDir = path.dirname(configPath);

    try {
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        fs.writeFileSync(configPath, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (e) {
        console.error(`[${pkg.name}] Failed to save config to disk:`, e);
        return false;
    }
}

function setStatus(thisAny: any, msg: string, isError: boolean = false) {
    if (thisAny.$.statusText) {
        thisAny.$.statusText.textContent = msg;
        thisAny.$.statusText.style.color = isError ? '#ff7875' : '#52c41a';
    }
}

function getFormValues(thisAny: any): Record<FieldKey, string> {
    return {
        apiKey: thisAny.$.apiKey?.value || '',
        authDomain: thisAny.$.authDomain?.value || '',
        databaseURL: thisAny.$.databaseURL?.value || '',
        projectId: thisAny.$.projectId?.value || '',
        storageBucket: thisAny.$.storageBucket?.value || '',
        messagingSenderId: thisAny.$.messagingSenderId?.value || '',
        appId: thisAny.$.appId?.value || '',
        measurementId: thisAny.$.measurementId?.value || ''
    };
}

async function saveAllData(thisAny: any, showNotice: boolean = true) {
    const form = getFormValues(thisAny);
    const success = writeConfigDisk(form);

    for (const key of FIELDS) {
        await Editor.Profile.setProject(pkg.name, key, form[key]);
    }

    if (success) {
        if (showNotice) {
            const timeStr = new Date().toLocaleTimeString();
            setStatus(thisAny, `Saved to config.json at ${timeStr}`);
        }
    } else {
        setStatus(thisAny, 'Failed to write config.json (check console)', true);
    }
}

async function syncProfileValues(thisAny: any) {
    const profile = await Editor.Profile.getProject(pkg.name) as any || {};
    const disk = readConfigDisk();

    for (const key of FIELDS) {
        const val = profile[key] !== undefined && profile[key] !== '' ? profile[key] : (disk[key] || '');
        if (thisAny.$[key]) {
            thisAny.$[key].value = val;
        }
    }

    if (thisAny.$.autoSave) {
        thisAny.$.autoSave.value = typeof profile.auto_save === 'boolean' ? profile.auto_save : true;
    }

    setStatus(thisAny, 'Config loaded');
}

const onWindowFocus = () => {
    if (activePanel) {
        syncProfileValues(activePanel);
    }
};

export const ready = async function(this: any) {
    activePanel = this;

    await syncProfileValues(this);

    window.addEventListener('focus', onWindowFocus);

    const onInputChange = async (field: FieldKey) => {
        const val = this.$[field]?.value || '';
        await Editor.Profile.setProject(pkg.name, field, val);
        await Editor.Message.send(pkg.name, 'profile::project::changed_config', field, val);

        if (this.$.autoSave?.value) {
            await saveAllData(this, true);
        } else {
            setStatus(this, 'Unsaved changes (Auto Save is off)');
        }
    };

    for (const field of FIELDS) {
        const elem = this.$[field];
        if (elem) {
            elem.addEventListener('confirm', () => onInputChange(field));
            elem.addEventListener('change', () => onInputChange(field));
        }
    }

    this.$.autoSave?.addEventListener('change', async () => {
        const val = Boolean(this.$.autoSave.value);
        await Editor.Profile.setProject(pkg.name, 'auto_save', val);
        await Editor.Message.send(pkg.name, 'profile::project::changed_auto_save', 'auto_save', val);

        if (val) {
            await saveAllData(this, true);
        }
    });

    this.$.saveBtn?.addEventListener('click', async () => {
        await saveAllData(this, true);
    });

    this.$.reloadBtn?.addEventListener('click', async () => {
        const disk = readConfigDisk();
        for (const key of FIELDS) {
            if (this.$[key]) {
                this.$[key].value = disk[key] || '';
            }
            await Editor.Profile.setProject(pkg.name, key, disk[key] || '');
        }
        setStatus(this, 'Reloaded from config.json');
    });

    this.$.clearBtn?.addEventListener('click', async () => {
        for (const key of FIELDS) {
            if (this.$[key]) {
                this.$[key].value = '';
            }
            await Editor.Profile.setProject(pkg.name, key, '');
        }
        if (this.$.autoSave?.value) {
            await saveAllData(this, true);
        } else {
            setStatus(this, 'Cleared all fields (Click Save to apply)');
        }
    });
};

export const close = function(this: any) {
    window.removeEventListener('focus', onWindowFocus);
    activePanel = null;
};
