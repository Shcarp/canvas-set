// import { Geometry } from "./base";

import { RectPoint } from "./dragAndZoom";

export type Point = {
    x: number;
    y: number;
};

type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
    type: "stroke" | "fill";
    color: string;
}

interface DrawImageParams {
    image: CanvasImageSource;
    dx: number;
    dy: number;
    sy: number;
    sx: number;
    sWidth: number;
    sHeight: number;
    dWidth: number;
    dHeight: number;
}
 
export class DrawHelper {
    static drawPoints(ctx: CanvasRenderingContext2D, points: RectPoint) {
        const firstPoints = points[0];
        ctx.strokeStyle = 'black'
        ctx.beginPath();
        
        ctx.moveTo(firstPoints.x, firstPoints.y);

        points.forEach((point) => {
            ctx.lineTo(point.x, point.y);
        });

        ctx.lineTo(firstPoints.x, firstPoints.y);
        ctx.stroke();
    }

    static getMousePosition(canvas: HTMLCanvasElement, event: MouseEvent): Point {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left * (canvas.width / rect.width);
        const y = event.clientY - rect.top * (canvas.height / rect.height);
        return { x, y };
    }

    static clearRect(ctx: CanvasRenderingContext2D, x: number, y: number,  width: number, height: number) {
        ctx.clearRect(x, y, width, height);
    }

    static checkGeometry(geometry: Record<string, any>) {
        const keys = Object.keys(geometry);
        for (let key of keys) {
            const value = geometry[key];
            if (typeof value === 'number' && geometry[key] < 0) {
                throw new Error(`geometry: value of ${key} is no less than 0!`);
            }
        }

        return geometry;
    }

    static drawRect(ctx: CanvasRenderingContext2D, geometry: Rect) {
        const { x, y, width, height, type, color } = geometry;
        ctx.fillStyle = color;
        const draw = type === "stroke" ? ctx.strokeRect : ctx.fillRect;
        draw.call(ctx, x, y, width, height);
    }

    static createImageData(ctx: CanvasRenderingContext2D, width: number, height: number) {
        return ctx.createImageData(width, height);
    }

    static drawImage(ctx: CanvasRenderingContext2D, params: DrawImageParams) {
        const { image, dx, dy, sx, sy, sWidth, sHeight, dWidth, dHeight } = params;
        ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
}
