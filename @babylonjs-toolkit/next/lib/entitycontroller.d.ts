import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
export declare class EntityController {
    static HasNetworkEntity(transform: TransformNode): boolean;
    static GetNetworkEntityId(transform: TransformNode): string;
    static GetNetworkEntityType(transform: TransformNode): number;
    static GetNetworkEntitySessionId(transform: TransformNode): string;
    static QueryNetworkAttribute(transform: TransformNode, key: string): string;
    static QueryBufferedAttribute(transform: TransformNode, index: number): number;
    static PostBufferedAttribute(transform: TransformNode, index: number, value: number): void;
}
//# sourceMappingURL=entitycontroller.d.ts.map