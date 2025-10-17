import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { KeyboardEventTypes, KeyboardInfo } from "@babylonjs/core/Events/keyboardEvents";
import { InputKey } from "../InputKey";

export class InputManager extends ScriptComponent {
	private inputKeys : Map<string, InputKey> = new Map<string, InputKey>([
		["z", new InputKey()],
		["s", new InputKey()],
		["ArrowUp", new InputKey()],
		["ArrowDown", new InputKey()]
	]);

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "InputManager") {
        super(transform, scene, properties, alias);
		this.scene.onKeyboardObservable.add(this.onKeyboardInput.bind(this))
    }

	private onKeyboardInput(info : KeyboardInfo)
	{
		let	keyPressed : InputKey | undefined = this.inputKeys.get(info.event.key);

		if (keyPressed === undefined)
			return ;
		if (info.type === KeyboardEventTypes.KEYDOWN)
			keyPressed.setKeyDown();
		else
			keyPressed.setKeyUp();
	}

	public addKeyObserver(key : string, callback : () => void) : void
	{
		let	inputKey : InputKey | undefined = this.inputKeys.get(key);

		if (inputKey === undefined)
			throw new Error("addKeyObserver called with an unsupported key: " + key);
		inputKey.addOnKeyDownObserver(callback);
	}

	public removeKeyObserver(key : string, callback : () => void) : void
	{
		let	inputKey : InputKey | undefined = this.inputKeys.get(key);

		if (inputKey === undefined)
			throw new Error("addKeyObserver called with an unsupported key: " + key);
		inputKey.removeOnKeyDownObserver(callback);
	}

	public getInputKey(key : string) : InputKey
	{
		const	inputKey : InputKey | undefined = this.inputKeys.get(key);

		if (inputKey === undefined)
			throw new Error("getInputKey called with an unsupported key: " + key);
		return (inputKey);
	}
}

SceneManager.RegisterClass("InputManager", InputManager);
