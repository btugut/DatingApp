"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class EventDispatcher {
    constructor() {
        this.changeEvent = new vscode.EventEmitter();
        this.deleteEvent = new vscode.EventEmitter();
        this.createEvent = new vscode.EventEmitter();
        this.disposeIndividualWatcherEvent = new vscode.EventEmitter();
    }
    dispose() {
        this.createEvent.dispose();
        this.deleteEvent.dispose();
        this.changeEvent.dispose();
        this.disposeIndividualWatcherEvent.dispose();
    }
}
class IndividualWatcher {
    constructor(_disp, _pattern) {
        this._disp = _disp;
        this._pattern = _pattern;
        this._watcher = vscode.workspace.createFileSystemWatcher(this._pattern);
        this._changeSub = this._watcher.onDidChange(e => this._disp.changeEvent.fire(e));
        this._delSub = this._watcher.onDidDelete(e => this._disp.deleteEvent.fire(e));
        this._createSub = this._watcher.onDidCreate(e => this._disp.createEvent.fire(e));
    }
    dispose() {
        this._changeSub.dispose();
        this._delSub.dispose();
        this._createSub.dispose();
        this._watcher.dispose();
        this._disp.disposeIndividualWatcherEvent.fire(this);
    }
}
exports.IndividualWatcher = IndividualWatcher;
class MultiWatcher {
    constructor(...patterns) {
        this._watchers = new Set();
        this._dispatcher = new EventDispatcher();
        this._anyEventEmitter = new vscode.EventEmitter();
        this._unregisterSub = this._dispatcher.disposeIndividualWatcherEvent.event(indiv => { this._watchers.delete(indiv); });
        this._createSub = this.onCreate(e => this._anyEventEmitter.fire(e));
        this._delSub = this.onDelete(e => this._anyEventEmitter.fire(e));
        this._changeSub = this.onChange(e => this._anyEventEmitter.fire(e));
        for (const pattern of patterns) {
            this.createWatcher(pattern);
        }
    }
    dispose() {
        this._changeSub.dispose();
        this._delSub.dispose();
        this._createSub.dispose();
        // We copy the watchers into an array so we can modify the set
        for (const indiv of Array.from(this._watchers)) {
            indiv.dispose();
        }
        console.assert(this._watchers.size == 0, 'Expected disposal of individual filesystem watchers');
        this._unregisterSub.dispose();
        this._anyEventEmitter.dispose();
        this._dispatcher.dispose();
    }
    get onChange() { return this._dispatcher.changeEvent.event; }
    get onDelete() { return this._dispatcher.deleteEvent.event; }
    get onCreate() { return this._dispatcher.createEvent.event; }
    get onAnyEvent() { return this._anyEventEmitter.event; }
    createWatcher(pattern) {
        const indiv = new IndividualWatcher(this._dispatcher, pattern);
        this._watchers.add(indiv);
        return indiv;
    }
}
exports.MultiWatcher = MultiWatcher;
//# sourceMappingURL=watcher.js.map