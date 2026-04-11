export function Directions(){
    const sessionId = sessionStorage.getItem("sessionId")
    const roomIdElement = document.createElement("div")
    roomIdElement.className="overlay-text"
    roomIdElement.innerText = sessionId?`room id: ${sessionId}`:''

    //event listeners
    roomIdElement.addEventListener("click", async ()=>{
        try{
            await navigator.clipboard.writeText(sessionId)
            roomIdElement.innerText = "Copied! ✅"

            setTimeout(()=>{
                roomIdElement.innerText = `room id: ${sessionId}`
            }, 1500)
        } catch(err){
            console.log("error occured while copying room id: ", err)
        }
    })
    return roomIdElement
}