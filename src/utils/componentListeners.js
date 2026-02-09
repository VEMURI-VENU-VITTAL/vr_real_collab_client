export function linkClieckerAnimation(element){
    element.addEventListener("mousedown", ()=>{
        element.style.color = "green"
    })

    element.addEventListener("mouseleave", ()=>{
        element.style.color = "black"
    })

    element.addEventListener("mouseup", ()=>{
        element.style.color = "black"
    })

    element.style.cursor = "pointer"
}