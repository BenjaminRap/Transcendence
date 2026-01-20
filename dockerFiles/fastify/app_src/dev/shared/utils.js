export function isPowerOfTwo(value) {
    return value !== 0 && (value & (value - 1)) === 0;
}
;
export function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
}
;
export function success(value) {
    return { success: true, value };
}
export function error(error) {
    return { success: false, error };
}
