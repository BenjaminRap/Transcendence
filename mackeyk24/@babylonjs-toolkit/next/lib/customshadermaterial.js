import { Matrix, Vector2 } from '@babylonjs/core/Maths/math.vector';
import { PBRMaterial } from '@babylonjs/core/Materials/PBR/pbrMaterial';
export class CustomShaderMaterial extends PBRMaterial {
    constructor(name, scene) {
        super(name, scene);
        this.universalMaterial = true;
        this._defines = {};
        this._uniforms = [];
        this._samplers = [];
        this._attributes = [];
        this._textures = {};
        this._vectors4 = {};
        this._vectors3 = {};
        this._vectors2 = {};
        this._floats = {};
        this._bools = {};
        this._ubos = null;
        this.shader = null;
        this.plugin = null;
    }
    addAttribute(attributeName) {
        if (this._attributes.indexOf(attributeName) === -1) {
            this._attributes.push(attributeName);
        }
    }
    checkUniform(uniformName, type, value = null) {
        if (this._uniforms.indexOf(uniformName) === -1) {
            this._uniforms.push(uniformName);
            this._defines[uniformName.toUpperCase()] = true;
            this.buildUniformProperty(uniformName, type, value);
        }
    }
    checkSampler(samplerName, texture = null) {
        if (this._samplers.indexOf(samplerName) === -1) {
            this._samplers.push(samplerName);
            this._defines[samplerName.toUpperCase()] = true;
            this.buildUniformProperty(samplerName, "sampler2D", texture);
            this.checkUniform(samplerName + "Infos", "vec2", Vector2.Zero());
            this.checkUniform(samplerName + "Matrix", "mat4", Matrix.Identity());
        }
    }
    addTextureUniform(name, texture) {
        this.checkSampler(name, texture);
        this._textures[name] = texture;
        return this;
    }
    setTextureValue(name, texture) {
        this._textures[name] = texture;
        return this;
    }
    getTextureValue(name) {
        return this._textures[name];
    }
    addVector4Uniform(name, value) {
        this.checkUniform(name, "vec4", value);
        this._vectors4[name] = value;
        return this;
    }
    setVector4Value(name, value) {
        this._vectors4[name] = value;
        return this;
    }
    getVector4Value(name) {
        return this._vectors4[name];
    }
    addVector3Uniform(name, value) {
        this.checkUniform(name, "vec3", value);
        this._vectors3[name] = value;
        return this;
    }
    setVector3Value(name, value) {
        this._vectors3[name] = value;
        return this;
    }
    getVector3Value(name) {
        return this._vectors3[name];
    }
    addVector2Uniform(name, value) {
        this.checkUniform(name, "vec2", value);
        this._vectors2[name] = value;
        return this;
    }
    setVector2Value(name, value) {
        this._vectors2[name] = value;
        return this;
    }
    getVector2Value(name) {
        return this._vectors2[name];
    }
    addFloatUniform(name, value) {
        this.checkUniform(name, "float", value);
        this._floats[name] = value;
        return this;
    }
    setFloatValue(name, value) {
        this._floats[name] = value;
        return this;
    }
    getFloatValue(name) {
        return this._floats[name];
    }
    addBoolUniform(name, value) {
        this.checkUniform(name, "bool", value);
        this._bools[name] = value;
        return this;
    }
    setBoolValue(name, value) {
        this._bools[name] = value;
        return this;
    }
    getBoolValue(name) {
        return this._bools[name];
    }
    getAnimatables() {
        const results = super.getAnimatables();
        for (const name in this._textures) {
            const texture = this._textures[name];
            if (texture && texture.animations && texture.animations.length > 0)
                results.push(texture);
        }
        return results;
    }
    getActiveTextures() {
        const results = super.getActiveTextures();
        for (const name in this._textures) {
            const texture = this._textures[name];
            if (texture)
                results.push(texture);
        }
        return results;
    }
    hasTexture(texture) {
        if (super.hasTexture(texture)) {
            return true;
        }
        let found = false;
        for (const name in this._textures) {
            const texture = this._textures[name];
            if (texture === texture) {
                found = true;
                break;
            }
        }
        return found;
    }
    getCustomUniforms(wgsl) {
        let result = null;
        if (this._ubos != null && this._ubos.length > 0) {
            result = this._ubos.filter(uniform => uniform.type !== "sampler2D");
        }
        return result;
    }
    getCustomSamplers() {
        return this._samplers;
    }
    getCustomAttributes() {
        return this._attributes;
    }
    getCustomVertexCode(wgsl) {
        return null;
    }
    getCustomFragmentCode(wgsl) {
        let result = null;
        if (this._ubos != null && this._ubos.length > 0) {
            result = "#ifdef " + this.shader.toUpperCase() + "\n";
            this._ubos.forEach((ubo) => {
                if (wgsl === true) {
                    if (ubo.type === "sampler2D") {
                        result += "\tvar " + ubo.name + ": texture_2d<f32>;\n";
                        result += "\tvar " + ubo.name + "Sampler: sampler;\n";
                    }
                }
                else {
                    if (ubo.type === "float" || ubo.type === "bool" || ubo.type === "int") {
                        result += "\tuniform float " + ubo.name + ";\n";
                    }
                    else if (ubo.type === "vec2") {
                        result += "\tuniform vec2 " + ubo.name + ";\n";
                    }
                    else if (ubo.type === "vec3") {
                        result += "\tuniform vec3 " + ubo.name + ";\n";
                    }
                    else if (ubo.type === "vec4") {
                        result += "\tuniform vec4 " + ubo.name + ";\n";
                    }
                    else if (ubo.type === "mat4") {
                        result += "\tuniform mat4 " + ubo.name + ";\n";
                    }
                    else if (ubo.type === "sampler2D") {
                        result += "\tuniform sampler2D " + ubo.name + ";\n";
                    }
                }
            });
            result += "#endif\n";
        }
        return result;
    }
    prepareCustomDefines(defines) {
        defines[this.shader.toUpperCase()] = true;
        if (this._defines != null) {
            const keys = Object.keys(this._defines);
            if (keys != null && keys.length > 0) {
                for (const key of keys) {
                    defines[key] = this._defines[key];
                }
            }
        }
        if (defines.isDirty)
            defines.rebuild();
    }
    updateCustomBindings(effect) {
        let name;
        const scene = this.getScene();
        const instance = this;
        if (instance["update"])
            instance["update"]();
        if (scene.texturesEnabled) {
            for (name in this._textures) {
                const texture = this._textures[name];
                if (texture != null && texture.isReady && texture.isReady()) {
                    if (texture.isChecked == null) {
                        texture.isChecked = true;
                        if (name === "detailsSampler" || name === "normalsSampler" || name.indexOf("(Atlas)") >= 0) {
                            texture.updateSamplingMode(8);
                        }
                    }
                    effect.setTexture(name, texture);
                    effect.updateFloat2(name + "Infos", texture.coordinatesIndex, texture.level);
                    effect.updateMatrix(name + "Matrix", texture.getTextureMatrix());
                }
            }
        }
        for (name in this._vectors4) {
            effect.updateVector4(name, this._vectors4[name]);
        }
        for (name in this._vectors3) {
            effect.updateVector3(name, this._vectors3[name]);
        }
        for (name in this._vectors2) {
            effect.updateFloat2(name, this._vectors2[name].x, this._vectors2[name].y);
        }
        for (name in this._floats) {
            effect.updateFloat(name, this._floats[name]);
        }
        for (name in this._bools) {
            effect.updateFloat(name, this._bools[name] ? 1.0 : 0.0);
        }
        effect.update();
    }
    buildUniformProperty(uniformName, uniformType, uniformValue) {
        let uniformSize = 1;
        switch (uniformType) {
            case "float":
                uniformSize = 1;
                break;
            case "bool":
                uniformSize = 1;
                break;
            case "int":
                uniformSize = 1;
                break;
            case "vec2":
                uniformSize = 2;
                break;
            case "vec3":
                uniformSize = 3;
                break;
            case "vec4":
                uniformSize = 4;
                break;
            case "mat4":
                uniformSize = 16;
                break;
        }
        if (this._ubos == null)
            this._ubos = [];
        this._ubos.push({ name: uniformName, size: uniformSize, type: uniformType });
    }
}
