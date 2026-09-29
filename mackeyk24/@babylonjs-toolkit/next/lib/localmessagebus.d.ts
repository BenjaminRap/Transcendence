export declare class LocalMessageBus {
    OnMessage<T>(messageName: string, handler: (data: T) => void): void;
    PostMessage(messageName: string, data?: any): void;
    RemoveHandler(messageName: string, handler: (data: any) => void): void;
    ResetHandlers(): void;
    Dispose(): void;
    private ListenerDictionary;
}
//# sourceMappingURL=localmessagebus.d.ts.map