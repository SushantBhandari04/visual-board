import { ReactElement } from "react";

export default function Icon({icon, onClick, enable}: {icon: ReactElement, onClick: ()=>void, enable: boolean}){
    return <div className={`p-2  rounded-full border-1 border-black ${enable?"text-red-500":"text-black"}`} onClick={onClick}>
        {icon}
    </div>
}