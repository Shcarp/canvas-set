import { BaseOptions, Polygon, Rect, RectBaseOptions } from "./base";
import { Dragable, PolygonStatus, Scalable } from "./dragAndScalablepolygon";
import { DrawHelper, Point } from "./helper";
import { getPointMatrix, makeRequestAnimationFrame } from "./utils";

export type ScaleTabPositonType =
    | "leftTop"
    | "rightTop"
    | "leftBottom"
    | "rightBottom"
    | "top"
    | "bottom"
    | "left"
    | "right";

export type ScaleTabPositon = {
    type: ScaleTabPositonType;
    height?: number;
    width?: number;
};

export type RectPoint = [Point, Point, Point, Point];

const DEFAULT_SCALE_TAB_WIDTH = 19;

export interface DragAndZoomRectOptions extends RectBaseOptions {
    minWidth?: number;
    minHeight?: number;
    tags?: ScaleTabPositonType | ScaleTabPositon[] | ScaleTabPositonType[];
}

const cornerPosition = ["leftTop", "rightTop", "leftBottom", "rightBottom"];

const normalPosition = ["top", "bottom", "left", "right"];

export class DragAndZoomRect<T extends DragAndZoomRectOptions> extends Rect<T> {
    private _currentPoint: number | null = null;
    private _points: RectPoint | null = null;

    private tags:
        | ScaleTabPositonType
        | ScaleTabPositon[]
        | ScaleTabPositonType[] = [];

    private _scaleTabPoints: RectPoint[] = [];

    constructor(options: DragAndZoomRectOptions) {
        super(options);
        this.tags = options.tags ?? [];
    }

    get scalable() {
        return this.options.scalable ?? true;
    }

    get dragable() {
        return this.options.dragable ?? true;
    }

    get minWidth() {
        return this.options.minWidth ?? 10;
    }

    get minHeight() {
        return this.options.minHeight ?? 10;
    }

    get currentPoint() {
        return this._scaleTabPoints[this._currentPoint as number];
    }

    get points() {
        if (!this._points) {
            throw new Error("should init first!");
        }
        return this._points;
    }

    isPointInPath(point: Point): boolean {
        for (let i = 0; i < this._scaleTabPoints.length; i++) {
            if (
                this.doCheckInPath(point, {
                    startX: this._scaleTabPoints[i][0].x,
                    startY: this._scaleTabPoints[i][0].y,
                    endX: this._scaleTabPoints[i][2].x,
                    endY: this._scaleTabPoints[i][2].y,
                })
            ) {
                this._currentPoint = i;
                return true;
            }
        }

        this._currentPoint = null;
        return false;
    }

    protected doInit(): void {
        this._points = this.getPoints() as RectPoint;
        this._scaleTabPoints = this.getCornerPoints();
    }

    protected doDraw(): void {
        // 画自身
        DrawHelper.drawPoints(this.ctx, this.points);
    }

    protected drawScale() {
        // 画缩放点
        this.scalable &&
            this._scaleTabPoints.forEach((points) => {
                DrawHelper.drawPoints(this.ctx, points);
            });
    }

    protected update(point: Point): void {
        switch (this.status) {
            case PolygonStatus.DRAGING:
                this.doUpdateDrag(point);
                break;
            case PolygonStatus.SCALING:
                this.doUpdateScale(point);
                break;
            case PolygonStatus.PENDING:
                break;
        }
    }

    private doUpdateDrag(point: Point) {
        const x = this.x + (point.x - this.prevPoint.x);
        const y = this.y + (point.y - this.prevPoint.y);
        this.x = x;
        this.y = y;

        this._points = this.getPoints();
        // 判断是否超出边界

        if (this.parent && this.parent instanceof Rect) {
            const { width, height } = this.parent;
            const { x: leftX, y: leftY } = this.points[0];
            if (leftX < this.parent.leftX) {
                this.x = this.parent.leftX + this.width / 2;
            }

            if (leftY < this.parent.leftY) {
                this.y = this.parent.leftY + this.height / 2;
            }

            const { x: rightX, y: rightY } = this.points[2];

            if (rightX > this.parent.leftX + width) {
                this.x = width + this.parent.leftX - this.width / 2;
            }

            if (rightY > this.parent.leftY + height) {
                this.y = height + this.parent.leftY - this.height / 2;
            }
        } else {
            const { width, height } = this.drawer;
            const { x: leftX, y: leftY } = this.points[0];
            if (leftX < 0) {
                this.x = this.width / 2;
            }

            if (leftY < 0) {
                this.y = this.height / 2;
            }

            const { x: rightX, y: rightY } = this.points[2];

            if (rightX > width) {
                this.x = width;
            }

            if (rightY > height) {
                this.y = height;
            }
        }

        this._scaleTabPoints = this.getCornerPoints();

        this.prevPoint = point;
    }

    private doUpdateScale(point: Point) {
        const xDistance = point.x - this.prevPoint.x;
        const yDistance = point.y - this.prevPoint.y;
        const newGeometry = { ...this.options };

        const cacle = {
            lefttop: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.width = this.width - xDistance;
                newGeometry.height = this.height - yDistance;
            },
            righttop: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.width = this.width + xDistance;
                newGeometry.height = this.height - yDistance;
            },
            rightbottom: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.width = this.width + xDistance;
                newGeometry.height = this.height + yDistance;
            },
            leftbottom: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.width = this.width - xDistance;
                newGeometry.height = this.height + yDistance;
            },
            top: () => {
                // 保持buttom边 不变
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.height = this.height - yDistance;
            },
            bottom: () => {
                newGeometry.y = this.y + yDistance / 2;
                newGeometry.height = this.height + yDistance;
            },
            left: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.width = this.width - xDistance;
            },
            right: () => {
                newGeometry.x = this.x + xDistance / 2;
                newGeometry.width = this.width + xDistance;
            },
        };

        // 求出当前点中点的坐标
        const currentPoint = this.currentPoint as RectPoint;

        const centerX = (currentPoint[0].x + currentPoint[2].x) / 2;
        const centerY = (currentPoint[0].y + currentPoint[2].y) / 2;

        const RectXT = this.leftX;
        const RectYT = this.leftY;

        const RectXB = this.leftX + this.width;
        const RectYB = this.leftY + this.height;

        let res = "";

        if (centerX === RectXT) {
            res += "left";
        } else if (centerX === RectXB) {
            res += "right";
        }

        if (centerY === RectYT) {
            res += "top";
        } else if (centerY === RectYB) {
            res += "bottom";
        }

        cacle[res as keyof typeof cacle]();

        if (
            newGeometry.width < this.minWidth ||
            newGeometry.height < this.minHeight
        ) {
            console.log("width or height is too small");
            return;
        }

        this.options = newGeometry;
        this._points = this.getPoints();
        this._scaleTabPoints = this.getCornerPoints();
        this.prevPoint = point;
    }

    private getPoints(): RectPoint {
        return getPointMatrix(
            this.x,
            this.y,
            this.width,
            this.height
        ) as RectPoint;
    }

    private getCornerPoints() {
        if (typeof this.tags !== "string" && !Array.isArray(this.tags)) {
            return []; // 处理无效的情况
        }

        if (typeof this.tags === "string") {
            const isCornerTag = cornerPosition.includes(this.tags);
            const isNormalTag = normalPosition.includes(this.tags);

            if (isCornerTag) {
                return [this.calcCornerPoints(this.tags)];
            }

            if (isNormalTag) {
                return [this.calcNormalPoints(this.tags)];
            }
        }

        if (!Array.isArray(this.tags)) return [];

        return this.tags.reduce(
            (pre, cur: ScaleTabPositon | ScaleTabPositonType) => {
                if (typeof cur === "string") {
                    const isCornerTag = cornerPosition.includes(cur);
                    const isNormalTag = normalPosition.includes(cur);

                    if (isCornerTag) {
                        pre.push(this.calcCornerPoints(cur));
                    }

                    if (isNormalTag) {
                        pre.push(this.calcNormalPoints(cur));
                    }
                    return pre;
                }

                const {
                    width = DEFAULT_SCALE_TAB_WIDTH,
                    height = DEFAULT_SCALE_TAB_WIDTH,
                } = cur;

                const isCornerTag = cornerPosition.includes(cur.type);
                const isNormalTag = normalPosition.includes(cur.type);

                if (isCornerTag) {
                    pre.push(this.calcCornerPoints(cur.type, width, height));
                }

                if (isNormalTag) {
                    pre.push(this.calcNormalPoints(cur.type, width, height));
                }
                return pre;
            },
            [] as RectPoint[]
        );
    }

    private calcNormalPoints(
        tag: string,
        width = DEFAULT_SCALE_TAB_WIDTH,
        height = DEFAULT_SCALE_TAB_WIDTH
    ) {
        switch (tag) {
            case "top":
                return this.getPointFromNormal(
                    this.width / 2,
                    0,
                    width,
                    height
                );
            case "bottom":
                return this.getPointFromNormal(
                    this.width / 2,
                    this.height,
                    width,
                    height
                );
            case "left":
                return this.getPointFromNormal(
                    0,
                    this.height / 2,
                    width,
                    height
                );
            case "right":
                return this.getPointFromNormal(
                    this.width,
                    this.height / 2,
                    width,
                    height
                );
        }
        throw new Error("tag is not valid!");
    }

    private calcCornerPoints(
        tag: string,
        width = DEFAULT_SCALE_TAB_WIDTH,
        height = DEFAULT_SCALE_TAB_WIDTH
    ): RectPoint {
        if (!cornerPosition.includes(tag)) {
            throw new Error("tag is not valid!");
        }
        const point = this.points[cornerPosition.indexOf(tag)];
        const { x, y } = point;
        return getPointMatrix(x, y, width, height) as RectPoint;
    }

    private getPointFromNormal(
        x: number,
        y: number,
        width: number,
        height: number
    ): RectPoint {
        // x, y 是以当前图形的坐上角为原点的坐标
        // 中心点
        const centerX = this.leftX + x;
        const centerY = this.leftY + y;
        // 上下左右
        return getPointMatrix(centerX, centerY, width, height) as RectPoint;
    }
}

// export
