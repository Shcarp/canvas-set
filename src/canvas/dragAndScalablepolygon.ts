
import { Point } from "./helper";

export interface Dragable {
    dragStart(point: Point): void;
    drag(point: Point): void;
    dragEnd(point: Point): void;
}

export interface Scalable {
    scaleStart(point: Point): void;
    scale(point: Point): void;
    scaleEnd(point: Point): void;
}

export interface DragableAndScalable {
    dragStart(point: Point): void;
    scaleStart(point: Point): void;
    drag(point: Point): void;
    scale(point: Point): void;
    dragEnd(point: Point): void;
    scaleEnd(point: Point): void;
}

export enum PolygonStatus {
    PENDING = "pending",
    DRAGING = "draging",
    SCALING = "scaling",
    ACTIVE = "active",
}

// export abstract class DragableAndScalablePolygon extends Polygon {
//     private _status: PolygonStatus = PolygonStatus.PENDING;
//     private _scalable: boolean = true;
//     private _dragable: boolean = true;
//     protected _prevPoint: Point | null = null;

//     constructor({ scalable = true, dragable = true }) {
//         super("dragableAndScalablePolygon", 1);
//         this._scalable = scalable;
//         this._dragable = dragable;

//         this.on("movedown", (point) => {
//             // 判断是否点击在children 中
//             this.children.forEach((polygon: Polygon) => {
//                 if (
//                     polygon instanceof DragableAndScalablePolygon &&
//                     polygon.type === "dragableAndScalablePolygon" &&
//                     polygon.isPointInPath(point) &&
//                     polygon?.scalable
//                 ) {
//                     polygon.scaleStart(point);
//                     this.activeTarget = polygon;
//                     this._status = PolygonStatus.ACTIVE;
//                     return;
//                 }

//                 if (polygon.isInPath(point)) {
//                     polygon.emit("movedown", point);
//                     this.activeTarget = polygon;
//                     this._status = PolygonStatus.ACTIVE;
//                     return;
//                 }
//             });
//             // 将 activeTarget 移到children zIndex 最前面
//             if (this._status === PolygonStatus.ACTIVE && this.activeTarget) {
//                 const index = this.children.indexOf(this.activeTarget);
//                 if (index !== -1) {
//                     this.children.splice(index, 1);
//                 }
//                 this.insertToZIndex(this.activeTarget);
//                 return;
//             }

//             this.dragStart(point);
//         });

//         this.on("moveup", (point) => {
//             switch (this._status) {
//                 case PolygonStatus.DRAGING:
//                     this.dragEnd(point);
//                     break;
//                 case PolygonStatus.SCALING:
//                     this.scaleEnd(point);
//                     break;
//                 case PolygonStatus.ACTIVE:
//                     if (this.activeTarget) {
//                         this.activeTarget.emit("moveup", point);
//                     }
//                     break;
//                 default:
//                     break;
//             }

//             this.activeTarget = null;
//         });

//         this.on("move", (point) => {
//             switch (this._status) {
//                 case PolygonStatus.DRAGING:
//                     makeRequestAnimationFrame(() => {
//                         this.drag(point);
//                     })();
//                     break;
//                 case PolygonStatus.SCALING:
//                     makeRequestAnimationFrame(() => {
//                         this.scale(point);
//                     })();
//                     break;
//                 case PolygonStatus.ACTIVE:
//                     if (this.activeTarget) {
//                         this.activeTarget.emit("move", point);
//                     }
//                     break;
//                 default:
//                     break;
//             }
//         });
//     }

//     get status() {
//         return this._status;
//     }

//     get scalable() {
//         return this._scalable;
//     }

//     get dragable() {
//         return this._dragable;
//     }

//     dragStart(point: Point) {
//         this._status = PolygonStatus.DRAGING;
//         this._prevPoint = point;
//     }
//     scaleStart(point: Point) {
//         this._status = PolygonStatus.SCALING;
//         this._prevPoint = point;
//     }

//     drag(point: Point) {
//         this.update(point);
//         this.drawer.draw();
//     }

//     scale(point: Point) {
//         this.update(point);
//         this.drawer.draw();
//     }

//     dragEnd(point: Point) {
//         this._status = PolygonStatus.PENDING;
//         this.destroy();
//         this.update(point);
//         this.doDraw();
//         this._prevPoint = null;
//     }

//     scaleEnd(point: Point) {
//         this._status = PolygonStatus.PENDING;
//         this.destroy();
//         this.update(point);
//         this.doDraw();
//         this._prevPoint = null;
//     }

//     private update(point: Point) {
//         this.doUpdate(point);
//     }

//     private insertToZIndex(polygon: Polygon) {
//         let index = this.children.findIndex(
//             (item) => item.zIndex <= polygon.zIndex
//         );
//         if (index === -1) {
//             this.children.push(polygon);
//         } else {
//             this.children.splice(index, 0, polygon);
//         }
//     }

//     abstract isInPath(point: Point): boolean;
//     abstract isPointInPath(point: Point): boolean;
//     abstract doDraw(): void;
//     abstract doUpdate(point: Point): void;
//     abstract destroy(): void;
// }
