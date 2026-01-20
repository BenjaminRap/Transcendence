import zod from "zod";
export class Range {
    constructor(min, max) {
        if (min > max)
            throw new Error(`Invalid range : [${min},${max}] : min cannot be greater than max !`);
        this.min = min;
        this.max = max;
    }
}
export const zodRange = zod.object({
    min: zod.number(),
    max: zod.number()
}).refine(arg => arg.min <= arg.max, {
    message: "The min attribute should be smaller or equal to the max attribute !"
});
