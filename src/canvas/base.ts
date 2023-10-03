import { v4 } from "uuid";
import { EventEmitter } from "events";
import { Drawer } from "./drawer";
import { DrawHelper, Point } from "./helper";
import { PolygonStatus } from "./dragAndScalablepolygon";
import { makeRequestAnimationFrame } from "./utils";

export interface BaseOptions {
    zIndex?: number;
    type?: string;
    scalable?: boolean;
    dragable?: boolean;
}

export abstract class Polygon<T extends BaseOptions> extends EventEmitter {
    private _id: string = v4();
    private _drawer: Drawer | null = null;

    private _parent: Polygon<any> | null = null;
    private _children: Polygon<any>[] = [];

    private _options: T;

    private _status: PolygonStatus = PolygonStatus.PENDING;

    private _attachSatatus: boolean = false;

    private _activeTarget: Polygon<any> | null = null;

    protected _ctx: CanvasRenderingContext2D | null = null;
    private _prevPoint: Point | null = null;

    constructor(options: BaseOptions) {
        super();
        this._options = options as T;
        this._attachSatatus = false;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._options.type;
    }

    get drawer() {
        if (!this._drawer) {
            throw new Error("drawer is not available!");
        }
        return this._drawer;
    }

    get ctx() {
        if (!this._drawer) {
            throw new Error("ctx is not available!");
        }
        return this._drawer.ctx;
    }

    get options() {
        return this._options;
    }

    protected set options(options: T) {
        this._options = options;
    }

    get zIndex() {
        return this._options.zIndex ?? 0;
    }

    get attachStatus() {
        return this._attachSatatus;
    }

    set attachStatus(status: boolean) {
        this._attachSatatus = status;
    }

    get parent() {
        return this._parent;
    }

    get children() {
        return this._children;
    }

    set children(polygon: Polygon<any>[]) {
        this._children = polygon.sort(
            (a: Polygon<any>, b: Polygon<any>) => b.zIndex - a.zIndex
        );
    }

    get activeTarget() {
        return this._activeTarget;
    }

    set activeTarget(target: Polygon<any> | null) {
        this._activeTarget = target;
    }

    get scalable() {
        return this.options.scalable ?? false;
    }

    get dragable() {
        return this.options.dragable ?? false;
    }

    get status() {
        return this._status;
    }

    get prevPoint(): Point {
        if (!this._prevPoint) {
            return {x: 0, y: 0}
        }
        return this._prevPoint;
    }

    set prevPoint(point: Point | null) {
        this._prevPoint = point;
    }

    init() {
        this.doInit();
        this.on("movedown", this.onMoveDown.bind(this));
        this.on("moveup", this.onMoveUp.bind(this));
        this.on("move", this.onMove.bind(this));
    }

    attach(drawer: Drawer) {
        this._drawer = drawer;
        this.attachStatus = true;
    }

    detach() {
        this._drawer = null;
        this.attachStatus = false;
    }

    addChild<U extends BaseOptions>(polygon: Polygon<U>) {
        polygon.mountParent(this);
        polygon.init();
        this.children = [...this.children, polygon];
    }

    removeChild<U extends BaseOptions>(polygon: Polygon<U>) {
        const index = this._children.indexOf(polygon);
        if (index !== -1) {
            const willRemove = this._children[index];
            willRemove.unmountParent();
            this._children.splice(index, 1);
            return willRemove;
        }
        return null;
    }

    mountParent<U extends BaseOptions>(polygon: Polygon<U>) {
        this._parent = polygon;
        this.attach(polygon.drawer);
    }

    unmountParent() {
        this._parent = null;
    }

    draw() {
        this.doDraw();
        for (let i = this._children.length - 1; i >= 0; i--) {

            this._children[i].draw();
        }
    }

    destroy() {
        this.drawer.draw();
    }

    dragStart(point: Point): void {
        this._status = PolygonStatus.DRAGING;
        this._prevPoint = point;
    }
    scaleStart(point: Point): void {
        this._status = PolygonStatus.SCALING;
        this._prevPoint = point;
    }
    drag(point: Point): void {
        this.update(point);
        this.drawer.draw();
    }
    scale(point: Point): void {
        this.update(point);
        this.drawer.draw();
    }
    dragEnd(point: Point): void {
        this._status = PolygonStatus.PENDING;
        this.update(point);
        this.doDraw();
        this._prevPoint = null;
    }
    scaleEnd(point: Point): void {
        this._status = PolygonStatus.PENDING;
        this.update(point);
        this.doDraw();
        this._prevPoint = null;
    }

    private onMoveDown(point: Point) {
        // 判断是否点击在children 中

        for (let polygon of this.children) {
            console.log(polygon)
            if (polygon.scalable && polygon.isPointInPath(point)) {
                polygon.scaleStart(point);
                this.activeTarget = polygon;
                break;
            }

            if (polygon.dragable && polygon.isInPath(point)) {
                polygon.emit("movedown", point);
                this.activeTarget = polygon;
                this._status = PolygonStatus.ACTIVE;
                break;
            }
        }

        // 将 activeTarget 移到children zIndex 最前面
        if (this._status === PolygonStatus.ACTIVE && this.activeTarget) {
            const index = this.children.indexOf(this.activeTarget);
            if (index !== -1) {
                this.children.splice(index, 1);
            }
            this.insertToZIndex(this.activeTarget);
            return;
        }

        this.dragable && this.dragStart(point);
    }

    private onMoveUp(point: Point) {
        switch (this._status) {
            case PolygonStatus.DRAGING:
                this.dragEnd(point);
                break;
            case PolygonStatus.SCALING:
                this.scaleEnd(point);
                break;
            case PolygonStatus.ACTIVE:
                if (this.activeTarget) {
                    this.activeTarget.emit("moveup", point);
                }
                break;
            default:
                break;
        }

        this.activeTarget = null;
    }

    private onMove(point: Point) {
        // if (!this.activeTarget) return;
        switch (this._status) {
            case PolygonStatus.DRAGING:
                makeRequestAnimationFrame(() => {
                    this.drag(point);
                })();
                break;
            case PolygonStatus.SCALING:
                makeRequestAnimationFrame(() => {
                    this.scale(point);
                })();
                break;
            case PolygonStatus.ACTIVE:
                if (this.activeTarget) {
                    this.activeTarget.emit("move", point);
                }
                break;
            default:
                break;
        }
    }

    private insertToZIndex<T extends BaseOptions>(polygon: Polygon<T>) {
        let index = this.children.findIndex(
            (item) => item.zIndex <= polygon.zIndex
        );
        if (index === -1) {
            this.children.unshift(polygon);
        } else {
            this.children.splice(index, 0, polygon);
        }
    }

    abstract isPointInPath(point: Point): boolean;
    abstract isInPath(point: Point): boolean;
    protected abstract update(point: Point): void;
    protected abstract doDraw(): void;
    protected abstract doInit(): void;
}

export interface RectBaseOptions extends BaseOptions {
    x: number;
    y: number;
    width: number;
    height: number;
    type?: "stroke" | "fill";
    color?: string;
}

export abstract class Rect<T extends RectBaseOptions> extends Polygon<T> {
    constructor(options: RectBaseOptions) {
        super(Object.assign(options, { type: "rect" }));
    }

    get x() {
        if (this.parent && this.parent instanceof Rect) {
            return this.options.x + this.parent.leftX;
        }

        return this.options.x;
    }

    set x(x: number) {
        if (this.parent && this.parent instanceof Rect) {
            this.options.x = x - this.parent.leftX;
            return
        }
        this.options.x = x;
    }

    get y() {
        if (this.parent && this.parent instanceof Rect) {
            return this.options.y + this.parent.leftY;
        }
        return this.options.y;
    }

    set y(y: number) {
        if (this.parent && this.parent instanceof Rect) {
            this.options.y = y - this.parent.leftY;
            return
        }
        this.options.y = y;
    }

    /**
     * 如果有parent, 则width和height是相对于parent的, 位置和大小不能超过parent的大小
     */
    get width() {
        return this.options.width;
    }

    set width(width: number) {
        this.options.width = width;
    }

    get height() {
        return this.options.height;
    }

    set height(height: number) {
        this.options.height = height;
    }

    get leftX(): number {
        return this.x - this.options.width / 2;
    }

    get leftY(): number {
        return this.y - this.options.height / 2;
    }

    isInPath(point: Point): boolean {
        return this.doCheckInPath(point);
    }

    abstract isPointInPath(point: Point): boolean;

    protected doCheckInPath(
        point: Point,
        position = {
            startX: this.leftX,
            startY: this.leftY,
            endX: this.leftX + this.width,
            endY: this.leftY + this.height,
        }
    ) {
        const { startX, startY, endX, endY } = position;
        return (
            point.x >= startX &&
            point.x <= endX &&
            point.y >= startY &&
            point.y <= endY
        );
    }

    protected abstract doDraw(): void;
    protected abstract doInit(): void;
    protected abstract update(point: Point): void;
}
