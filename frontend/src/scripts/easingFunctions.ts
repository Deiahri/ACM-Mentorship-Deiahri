export type easingType = 'inOutQuart' | 'inOutSine' | 'linear';
export function getEasingFunction(s: easingType) {
    switch(s) {
        case 'inOutQuart':
            return easeInOutQuart;
        case 'inOutSine':
            return easeInOutSine;
        case 'linear':
            return easeLinear;
        default:
            throw new Error('Invalid easing function type '+s);
    }
}

function easeInOutQuart(x: number): number {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

function easeLinear(x: number) {
    return x;
}
