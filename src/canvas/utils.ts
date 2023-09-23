
export const makeRequestAnimationFrame = (fn: () => void) => {
    let flag = false;
    return () => {
        if (flag) return;
        flag = true;
        requestAnimationFrame(() => {
            fn();
            flag = false;
        });
    }
}

export const getPointMatrix =  (
    x: number,
    y: number,
    width: number,
    height: number
) =>  {
    return [
        { x: x - width / 2, y: y - height / 2 }, // leftTop
        { x: x + width / 2, y: y - height / 2 }, // rightTop
        { x: x + width / 2, y: y + height / 2 }, // rightBottom
        { x: x - width / 2, y: y + height / 2 }, // leftBottom
    ];
}
