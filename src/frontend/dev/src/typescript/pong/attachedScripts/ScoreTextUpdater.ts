import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { Text } from "./Text";
import { getFrontendSceneData } from "../PongGame";

export class ScoreTextUpdater extends ScriptComponent {
	private _eventName! : "updateRightScore" | "updateLeftScore";

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "ScoreTextUpdater") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		const	text = SceneManager.GetComponent<Text>(this.transform, "Text", false);

		const	sceneData = getFrontendSceneData(this.scene);
		sceneData.events.getObservable(this._eventName).add((newScore : number) => {
			text.setText(newScore.toString());
		});
		sceneData.events.getObservable("game-start").add(() => {
			text.setText("0");
		});
	}
}

SceneManager.RegisterClass("ScoreTextUpdater", ScoreTextUpdater);
