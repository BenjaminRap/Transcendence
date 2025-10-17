import { MaterialPluginBase } from '@babylonjs/core/Materials/materialPluginBase';
export class CustomShaderMaterialPlugin extends MaterialPluginBase {
    constructor(material, name, priority, defines, addToPluginList = true, enable = true, resolveIncludes = false) {
        super(material, name, priority, defines, addToPluginList, enable, resolveIncludes);
        this._isEnabled = false;
        this.vertexDefinitions = null;
        this.fragmentDefinitions = null;
        this.isEnabled = enable;
    }
    get isEnabled() { return this._isEnabled; }
    set isEnabled(enabled) {
        if (this._isEnabled === enabled)
            return;
        this._isEnabled = enabled;
        this.markAllDefinesAsDirty();
        this._enable(this._isEnabled);
    }
    getCustomShaderMaterial() {
        return this._material;
    }
}
