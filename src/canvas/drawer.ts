import { Polygon } from "./base";
import { DrawHelper } from "./helper";

interface DrawerOptions {
    grid?: {
        gutter: number;
        color?: string;
        lines?: {
            color: string;
            step: number;
        }[];
    };
    height?: number;
    width?: number;
}

export class Drawer {
    private _canvas: HTMLCanvasElement;
    private _polygons: Polygon<any>[] = [];
    private _ctx: CanvasRenderingContext2D;
    private _target: Polygon<any> | null = null;

    private _options: DrawerOptions;

    constructor(element: HTMLCanvasElement, options?: DrawerOptions) {
        console.log("drawer constructor");
        this._canvas = element;

        this._options = options || {
            grid: {
                gutter: 20,
                color: "#f0f0f0",
                lines: [
                    {
                        color: "#d6e4ff",
                        step: 10,
                    },
                ],
            },
        };

        this._canvas.addEventListener("mousedown", this.onMoveDown.bind(this));
        this._canvas.addEventListener("mouseup", this.onMoveUp.bind(this));
        this._canvas.addEventListener("mousemove", this.onMove.bind(this));
        this._canvas.addEventListener('mouseleave', this.onMoveUp.bind(this));

        const context = this._canvas.getContext
            ? this._canvas.getContext("2d")
            : null;
        if (context) {
            this._ctx = context;
        } else {
            throw new Error("canvas context:2d is not available!");
        }
    }

    get ctx() {
        return this._ctx;
    }

    get options() {
        return this._options;
    }

    set target(target: Polygon<any> | null) {
        this._target = target;
    }

    get height() {
        return this._canvas.height;
    }

    get width() {
        return this._canvas.width;
    }

    resize() {
        const { width, height } = this._canvas.getBoundingClientRect();
        const { devicePixelRatio } = window;

        this._canvas.width = width * devicePixelRatio;
        this._canvas.height = height * devicePixelRatio;

        this._ctx.scale(devicePixelRatio, devicePixelRatio);
    }

    addPolygon(polygon: Polygon<any>) {
        polygon.attach(this);
        polygon.init();
        // 插入时按照 zIndex 从大到小排序
        this.insertToZIndex(polygon);
    }

    removePolygon(polygon: Polygon<any>) {
        const index = this._polygons.indexOf(polygon);
        if (index !== -1) {
            this._polygons.splice(index, 1);
            this._polygons[index].destroy();
            this._polygons[index].detach();
        }
    }

    draw() {
        DrawHelper.clearRect(
            this._ctx,
            0,
            0,
            this._canvas.width,
            this._canvas.height
        );

        this.drawGrids(true);
        this.drawGrids(false);

        // 从后往前
        for (let i = this._polygons.length - 1; i >= 0; i--) {
            this._polygons[i].draw();
        }
    }

    destroy() {
        this._polygons.forEach((polygon) => {
            polygon.destroy();
            polygon.detach();
        });
        this._polygons = [];
    }
    /**
     * 当插入元素时，会将元素插入到相同 zIndex 的元素之前，如果没有相同 zIndex 的元素，则数组按照 zIndex 从大到小排序
     */
    private insertToZIndex(polygon: Polygon<any>) {
        let index = this._polygons.findIndex(
            (item) => item.zIndex <= polygon.zIndex
        );
        if (index === -1) {
            this._polygons.push(polygon);
        } else {
            this._polygons.splice(index, 0, polygon);
        }
    }

    private drawGrids(isColumn: boolean) {
        const { width, height } = this._canvas.getBoundingClientRect();
        const { gutter, color, lines } = this._options?.grid ?? {
            gutter: 20,
            color: "#f0f0f0",
            lines: [
                {
                    color: "#d6e4ff",
                    step: 10,
                },
            ],
        };

        // 拿出lines中step 在达到 step，画出一条线

        const limit = isColumn ? height : width;

        let i = 0;
        while (i * gutter + gutter < limit) {
            i++;
            // 清空子路径列表开始一个新路径
            this.ctx.beginPath();
            const index = lines?.findIndex((line) => i % line.step === 0);
            const colorm =
                (index || index === 0) && index !== -1
                    ? lines![index].color
                    : color
                    ? color
                    : "#f0f0f0";
            this.ctx.strokeStyle = colorm;

            if (isColumn) {
                this.ctx.moveTo(0, i * gutter);
                this.ctx.lineTo(width, i * gutter);
            } else {
                this.ctx.moveTo(i * gutter, 0);
                this.ctx.lineTo(i * gutter, height);
            }
            this.ctx.stroke();
        }
    }

    private onMoveDown(event: MouseEvent) {
        if (this._polygons.length === 0) return;
        const point = DrawHelper.getMousePosition(this._canvas, event);
        for (let polygon of this._polygons) {
            if (
                polygon.scalable &&
                polygon.isPointInPath(point)
            ) {
                polygon.scaleStart(point);
                this._target = polygon;
                break;
            }

            if (polygon.isInPath(point)) {
                polygon.emit("movedown", point);

                this._target = polygon;
                break;
            }
        }

        if (!this._target) return;
        // 从数组中删除，然后插入到最后，保证当前选中的元素在最上层
        const index = this._polygons.indexOf(this._target);
        if (index !== -1) {
            this._polygons.splice(index, 1);
        }

        this.insertToZIndex(this._target);
    }

    private onMove(event: MouseEvent) {
        const point = DrawHelper.getMousePosition(this._canvas, event);
        if (!this._target) return;
        this._target.emit("move", point);
    }

    private onMoveUp(event: MouseEvent) {
        const point = DrawHelper.getMousePosition(this._canvas, event);
        if (!this._target) return;
        this._target.emit("moveup", point);
        this._target = null;

        console.log(this._polygons)
    }
}
