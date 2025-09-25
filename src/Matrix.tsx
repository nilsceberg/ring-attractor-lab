import { observer } from "mobx-react-lite";
import { SimulationState } from "./simulation";
import { ChangeEvent, FocusEvent, PropsWithChildren, useRef, useState } from "react";
import { action } from "mobx";
import { Label } from "./Label";
import { Button, Toggle } from "./Parameters";
import { useSize } from "./util";

export const Input = (props: PropsWithChildren<{ label: string, className?: string}>) => {
    return <div className={`mt-4 flex flex-row m-1 justify-center ${props.className || ""}`}>
        <div className="grow-0 whitespace-nowrap overflow-hidden overflow-ellipsis text-left content-center pr-4 text-xs">{props.label}{props.label ? ":" : ""} </div>
        <div className="basis-0 grow-0 flex flex-row h-[25px] text-sm">
            {props.children}
        </div>
    </div>;
};


const MAX_WEIGHT = 2.0;
const colorMap = (i: number, w: number, highlight: number | undefined, duplicateFirstRow: boolean) => {
    let opacity = Math.abs(w) / MAX_WEIGHT * 0.8 + 0.2;
    if (highlight !== undefined && highlight !== i) {
        //opacity = Math.max(0.1, opacity - 0.1);
    }
    if (highlight === i) {
        opacity = 1.0;
    }

    if (duplicateFirstRow && i !== 0) {
        opacity = opacity * 0.4 + 0.1;
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

    const [duplicateFirstRow, setDuplicateFirstRow] = useState(false);

    const [containerRef, containerSize] = useSize();
    const fillSize = Math.min(containerSize[0], containerSize[1] - 50);

    const style = {
        "fontSize": fillSize / 4 / props.state.neurons,
        "width": fillSize / props.state.neurons,
        "height": fillSize / props.state.neurons,
    };

    return (
        <>
            <Label>Connectivity matrix</Label>
            <div className="w-full h-full flex flex-row items-center" ref={containerRef}>
                <div className="grow"/>
                <div className="flex flex-col">
                    <div className="border-gray-[#ccc]">
                        <div className="flex flex-col border-1 border-gray-[#ccc] ml-auto mr-auto" style={{ width: fillSize }}>
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

                                                        if (duplicateFirstRow && i === 0) {
                                                            for (let k = 1; k < props.state.neurons; ++k) {
                                                                props.state.weights[k][(j + k) % props.state.neurons] = finalValue;
                                                            }
                                                        }
                                                    }
                                                }
                                                setEditing(null);
                                            });

                                            const onFocus = (e: FocusEvent<HTMLInputElement>) => e.target.select();

                                            return (
                                                <div key={j} className="border-1 border-[#666]" style={style}>
                                                    <input disabled={duplicateFirstRow && i !== 0} className="outline-0 text-center h-full w-full" style={{ backgroundColor: colorMap(i, w, props.highlight, duplicateFirstRow), color: duplicateFirstRow && i !== 0 ? "#555" : "" /*, width: "54px", height: "54px" */}} value={inputValue} onChange={onChange} onBlur={onBlur} onFocus={onFocus}/>
                                                </div>
                                                );
                                            }
                                        ) }
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                    <div className="flex flex-row">
                        <div className="mt-4 flex flex-row m-1 justify-center">
                            <Button label="Reset" onClick={action(() => {
                                if (confirm("Are you sure you want to reset the weight matrix?")) {
                                    for (let i = 0; i < props.state.neurons; ++i) {
                                        for (let j = 0; j < props.state.neurons; ++j) {
                                            props.state.weights[i][j] = 0;
                                        }
                                    }
                                }
                            })}/>
                        </div>
                        <div className="grow"/>
                        <Input label="Repeat and shift first row">
                            <Toggle enabled={duplicateFirstRow} onChange={value => {
                                setDuplicateFirstRow(value);
                                if (value) action(() => {
                                    for (let j = 0; j < props.state.neurons; ++j) {
                                        for (let k = 1; k < props.state.neurons; ++k) {
                                            props.state.weights[k][(j + k) % props.state.neurons] = props.state.weights[0][j];
                                        }
                                    }
                                })();
                            }}/>
                        </Input>
                    </div>
                </div>
                <div className="grow"/>
            </div>
        </>
    );
});

