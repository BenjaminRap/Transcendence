import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { getFrontendSceneData } from "../PongGame";
import { Text } from "./Text";
import type { EndData } from "@shared/attachedScripts/GameManager";
import type { TimerManager } from "@shared/attachedScripts/TimerManager";

export class TerminalText extends CustomScriptComponent {
	private static readonly _terminalWelcomeMessage = "> Welcome to Transendence ! Type `help` for instructions.";
	private static readonly _cursorBlinkingInterval = 500;
	private static readonly _writeInterval = 25;
	private static readonly _maxCombinedCommands = 4;

	@Imported("Text") private _text! : Text;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _commandPrefix! : string;
	private _isCursorVisible = false;
	private _currentCommand = "";
	private _currentOutput = "";
	private _currentCommandIndex = 0;
	private _commandCount = 0;

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
		this._timerManager.setInterval(() => this.updateCursor(), TerminalText._cursorBlinkingInterval);
		this._timerManager.setInterval(() => this.writeCommand(), TerminalText._writeInterval);
	}

	private	writeCommand()
	{
		if (this._currentCommand.length === 0)
			return ;
		const	currentText = this._text.getText();
		const	currentTextWithoutcursor = this.removeCursor(currentText);
		const	cursor = (this._isCursorVisible) ? "|" : "";
		const	newCharacter = this._currentCommand[this._currentCommandIndex];
		const	newTextWithoutCursor = `${currentTextWithoutcursor}${newCharacter}`;

		this._currentCommandIndex++;
		if (this._currentCommandIndex === this._currentCommand.length)
		{
			this._text.setText(`${newTextWithoutCursor}\n${this._currentOutput}${this._commandPrefix}${cursor}`);
			this._currentCommandIndex = 0;
			this._commandCount = 0;
			this._currentCommand = "";
			this._currentOutput = "";
		}
		else
			this._text.setText(`${newTextWithoutCursor}${cursor}`);
	}

	private	updateCursor()
	{
		const	currentText = this._text.getText();
		const	newText = (this._isCursorVisible)
			? this.removeCursor(currentText)
			: currentText + "|";

		this._isCursorVisible = !this._isCursorVisible;
		this._text.setText(newText);
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
		sceneData.events.getObservable("game-unpaused").add(() => this.executeCommand("state", "unpaused"));
	}

	private	executeCommand(command : string, output? : string)
	{
		if (this._commandCount >= TerminalText._maxCombinedCommands)
			return ;
		const	formattedOutput = output ? `> ${output}\n` : "";

		if (this._currentCommand.length !== 0)
			this._currentCommand += " & ";
		this._currentCommand += command;
		this._currentOutput += formattedOutput;
		this._commandCount++;
	}

	private	removeCursor(currentText : string)
	{
		if (!this._isCursorVisible)
			return currentText;
		return currentText.slice(0, currentText.length - 1);
	}
}

SceneManager.RegisterClass("TerminalText", TerminalText);
