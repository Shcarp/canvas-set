import { DragAndZoomRect, DragAndZoomRectOptions } from "./dragAndZoom";
import { DrawHelper } from "./helper";

type ImageOptions = DragAndZoomRectOptions & {
    url: string;
};

enum ImageStatus {
    INIT = "init",
    LOADING = "loading",
    LOADED = "loaded",
    ERROR = "error",
}

export class ImagePolygon extends DragAndZoomRect<ImageOptions> {
    private _loadStatus: ImageStatus = ImageStatus.INIT;
    private _url: string = "";
    private image: HTMLImageElement = new Image();

    constructor(geometry: ImageOptions) {
        super(geometry);
        this.loadStatus = ImageStatus.LOADING;
        this.image.src = geometry.url;
        this.image.onload = () => {
            this.loadStatus = ImageStatus.LOADED;
        };
    }

    get url() {
        return this._url;
    }

    set loadStatus(status: ImageStatus) {
        this._loadStatus = status;
        if (status === ImageStatus.LOADED && this.attachStatus) {
            this.drawer.draw();
        }
    }

    doDraw(): void {
        super.doDraw();
        if (this._loadStatus === ImageStatus.LOADED) {
            DrawHelper.drawImage(this.ctx, {
                dx: this.leftX,
                dy: this.leftY,
                sx: 0,
                sy: 0,
                sWidth: this.width,
                sHeight: this.height,
                dWidth: this.width,
                dHeight: this.height,
                image: this.image,
            });
        }
    }
}
