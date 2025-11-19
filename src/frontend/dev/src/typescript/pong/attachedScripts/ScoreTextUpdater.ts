import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Text } from "./Text";

export class ScoreTextUpdater extends ScriptComponent {
	private _eventName! : string ;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ScoreTextUpdater") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	text = SceneManager.GetComponent<Text>(this.transform, "Text", false);

		this.scene.metadata.sceneData.messageBus.OnMessage(this._eventName, (newScore : number) => {
			text.setText(newScore.toString());
		});
		this.scene.metadata.sceneData.messageBus.OnMessage("reset", () => {
			text.setText("0");
		});
	}
}

SceneManager.RegisterClass("ScoreTextUpdater", ScoreTextUpdater);
