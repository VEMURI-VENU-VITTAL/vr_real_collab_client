import { Button } from "../components/button"
import { Input } from "../components/input";
import { createSession, findSession } from "../utils/network";

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

    //add event listeners for clicking enter button 
    window.addEventListener("keydown", (event)=>{
        if(event.key==="Enter"){
            const existingSessionInput = oldSessionElement.input;
            const sessionIdInput = existingSessionInput.value;
            if(sessionIdInput!=""){
                findSession(sessionIdInput)
            }
            
        }
    })

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

    const oldSessionElement = Input({
        placeHolder:"Enter Session Id",
        labelText:""
    })

    oldSessionDiv.appendChild(oldSessionElement.root)

    root.appendChild(newSessionDiv)
    root.appendChild(oldSessionDiv)

    return root
}



