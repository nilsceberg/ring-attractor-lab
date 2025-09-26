import { PropsWithChildren } from "react"

export const Divider = (props: PropsWithChildren<{}>) => {
    return <div className="w-full grow-0 basis-0 ml-auto mr-auto text-center border-b-1 border-[#777] text-[#ccc] mb-2 mt-3">{props.children}</div>
}
