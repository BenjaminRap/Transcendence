export function isPowerOfTwo (value : number) {
	return value !== 0 && (value & (value - 1)) === 0;
};

export function shuffle<T>(array: T[]) {
    let currentIndex = array.length;

    while (currentIndex != 0) {
  
      const randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
};

export type Result<ValueType, ErrorType = string> = {
	success: true,
	value: ValueType
} | {
	success: false,
	error: ErrorType
}

export function success<ValueType, ErrorType = string>(value: ValueType): Result<ValueType, ErrorType> {
    return { success: true, value };
}

export function error<ValueType, ErrorType = string>(error: ErrorType): Result<ValueType, ErrorType> {
    return { success: false, error };
}
