import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { getFrontendSceneData } from "../PongGame";
import { Text } from "./Text";
import type { EndData } from "@shared/attachedScripts/GameManager";

export class TerminalText extends CustomScriptComponent {
	private static readonly _terminalWelcomeMessage = "Welcome to Transendence ! Type `help` for instructions.";

	@Imported("Text") private _text! : Text;

	private _commandPrefix! : string;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "TerminalText") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		this._commandPrefix = "user@terminal:/$ ";
		this.reset();
		this.listenToEvents();
	}

	private	reset()
	{
		const	startText = `${TerminalText._terminalWelcomeMessage}\n${this._commandPrefix}`;

		this._text.setText(startText);
	}

	private	listenToEvents()
	{
		const	sceneData = getFrontendSceneData(this.scene);

		sceneData.events.getObservable("updateRightScore").add((newscore : number) => {
			this.executeCommand("goal --left", `score updated : ${newscore}`);
		});
		sceneData.events.getObservable("updateLeftScore").add((newscore : number) => {
			this.executeCommand("goal --right", `score updated : ${newscore}`);
		});
		sceneData.events.getObservable("end").add((endData : EndData) => {
			let	output;
			if (endData.forfeit)
				output = "forfeit";
			else if (endData.winner === "draw")
				output = "draw";
			else
				output = `Win from ${endData.winner}`
			this.executeCommand("match --end", output);
		});
		sceneData.events.getObservable("game-start").add(() => {
			this.reset();
			this.executeCommand("game-start")
		});
		sceneData.events.getObservable("forfeit").add(() => this.executeCommand("forfeit"));
		sceneData.events.getObservable("game-paused").add(() => this.executeCommand("state", "paused"));
		sceneData.events.getObservable("game-unpaused").add(() => this.executeCommand("state", "unpaused"));
	}

	private	executeCommand(command : string, output? : string)
	{
		const	currentText = this._text.getText();
		const	formattedOutput = output ? `${output}\n` : "";
		const	newText = `${currentText}${command}\n${formattedOutput}${this._commandPrefix}`;

		this._text.setText(newText);
	}
}

SceneManager.RegisterClass("TerminalText", TerminalText);
