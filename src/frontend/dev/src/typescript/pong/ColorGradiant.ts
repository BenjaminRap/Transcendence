import { zodNumber } from "@shared/ImportedHelpers";
import zod from "zod";

export const	zodColor = zod.object({
	r : zodNumber,
	g : zodNumber,
	b : zodNumber,
	a : zodNumber
});

export const	zodColorGradiant = zod.array(zod.object({
	step : zod.number().min(0).max(1),
	color : zodColor
}));
export type ColorGradiant = zod.infer<typeof zodColorGradiant>;
