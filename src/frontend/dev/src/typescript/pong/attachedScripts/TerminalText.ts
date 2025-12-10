import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { getFrontendSceneData } from "../PongGame";
import { Text } from "./Text";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { TimerManager } from "@shared/attachedScripts/TimerManager";

type command = {
	input : string,
	output : string
}

export class TerminalText extends CustomScriptComponent {
	private static readonly _terminalWelcomeMessage = "Welcome to Transendence ! Type `help` for instructions.";
	private static readonly _cursorBlinkingInterval = 500;

	@Imported("Text") private _text! : Text;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _commandPrefix! : string;
	private _commands : string[] = [];
	private _isCursorVisible = false;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "TerminalText") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		this._commandPrefix = "user@terminal:/$ ";
		this.reset();
		this.listenToEvents();
	}

	protected	start()
	{
		this._timerManager.setInterval(() => {
			const	currentText = this._text.getText();
			const	newText = (this._isCursorVisible)
				? currentText.slice(0, currentText.length - 1)
				: currentText + "|";

			this._isCursorVisible = !this._isCursorVisible;
			this._text.setText(newText);
		}, TerminalText._cursorBlinkingInterval);
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
		const	currentTextWithoutcursor = (this._isCursorVisible) ? currentText.slice(0, currentText.length - 1) : currentText;
		const	formattedOutput = output ? `${output}\n` : "";
		const	cursor = (this._isCursorVisible) ? "|" : "";
		const	newText = `${currentTextWithoutcursor}${command}\n${formattedOutput}${this._commandPrefix}${cursor}`;

		this._text.setText(newText);
	}
}

SceneManager.RegisterClass("TerminalText", TerminalText);
