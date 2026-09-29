export class LocalMessageBus {
    constructor() {
        this.ListenerDictionary = {};
    }
    OnMessage(messageName, handler) {
        let listeners;
        if (this.ListenerDictionary[messageName] == null) {
            listeners = [];
            this.ListenerDictionary[messageName] = listeners;
        }
        else {
            listeners = this.ListenerDictionary[messageName];
        }
        const index = listeners.findIndex((e) => { return handler == e; });
        if (index < 0)
            listeners.push(handler);
    }
    PostMessage(messageName, data = null) {
        const listeners = this.ListenerDictionary[messageName];
        if (listeners == null)
            return;
        listeners.forEach((listener) => { try {
            if (listener)
                listener(data);
        }
        catch (e) {
            console.warn(e);
        } });
    }
    RemoveHandler(messageName, handler) {
        const listeners = this.ListenerDictionary[messageName];
        if (listeners == null)
            return;
        const index = listeners.findIndex((e) => { return handler == e; });
        if (index >= 0)
            listeners.splice(index, 1);
    }
    ResetHandlers() {
        this.ListenerDictionary = {};
    }
    Dispose() {
        this.ResetHandlers();
    }
}
