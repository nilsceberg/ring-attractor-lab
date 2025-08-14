import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { ChangeEvent, InputEventHandler, useEffect, useRef, useState } from "react";
import { action } from "mobx";


const MAX_WEIGHT = 2.0;
const colorMap = (i: number, w: number, highlight: number | undefined) => {
    let opacity = Math.abs(w) / MAX_WEIGHT * 0.5 + 0.5;
    if (highlight !== undefined && highlight !== i) {
        //opacity = Math.max(0.1, opacity - 0.1);
    }
    if (highlight === i) {
        opacity = 1.0;
    }

    if (w == 0.0) {
        return `rgba(128, 128, 128, ${opacity})`;
    }
    else if (w < 0.0) {
        return `rgba(128, 128, 255, ${opacity})`;
    }
    else {
        return `rgba(255, 196, 128, ${opacity})`;
    }
};

export const Matrix = observer((props: { state: SimulationState, highlight: number | undefined, setHovering?: (i: number | undefined) => void }) => {
    const setHovering = props.setHovering || ((_) => {});

    const [editing, setEditing] = useState<[number, number] | null>(null);
    const [value, setValue] = useState("");

    return (
        <div className="w-full h-full flex flex-row items-center">
            <div className="grow"/>
            <div className="flex flex-col border-1">
                {
                    props.state.weights.map((row, i) => (
                        <div key={i} className="flex flex-row" onMouseEnter={() => setHovering(i)} onMouseLeave={() => setHovering(undefined)}>
                            { row.map((w, j) => {
                                const isBeingEdited = editing !== null && editing[0] === i && editing[1] === j;
                                const inputValue = isBeingEdited ? value : w.toFixed(2);

                                const onChange = (event: ChangeEvent<HTMLInputElement>) => {
                                    setEditing([i, j]);
                                    setValue(event.target.value);
                                };

                                const onBlur = action(() => {
                                    if (isBeingEdited) {
                                        const finalValue = Number.parseFloat(inputValue);
                                        if (!Number.isNaN(finalValue)) {
                                            props.state.weights[i][j] = finalValue;
                                        }
                                    }
                                    setEditing(null);
                                });

                                return (
                                    <div key={j} className="w-[56px] h-[56px] border-1 border-[#888]">
                                        <input className="outline-0 text-center h-full w-full" style={{ backgroundColor: colorMap(i, w, props.highlight) /*, width: "54px", height: "54px" */}} value={inputValue} onChange={onChange} onBlur={onBlur}/>
                                    </div>
                                    );
                                }
                            ) }
                        </div>
                    ))
                }
            </div>
            <div className="grow"/>
        </div>
    );
});

