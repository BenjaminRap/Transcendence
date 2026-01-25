import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager } from "@babylonjs-toolkit/next";
import { CustomScriptComponent } from "@shared/CustomScriptComponent";
import { Imported } from "@shared/ImportedDecorator";
import { Text } from "./Text";
import { getFrontendSceneData } from "../PongGame";
import type { TimerManager } from "@shared/attachedScripts/TimerManager";
import { GameManager } from "@shared/attachedScripts/GameManager";

export class VisualTimer extends CustomScriptComponent {
	private static readonly _timerDurationS = 30;

	@Imported("Text") private _text! : Text;
	@Imported("TimerManager") private _timerManager! : TimerManager;

	private _timeLimitTimeout : number | null = null;
	private _showTimerInterval : number | null = null;
	private	_remainingSeconds : number = 0;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "VisualTimer") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	sceneData = getFrontendSceneData(this.scene);

		sceneData.events.getObservable("game-start").add(() => {
			this._text.transform.setEnabled(false);
			if (VisualTimer._timerDurationS >= GameManager.timeLimitS)
				this.showTimer();
			else
			{
				this._timeLimitTimeout = this._timerManager.setTimeout(() => {
					this.showTimer();
					this._timeLimitTimeout = null;
				}, VisualTimer._timerDurationS * 1000);
			}
		});
		sceneData.events.getObservable("end").add(() => {
			this.clearTimers();
		});
	}

	private	showTimer()
	{
		this._text.transform.setEnabled(true);
		this._remainingSeconds = (VisualTimer._timerDurationS > GameManager.timeLimitS)
			? GameManager.timeLimitS
			: VisualTimer._timerDurationS;
		this.showRemainingSeconds();
		this._showTimerInterval = this._timerManager.setInterval(() => {
			this._remainingSeconds--;
			this.showRemainingSeconds();
		}, 1000);
	}

	private	showRemainingSeconds()
	{
		const	text = `${this._remainingSeconds}`;

		this._text.setText(text);
	}

	private	clearTimers()
	{
		if (this._timeLimitTimeout !== null)
		{
			this._timerManager.clearTimer(this._timeLimitTimeout);
			this._timeLimitTimeout = null;
		}
		if (this._showTimerInterval !== null)
		{
			this._timerManager.clearTimer(this._showTimerInterval);
			this._showTimerInterval = null;
		}
	}
}

SceneManager.RegisterClass("VisualTimer", VisualTimer);
