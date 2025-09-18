export class	Range {
	public min : number;
	public max : number;

	constructor(min : number, max : number)
	{
		if (min > max)
			throw new Error(`Invalid range : [${min},${max}] : min cannot be greater than max !`);
		this.min = min;
		this.max = max;
	}
}

