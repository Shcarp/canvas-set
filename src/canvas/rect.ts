import { DragAndZoomRect, DragAndZoomRectOptions } from "./dragAndZoom";
import { DrawHelper } from "./helper";

type ImageOptions = DragAndZoomRectOptions 

export class DRect extends DragAndZoomRect<ImageOptions> {

    constructor(geometry: ImageOptions) {
        super(geometry);
    }

    doDraw(): void {
        DrawHelper.drawRect(this.ctx, {
            x: this.leftX,
            y: this.leftY,
            width: this.width,
            height: this.height,
            type: this.options.type ?? "stroke",
            color: this.options?.color ?? "black",
        });
    }
}
