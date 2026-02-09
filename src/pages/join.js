import { Button } from "../components/button"
import { createSession } from "../utils/network";

export function JoinSession(){
    const root = document.createElement("div");
    root.style.height = "100%";
    root.style.width = "100%";
    root.style.position = "absolute";
    root.style.display = "flex";
    root.style.flexDirection = "row";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    root.style.gap = "20px"

    const newSessionDiv = document.createElement("div");
    newSessionDiv.className = "new-session";

    const oldSessionDiv = document.createElement("div");
    oldSessionDiv.className = "old-session";

    const newSessionClick = ()=>{
        const userId = sessionStorage.getItem("userId")
        createSession(userId)
    }
    const newSessionButton = Button({
        text:"new",
        isShadow:true
    })

    newSessionButton.addEventListener("click", ()=>{
        newSessionClick();
    })

    newSessionDiv.appendChild(newSessionButton)

    const oldSessionButton = Button({
        text:"Join With Id",
        isShadow:true
    })

    oldSessionDiv.appendChild(oldSessionButton)

    root.appendChild(newSessionDiv)
    root.appendChild(oldSessionDiv)

    return root
}



