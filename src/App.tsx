import { Stage, Layer, Rect } from "react-konva";
import "./App.css";

function App() {
    return (
        <div
            style={{
                margin: "0 auto",
                height: "800px",
                width: "1200px",
            }}
        >
            <Stage width={1200} height={800}>
                <Layer>
                    {/* <Rect> */}
                        {/* <Stage> */}
                            {/* <Layer> */}
                                <Rect />
                            {/* </Layer> */}
                        {/* </Stage> */}
                    {/* </Rect> */}
                </Layer>
            </Stage>
        </div>
    );
}

export default App;
