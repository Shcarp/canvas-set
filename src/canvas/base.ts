import { v4 } from "uuid";
import { EventEmitter } from "events";
import { Drawer } from "./drawer";
import { DrawHelper, Point } from "./helper";

export interface BaseOptions {
    zIndex?: number;
    type?: string;
}

export abstract class Polygon<T extends BaseOptions> extends EventEmitter {
    private _id: string = v4();
    private _drawer: Drawer | null = null;

    private _parent: Polygon<any> | null = null;
    private _children: Polygon<any>[] = [];
    
    private _options: T;

    private _attachSatatus: boolean = false;

    private _activeTarget: Polygon<any> | null = null;

    protected _ctx: CanvasRenderingContext2D | null = null;

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
            (a: Polygon<any>, b: Polygon<any>) => a.zIndex - b.zIndex
        );
    }

    get activeTarget() {
        return this._activeTarget;
    }

    set activeTarget(target: Polygon<any> | null) {
        this._activeTarget = target;
    }

    get scalable() {
        return false;
    }

    get dragable() {
        return false;
    }

    init() {
        this.doInit();
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
            this._children[i].draw()
        }
    }

    destroy() {
        this.drawer.draw();
    }

    abstract isInPath(point: Point): boolean;
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

export class Rect<T extends RectBaseOptions> extends Polygon<T> {

    constructor(options: RectBaseOptions) {
        super(Object.assign(options, { type: "rect" }))
    }

    get x() {
        if (this.parent && this.parent instanceof Rect) {
            return this.options.x  + this.parent.leftX ;
        }

        return this.options.x;
    }

    set x(x: number) {
        this.options.x = x;
    }

    get y() {
        if (this.parent && this.parent instanceof Rect) {
            return this.options.y + this.parent.leftY;
        }
        return this.options.y;
    }

    set y(y: number) {
        this.options.y = y;
    }

    /**
     * 如果有parent, 则width和height是相对于parent的, 位置和大小不能超过parent的大小
     */
    get width() {
        if (
            this.parent &&
            this.parent instanceof Rect &&
            this.options.width + this.leftX > this.parent.width + this.parent.leftX
        ) {
            return this.parent.width - this.leftX;
        }
        // ...other

        return this.options.width;
    }

    set width(width: number) {
        this.options.width = width;
    }

    get height() {
        if (
            this.parent &&
            this.parent instanceof Rect &&
            this.options.height + this.leftY > this.parent.height + this.parent.leftY
        ) {
            return this.parent.height - this.leftY;
        }
        // ...other

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

    protected doInit(): void {
        // todo
    }

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

    protected doDraw() {
        DrawHelper.drawRect(this.ctx, {
            x: this.leftX,
            y: this.leftY,
            width: this.width,
            height: this.height,
            type: "fill",
            color: "#f0f0f0",
        });
    }

}
