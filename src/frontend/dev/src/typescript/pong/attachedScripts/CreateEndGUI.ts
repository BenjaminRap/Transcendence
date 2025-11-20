import { Scene } from "@babylonjs/core/scene";
import { TransformNode } from "@babylonjs/core/Meshes";
import { SceneManager, ScriptComponent } from "@babylonjs-toolkit/next";
import { GameManager } from "@shared/attachedScripts/GameManager";
import { EndGUI } from "../endGUI";
import { FrontendSceneData } from "../FrontendSceneData";

export class CreateEndGUI extends ScriptComponent {
	private _type : "basic" | "colorful" = "basic";
	private _gameManager! : TransformNode & { script : GameManager };

	private _endGUI! : EndGUI;

    constructor(transform: TransformNode, scene: Scene, properties: any = {}, alias: string = "CreateEndGUI") {
        super(transform, scene, properties, alias);
    }

	protected	awake()
	{
		this._endGUI = new EndGUI(this._type);

		const	sceneData = this.scene.metadata.sceneData;

		sceneData.pongHTMLElement.appendChild(this._endGUI!);

		this._gameManager.script = SceneManager.GetComponent(this._gameManager, "GameManager", false);

		this.toggleMenu();

		const	buttons = this._endGUI!.getButtons()!;

		buttons.restart.addEventListener("click", () => { this.onRestart() });
		buttons.goToMenu.addEventListener("click", () => { this.onGoToMenu(sceneData) });
		buttons.quit.addEventListener("click", () => { this.onQuit(sceneData) });

		sceneData.messageBus.OnMessage("end", () => {
			console.log("trucbodule");
			this.toggleMenu();
		});
	}

	private	toggleMenu() : void
	{
		this._endGUI.classList.toggle("hidden");
	}

	private	onRestart() : void
	{
		this.toggleMenu();
		this._gameManager.script.restart();
	}

	private	onGoToMenu(sceneData : FrontendSceneData) : void
	{
		sceneData.pongHTMLElement.changeScene("Menu.gltf");
	}

	private	onQuit(sceneData : FrontendSceneData) : void
	{
		sceneData.pongHTMLElement.quit();
	}

	protected	destroy()
	{
		if (this._endGUI)
			this._endGUI.remove();
	}
}

SceneManager.RegisterClass("CreateEndGUI", CreateEndGUI);
