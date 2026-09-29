import { TouchMouseButton } from './touchmousebutton';
export declare class TouchJoystickHandler {
    private isFixed;
    private touchId;
    private pointerId;
    private dragStart;
    private mouseButton;
    private maxDistance;
    private deadZone;
    private xvalue;
    private yvalue;
    private stick;
    private base;
    private active;
    enabled: boolean;
    updateElements: boolean;
    preventDefault: boolean;
    stopPropagation: boolean;
    baseElementOpacity: string;
    stickElementOpacity: string;
    onHandleDown: (event: any) => void;
    onHandleMove: (event: any) => void;
    onHandleUp: (event: any) => void;
    constructor(stickid: string, maxdistance: number, deadzone: number, fixed?: boolean, button?: TouchMouseButton, baseid?: string);
    dispose(): void;
    isActive(): boolean;
    getValueX(): number;
    getValueY(): number;
    getMouseButton(): TouchMouseButton;
    getBaseElement(): HTMLElement;
    getStickElement(): HTMLElement;
    isFixedJoystick(): boolean;
    protected handleDown(event: any): void;
    protected handleMove(event: any): void;
    protected handleUp(event: any): void;
    protected showBaseElement(event: any): void;
    hideBaseElement(): void;
}
//# sourceMappingURL=touchjoystickhandler.d.ts.map