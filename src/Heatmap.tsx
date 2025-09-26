import { PNG } from "pngjs/browser";
import { HEATMAP_COLOR } from "./colors";
import { SimulationState } from "./simulation";
import { MAX_HISTORY_SAMPLES } from "./settings";
import { HistoryEntry } from "./Plots";
import { useMemo, useRef } from "react";
import createColormap from "colormap";

interface HeatmapData {
    completedChunks: string[],
    chunkWidth: number,
    head: PNG,
    headColumn: number,
    time: number,
}

function createEmptyChunk(height: number, width: number): string {
    let png = new PNG({
        width,
        height,
    });
    return PNG.sync.write(png).toString("base64");
}

function initializeHeatmap(chunkCount: number, totalWidth: number, height: number): HeatmapData {
    const completedChunks = [];
    const chunkWidth = Math.ceil(totalWidth / chunkCount);
    for (let i=0; i<chunkCount; ++i) {
        completedChunks.push(createEmptyChunk(height, chunkWidth));
    }
    return {
        completedChunks,
        chunkWidth,
        head: new PNG({ width: chunkWidth, height }),
        headColumn: 0,
        time: 0,
    }
}

interface HeatmapProps {
    state: SimulationState,
    history: HistoryEntry[],
    show: boolean,
    xExtent: [number, number],
    yExtent: [number, number],
}

const CHUNK_COUNT = 4;
export const Heatmap = (props: HeatmapProps) => {
    const colors = useMemo(() => createColormap({
        colormap: "inferno",
        nshades: 32,
        format: "hex",
    }).map(s => Number.parseInt(s.substring(1), 16)), []);

    const data = useRef<HeatmapData>(null);
    if (!data.current || props.state.time < data.current.time) {
        data.current = initializeHeatmap(CHUNK_COUNT, MAX_HISTORY_SAMPLES, props.state.neurons);
    }

    if (props.state.time > data.current!.time) {
        data.current!.time = props.state.time;
        // Time has advanced; record new data.
        const color = HEATMAP_COLOR;
        const i = data.current!.headColumn;
        const width = data.current!.head.width;
        const height = data.current!.head.height;
        const activity = props.history[props.history.length - 1].activity;
        for (let j=0; j < props.state.neurons; ++j) {
            const color = colors[Math.round(activity[j] * (colors.length - 1))];
            data.current!.head.data.writeInt32BE(
                (color << 8) + 0xff,// Math.round(activity[j] * 0xff),
                4*(width * ((height - j - 1 + height / 2) % height) + i));
        }
        data.current!.headColumn++;

        if (data.current!.headColumn == width) {
            data.current!.headColumn = 0;

            data.current!.completedChunks.splice(0, 1);
            data.current!.completedChunks.push(PNG.sync.write(data.current!.head).toString("base64"));
            data.current.head = new PNG({ height: props.state.neurons, width: data.current!.chunkWidth })
        }
    }

    const headChunk = PNG.sync.write(data.current!.head).toString("base64");
    const chunkWidth = (props.xExtent[1] - props.xExtent[0]) / CHUNK_COUNT;
    const headOffset = chunkWidth / data.current!.chunkWidth * data.current!.headColumn;

    if (!props.show) {
        return <></>;
    }

    return (
        <>
            <defs>
                <clipPath id="heatmap-area">
                    <rect
                        x={props.xExtent[0]}
                        y={props.yExtent[1]}
                        width={props.xExtent[1] - props.xExtent[0]}
                        height={props.yExtent[0] - props.yExtent[1]}
                    />
                </clipPath>
            </defs>
            {
                data.current.completedChunks.map((chunk, i) =>
                    <image key={i}
                        imageRendering="pixelated"
                        preserveAspectRatio="none"
                        x={props.xExtent[0] + i * chunkWidth - headOffset}
                        y={props.yExtent[1]}
                        width={chunkWidth}
                        height={props.yExtent[0] - props.yExtent[1]}
                        xlinkHref={`data:image/png;base64,${chunk}`}
                        clipPath="url(#heatmap-area)"/>
                )
            }
            <image key={CHUNK_COUNT}
                imageRendering="pixelated"
                preserveAspectRatio="none"
                x={props.xExtent[0] + CHUNK_COUNT * chunkWidth - headOffset}
                y={props.yExtent[1]}
                width={chunkWidth}
                height={props.yExtent[0] - props.yExtent[1]}
                xlinkHref={`data:image/png;base64,${headChunk}`}/>
        </>
    );
}