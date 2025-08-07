import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core"

class PongGame extends HTMLElement
{
	private _canvas : HTMLCanvasElement;
	private _engine! : Engine;
	private _scene! : Scene;

    constructor()
	{
		super();
		this._canvas = document.createElement("canvas");
		this._canvas.classList.add("size-full");
		this.appendChild(this._canvas);
	}

	connectedCallback() : void
	{
        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this._scene);
        camera.attachControl(this._canvas, true);
        new HemisphericLight("light1", new Vector3(1, 1, 0), this._scene);
        MeshBuilder.CreateSphere("sphere", { diameter: 1 }, this._scene);

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
    }

	disconnectedCallback() : void
	{
		this._engine.dispose();
		this._scene.dispose();
	}
}
customElements.define("pong-game", PongGame);
