import { Material } from '@babylonjs/core/Materials/material';
import { CustomShaderMaterial } from './customshadermaterial';
import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
export declare class CustomShaderMaterialPlugin extends MaterialPluginBase {
    private _isEnabled;
    constructor(material: Material, name: string, priority: number, defines?: {}, addToPluginList?: boolean, enable?: boolean, resolveIncludes?: boolean);
    get isEnabled(): boolean;
    set isEnabled(enabled: boolean);
    vertexDefinitions: string;
    fragmentDefinitions: string;
    getCustomShaderMaterial(): CustomShaderMaterial;
}
//# sourceMappingURL=customshadermaterialplugin.d.ts.map