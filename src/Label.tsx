import { PropsWithChildren } from "react";

export const Label = (props: PropsWithChildren<{}>) => <div className="text-center mb-[-1em]">{ props.children }</div>;