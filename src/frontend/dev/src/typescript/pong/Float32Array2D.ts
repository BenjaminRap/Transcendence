import type { float, int } from "@babylonjs/core/types";

export class	Float32Array2D {
	private _data : Float32Array;

	public readonly width;
	public readonly height;

	constructor(width : int, height : int)
	{
		this._data = new Float32Array(width * height);
		this.width = width;
		this.height = height;
	}

	public get(x : int, y : int) : float
	{
		const	index = this.coordinates2DToIndex(x, y);

		return this._data[index];
	}

	public set(x : int, y : int, value : float) : void
	{
		const	index = this.coordinates2DToIndex(x, y);

		this._data[index] = value;
	}

	public isInBounds(x : int, y : int) : boolean
	{
		return (x >= 0 && y >= 0 && x < this.width && y < this.height);
	}

	public forEach(callback : (value : number, x : int, y : int, index : int) => void) : void
	{
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const	index = this.coordinates2DToIndex(x, y);

				callback(this._data[index], x, y, index);
			}
		}
	};

	private coordinates2DToIndex(x : int, y : int) : int
	{
		if (!this.isInBounds(x, y))
			throw new Error(`Coordinates out of bounds : [${x},${y}], the Float32Array2D size is [${this.width}, ${this.height}]`)
		const	index = y * this.width + x;

		return index;
	}
}

