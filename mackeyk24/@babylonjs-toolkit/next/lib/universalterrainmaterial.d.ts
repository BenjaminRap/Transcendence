import { Scene } from '@babylonjs/core/scene';
import { CustomShaderMaterial } from './customshadermaterial';
import { ShaderLanguage } from '@babylonjs/core/Materials';
import { MaterialDefines } from '@babylonjs/core/Materials/materialDefines';
import { UniformBuffer } from '@babylonjs/core/Materials/uniformBuffer';
import { SubMesh } from '@babylonjs/core/Meshes/subMesh';
import { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import { AbstractEngine } from '@babylonjs/core/Engines/abstractEngine';
import { CustomShaderMaterialPlugin } from './customshadermaterialplugin';
export declare class UniversalTerrainMaterial extends CustomShaderMaterial {
    protected terrainInfo: any;
    constructor(name: string, scene: Scene);
    update(): void;
    getClassName(): string;
    getTerrainInfo(): any;
}
export declare class UniversalTerrainMaterialPlugin extends CustomShaderMaterialPlugin {
    private colorName;
    private splatmapSampler;
    private detailsSampler;
    private normalsSampler;
    private GLSL_CustomFragment;
    private GLSL_CustomVertex;
    private GLSL_VertexMainEnd;
    private GLSL_FragmentUpdateColor;
    private WGSL_CustomFragment;
    private WGSL_CustomVertex;
    private WGSL_VertexMainEnd;
    private WGSL_FragmentUpdateColor;
    constructor(customMaterial: CustomShaderMaterial, shaderName: string);
    isCompatible(shaderLanguage: ShaderLanguage): boolean;
    getClassName(): string;
    getCustomCode(shaderType: string, shaderLanguage: ShaderLanguage): any;
    getUniforms(shaderLanguage: ShaderLanguage): any;
    getSamplers(samplers: string[]): void;
    getAttributes(attributes: string[], scene: Scene, mesh: AbstractMesh): void;
    prepareDefines(defines: MaterialDefines, scene: Scene, mesh: AbstractMesh): void;
    bindForSubMesh(uniformBuffer: UniformBuffer, scene: Scene, engine: AbstractEngine, subMesh: SubMesh): void;
    private WGSL_FormatTerrainVertexDefintions;
    private WGSL_FormatTerrainVertexMainEnd;
    private WGSL_FormatTerrainFragmentDefintions;
    private WGSL_FormatTerrainFragmentUpdateColor;
    private GLSL_FormatTerrainVertexDefintions;
    private GLSL_FormatTerrainVertexMainEnd;
    private GLSL_FormatTerrainFragmentDefintions;
    private GLSL_FormatTerrainFragmentUpdateColor;
}
//# sourceMappingURL=universalterrainmaterial.d.ts.map