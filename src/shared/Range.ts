import zod from "zod";

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

export const	zodRange = zod.object({
	min: zod.number(),
	max: zod.number()
}).refine(arg => arg.min <= arg.max, {
	message: "The min attribute should be smaller or equal to the max attribute !"
});
