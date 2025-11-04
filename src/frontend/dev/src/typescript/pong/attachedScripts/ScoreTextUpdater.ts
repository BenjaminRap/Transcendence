import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { Text } from "./Text";

export class ScoreTextUpdater extends ScriptComponent {
	private _eventName! : string ;
	private _gameManager! : TransformNode;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ScoreTextUpdater") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	gameManager = SceneManager.GetComponent<GameManager>(this._gameManager, "GameManager", false);
		const	text = SceneManager.GetComponent<Text>(this.transform, "Text", false);

		gameManager.messageBus.OnMessage(this._eventName, (newScore : number) => {
			text.setText(newScore.toString());
		});
	}
}

SceneManager.RegisterClass("ScoreTextUpdater", ScoreTextUpdater);
