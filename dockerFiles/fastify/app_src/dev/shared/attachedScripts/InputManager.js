import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { InputKey } from "../InputKey.js";
import { CustomScriptComponent } from "../CustomScriptComponent.js";
import { PongError } from "../pongError/PongError.js";
export class PlayerInput {
    constructor() {
        this.up = new InputKey();
        this.down = new InputKey();
    }
}
export class InputManager extends CustomScriptComponent {
    constructor(transform, scene, properties = {}, alias = "InputManager") {
        super(transform, scene, properties, alias);
        this._escapeInput = new InputKey();
        this._playersInputs = Array.from({ length: 2 }, () => new PlayerInput);
    }
    getPlayerInput(playerIndex) {
        if (playerIndex > this._playersInputs.length)
            throw new PongError("The player index is too big !", "quitPong");
        return this._playersInputs[playerIndex];
    }
    getEscapeInput() {
        return this._escapeInput;
    }
}
SceneManager.RegisterClass("InputManager", InputManager);
