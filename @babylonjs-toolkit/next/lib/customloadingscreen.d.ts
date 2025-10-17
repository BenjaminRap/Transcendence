import { ILoadingScreen } from '@babylonjs/core/Loading/loadingScreen';
export declare class CustomLoadingScreen implements ILoadingScreen {
    loadingDivId: string;
    loadingUIText: string;
    hideLoadingUIWithEngine: boolean;
    customInnerHtml: string;
    customInnerCss: string;
    loadingUIBackgroundColor: string;
    constructor(loadingDivId: string, loadingUIText: string, hideLoadingUIWithEngine?: boolean, customInnerHtml?: string, customInnerCss?: string);
    displayLoadingUI(): void;
    hideLoadingUI(): void;
    showLoadingDiv(show: boolean): void;
    getLoadingDiv(): HTMLDivElement;
    hasLoadingDiv(): boolean;
}
//# sourceMappingURL=customloadingscreen.d.ts.map