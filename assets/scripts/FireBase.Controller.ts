import { _decorator, JsonAsset } from 'cc';
import { Event_Driver } from 'db://pts-core/scripts/Components/Event/Event.Driver';
import { pConst, pEngine } from 'db://pts-core/scripts/utils';
import { FireBase } from './FireBase.Initialize';
import { singleton } from 'db://pts-core/scripts/utils/pClass';
import { Data_Manager } from 'db://pts-core/scripts/data/manager';

const { ccclass, property } = _decorator;

interface _I {
    onSyncComplete: Function;
    onSyncFail: pFlex.TTFunc.Fail;
    onAuthSuccess: pFlex.TFunc<[FireBase.IUserData], void>;
    onAuthFail: pFlex.TTFunc.Fail
    onFireBaseReady: pFlex.TTFunc.Void;
    onPreLoad: pFlex.TFunc;
}

@ccclass('FireBase_Controller')
@singleton()
export class FireBase_Controller extends Event_Driver<_I> {
    protected static _$bounces = ['onSyncComplete', 'onSyncFail', 'onAuthSuccess', 'onAuthFail', 'onFireBaseReady'];

    @property({ type: JsonAsset, group: pConst.GROUPS.get('Listener') })
    actAuth: JsonAsset[] = [];

    @property({ type: JsonAsset, group: pConst.GROUPS.get('Listener') })
    actSync: JsonAsset[] = [];

    protected _onPreLoad(): void {
        pEngine.Json.event.add(this.actAuth, { func: this._onAuthLookUp, binder: this });
        pEngine.Json.event.add(this.actSync, { func: this._onSyncData, binder: this });
    }

    protected onDestroy(): void {
        
    }

    protected start(): void {
        FireBase.ready().then(_ => this.emit('onFireBaseReady'));
    }

    protected async _onSyncData() {
        const _data = await Data_Manager.json(true);
        return FireBase('backup', 'set', _data);
    }

    protected async _onAuthLookUp(...args: any[]) {
        let _code = void 0;
        for(const code of args) {
            if(typeof code !== 'string') continue;
            _code = code;
            break;
        }

        try {
            const _data = await FireBase('auth', _code);
            this.emit('onAuthSuccess', _data);
        } catch (error) {
            this.emit('onAuthFail', error);
        }
    }

}
