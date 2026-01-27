import zod from "zod";

export type InferArray<T extends readonly zod.ZodType[]> = {
	[K in keyof T]: zod.infer<T[K]>
};

export type InferZodAck<F> =
  F extends zod.ZodFunction<infer Args, infer Ret>
    ? (...args: zod.infer<Args>) => zod.infer<Ret>
    : never;

export type SetInArray<Value> = Value extends any[] ? Value : Value extends undefined ? [] : [Value];

export function	resultOf<T extends zod.ZodType>(valueType: T)
{
	return zod.discriminatedUnion("success", [
		zod.object({
			success: zod.literal(true),
			value: valueType
		}),
		zod.object({
			success: zod.literal(false),
			error: zod.string()
		})
	]);
}
