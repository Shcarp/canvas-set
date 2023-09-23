import { useEffect, useRef, useState } from "react";
import "./App.css";
import { Drawer } from "./canvas/drawer";
import { ImagePolygon } from "./canvas/imagePolygon";
import { Rect } from "./canvas/base";
import { DragAndZoomRect } from "./canvas/dragAndZoom";

function App() {
    const ref = useRef<HTMLCanvasElement>(null);
    const [drawer, setDrawer] = useState<Drawer | null>(null);

    useEffect(() => {
      if (!ref.current) return;

      const drawer = new Drawer(ref.current, {
        width: 1200,
        height: 800,
      });

      setDrawer(drawer);

      return () => {
        drawer.destroy();
      }

    }, [ref]);

    useEffect(() => {
        if (!drawer) return;
        // lx 0 + 100 ly: 0 + 50
        const image = new ImagePolygon({
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            scalable: false,
            dragable: true,
            url: "https://cdn.openart.ai/uploads/image_GIsUlIPQ_1695016799588_512.webp",
            tags: [
                "left",
                "right",
                "top",
                "bottom",
                "leftBottom",
                "leftTop",
                "rightBottom",
                "rightTop",
            ],
        });

        // lx 100 ly: 50 
        const rct = new Rect({
            x: 600,
            y: 400,
            width: 1000,
            height: 700,
            color: "red",
            type: "fill",
        });

        const drect = new DragAndZoomRect({
            x: 400,
            y: 400,
            width: 200,
            height: 200,
            color: "red",
            type: "fill",
            dragable: true,
            scalable: true,
            tags: ['left'],
            zIndex: 8
        })

        // drawer.addPolygon(rect);
        drawer.addPolygon(rct);
        drawer.addPolygon(drect);

        rct.addChild(image);

        drawer.draw();

        return () => {
            drawer.destroy();
        };
    }, [drawer]);

    return (
        <div
            style={{
                margin: "0 auto",
                height: "800px",
                width: "1200px",
            }}
        >
            <canvas
                ref={ref}
                width="1200px"
                height="800px"
                style={{
                    height: "100%",
                    width: "100%",
                }}
            />
        </div>
    );
}

export default App;
