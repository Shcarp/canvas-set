// import {
//     DragableAndScalablePolygon,
//     PolygonStatus,
// } from "./dragAndScalablepolygon";
// import { DrawHelper, Point } from "./helper";

// // 需要渲染缩放的点一个 数组 [] 有 “top” “bottom” “left” “right” "left-top" "right-top" "left-bottom" "right-bottom" 8个点

// export type ScaleTabPositonType =
//     | "leftTop"
//     | "rightTop"
//     | "leftBottom"
//     | "rightBottom"
//     | "top"
//     | "bottom"
//     | "left"
//     | "right";

// export type ScaleTabPositon = {
//     type: ScaleTabPositonType;
//     height?: number;
//     width?: number;
// };

// export interface Geometry {
//     x: number;
//     y: number;
//     width: number;
//     height: number;
//     minWidth?: number;
//     minHeight?: number;
//     scalable?: boolean;
//     dragable?: boolean;
//     tags?: ScaleTabPositonType | ScaleTabPositon[] | ScaleTabPositonType[];
// }

// export type RectPoint = [Point, Point, Point, Point];

// const DEFAULT_SCALE_TAB_WIDTH = 19;

// const cornerPosition = ["leftTop", "rightTop", "leftBottom", "rightBottom"];

// const normalPosition = ["top", "bottom", "left", "right"];

// export class DragAndScalableRect extends DragableAndScalablePolygon {
//     private _options: Geometry;
//     private _currentPoint: number | null = null;
//     private _points: RectPoint;

//     private _scaleTabPoints: RectPoint[];

//     constructor(geometry: Geometry) {
//         super(geometry);
//         this._options = DrawHelper.checkGeometry(geometry) as Geometry;

//         this._points = this.getPoints();

//         this._scaleTabPoints = this.getCornerPoints();
//     }

//     private get tags() {
//         return this._options.tags;
//     }

//     get x() {
//         // 如果parent 是圆形，那么base x, base y 是以 圆心为原点的坐标, 半径为 c^2 = x^2 + y^2 的 c 的值 
//         // 如果parent 是矩形，那么base x, base y 是以 矩形左上角为原点的坐标
//         if (this.parent) {

//         }

//         return this._options.x;
//     }

//     get y() {
//         return this._options.y;
//     }

//     set x(x: number) {
//         this._options.x = x;
//     }

//     set y(y: number) {
//         this._options.y = y;
//     }

//     get options() {
//         return this._options;
//     }

//     get minWidth() {
//         return this._options?.minWidth ?? 0;
//     }

//     get minHeight() {
//         return this._options?.minHeight ?? 0;
//     }

//     get width() {
//         return this._options.width;
//     }

//     get height() {
//         return this._options.height;
//     }

//     get leftX() {
//         return this._points[0].x;
//     }

//     get leftY() {
//         return this._points[0].y;
//     }

//     get currentPoint() {
//         return this._scaleTabPoints[this._currentPoint as number];
//     }

//     // 判断点或者另外一个
//     isInPath(point: Point): boolean {
//         return this.doCheckInPath(point);
//     }

//     isPointInPath(point: Point): boolean {
//         for (let i = 0; i < this._scaleTabPoints.length; i++) {
//             if (
//                 this.doCheckInPath(point, {
//                     startX: this._scaleTabPoints[i][0].x,
//                     startY: this._scaleTabPoints[i][0].y,
//                     endX: this._scaleTabPoints[i][2].x,
//                     endY: this._scaleTabPoints[i][2].y,
//                 })
//             ) {
//                 this._currentPoint = i;
//                 return true;
//             }
//         }

//         this._currentPoint = null;
//         return false;
//     }

//     doDraw(): void {
//         // 画自身
//         DrawHelper.drawPoints(this.ctx, this._points);
//         // 画缩放点
//         this._scaleTabPoints.forEach((points) => {
//             DrawHelper.drawPoints(this.ctx, points);
//         });
//     }

//     destroy() {
//         this.drawer.draw();
//     }

//     doUpdate(point: Point): void {
//         switch (this.status) {
//             case PolygonStatus.DRAGING:
//                 this.doUpdateDrag(point);
//                 break;
//             case PolygonStatus.SCALING:
//                 this.doUpdateScale(point);
//                 break;
//         }
//     }

//     private doCheckInPath(
//         point: Point,
//         position = {
//             startX: this.leftX,
//             startY: this.leftY,
//             endX: this.leftX + this.width,
//             endY: this.leftY + this.height,
//         }
//     ) {
//         const { startX, startY, endX, endY } = position;
//         return (
//             point.x >= startX &&
//             point.x <= endX &&
//             point.y >= startY &&
//             point.y <= endY
//         );
//     }

//     private doUpdateDrag(point: Point) {
//         const prevPoint = this._prevPoint as Point;
//         const x = this.x + (point.x - prevPoint.x);
//         const y = this.y + (point.y - prevPoint.y);
//         this.x = x;
//         this.y = y;
//         this._points = this.getPoints();
//         this._scaleTabPoints = this.getCornerPoints();
//         this._prevPoint = point;
//     }

//     private doUpdateScale(point: Point) {
//         const prevPoint = this._prevPoint as Point;
//         const xDistance = point.x - prevPoint.x;
//         const yDistance = point.y - prevPoint.y;
//         const newGeometry = { ...this._options };

//         const cacle = {
//             lefttop: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.width = this.width - xDistance;
//                 newGeometry.height = this.height - yDistance;
//             },
//             righttop: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.width = this.width + xDistance;
//                 newGeometry.height = this.height - yDistance;
//             },
//             rightbottom: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.width = this.width + xDistance;
//                 newGeometry.height = this.height + yDistance;
//             },
//             leftbottom: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.width = this.width - xDistance;
//                 newGeometry.height = this.height + yDistance;
//             },
//             top: () => {
//                 // 保持buttom边 不变
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.height = this.height - yDistance;
//             },
//             bottom: () => {
//                 newGeometry.y = this.y + yDistance / 2;
//                 newGeometry.height = this.height + yDistance;
//             },
//             left: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.width = this.width - xDistance;
//             },
//             right: () => {
//                 newGeometry.x = this.x + xDistance / 2;
//                 newGeometry.width = this.width + xDistance;
//             },
//         };

//         // 求出当前点中点的坐标
//         const currentPoint = this.currentPoint as RectPoint;

//         const centerX = (currentPoint[0].x + currentPoint[2].x) / 2;
//         const centerY = (currentPoint[0].y + currentPoint[2].y) / 2;

//         const RectXT = this.leftX;
//         const RectYT = this.leftY;

//         const RectXB = this.leftX + this.width;
//         const RectYB = this.leftY + this.height;

//         let res = "";

//         if (centerX === RectXT) {
//             res += "left";
//         } else if (centerX === RectXB) {
//             res += "right";
//         }

//         if (centerY === RectYT) {
//             res += "top";
//         } else if (centerY === RectYB) {
//             res += "bottom";
//         }

//         cacle[res as keyof typeof cacle]();

//         if (
//             newGeometry.width < this.minWidth ||
//             newGeometry.height < this.minHeight
//         ) {
//             return;
//         }

//         this._options = newGeometry;
//         this._points = this.getPoints();
//         this._scaleTabPoints = this.getCornerPoints();
//         this._prevPoint = point;
//     }

//     private getPointFromCorner(
//         x: number,
//         y: number,
//         width: number,
//         height: number
//     ): RectPoint {
//         return [
//             { x: x - width / 2, y: y - height / 2 }, // leftTop
//             { x: x + width / 2, y: y - height / 2 }, // rightTop
//             { x: x + width / 2, y: y + height / 2 }, // rightBottom
//             { x: x - width / 2, y: y + height / 2 }, // leftBottom
//         ];
//     }

//     private getPointFromNormal(
//         x: number,
//         y: number,
//         width: number,
//         height: number
//     ): RectPoint {
//         // x, y 是以当前图形的坐上角为原点的坐标
//         // 中心点
//         const centerX = this.leftX + x;
//         const centerY = this.leftY + y;
//         // 上下左右
//         return [
//             { x: centerX - width / 2, y: centerY - height / 2 }, // leftTop
//             { x: centerX + width / 2, y: centerY - height / 2 }, // rightTop
//             { x: centerX + width / 2, y: centerY + height / 2 }, // rightBottom
//             { x: centerX - width / 2, y: centerY + height / 2 }, // leftBottom
//         ];
//     }

//     private calcCornerPoints(
//         tag: string,
//         width = DEFAULT_SCALE_TAB_WIDTH,
//         height = DEFAULT_SCALE_TAB_WIDTH
//     ) {
//         const point = this._points[cornerPosition.indexOf(tag)];
//         const { x, y } = point;
//         return this.getPointFromCorner(x, y, width, height);
//     }

//     private calcNormalPoints(
//         tag: string,
//         width = DEFAULT_SCALE_TAB_WIDTH,
//         height = DEFAULT_SCALE_TAB_WIDTH
//     ) {
//         switch (tag) {
//             case "top":
//                 return this.getPointFromNormal(
//                     this.width / 2,
//                     0,
//                     width,
//                     height
//                 );
//             case "bottom":
//                 return this.getPointFromNormal(
//                     this.width / 2,
//                     this.height,
//                     width,
//                     height
//                 );
//             case "left":
//                 return this.getPointFromNormal(
//                     0,
//                     this.height / 2,
//                     width,
//                     height
//                 );
//             case "right":
//                 return this.getPointFromNormal(
//                     this.width,
//                     this.height / 2,
//                     width,
//                     height
//                 );
//         }
//         throw new Error("tag is not valid!");
//     }

//     private getPoints(): RectPoint {
//         const { width, height } = this._options;
//         return this.getPointFromCorner(this.x, this.y, width, height);
//     }

//     private getCornerPoints() {
//         if (typeof this.tags !== "string" && !Array.isArray(this.tags)) {
//             return []; // 处理无效的情况
//         }

//         if (typeof this.tags === "string") {
//             const isCornerTag = cornerPosition.includes(this.tags);
//             const isNormalTag = normalPosition.includes(this.tags);

//             if (isCornerTag) {
//                 return [this.calcCornerPoints(this.tags)];
//             }

//             if (isNormalTag) {
//                 return [this.calcNormalPoints(this.tags)];
//             }
//         }

//         if (!Array.isArray(this.tags)) return [];

//         return this.tags.reduce(
//             (pre, cur: ScaleTabPositon | ScaleTabPositonType) => {
//                 if (typeof cur === "string") {
//                     const isCornerTag = cornerPosition.includes(cur);
//                     const isNormalTag = normalPosition.includes(cur);

//                     if (isCornerTag) {
//                         pre.push(this.calcCornerPoints(cur));
//                     }

//                     if (isNormalTag) {
//                         pre.push(this.calcNormalPoints(cur));
//                     }
//                     return pre;
//                 }

//                 const {
//                     width = DEFAULT_SCALE_TAB_WIDTH,
//                     height = DEFAULT_SCALE_TAB_WIDTH,
//                 } = cur;

//                 const isCornerTag = cornerPosition.includes(cur.type);
//                 const isNormalTag = normalPosition.includes(cur.type);

//                 if (isCornerTag) {
//                     pre.push(this.calcCornerPoints(cur.type, width, height));
//                 }

//                 if (isNormalTag) {
//                     pre.push(this.calcNormalPoints(cur.type, width, height));
//                 }
//                 return pre;
//             },
//             [] as RectPoint[]
//         );
//     }
// }
