export function Button({
    text="Button",
    className = "",
    disabled = false,
    type = "button",
    height = "25px",
    width = "fit-content",
    backgroundColor = "inherit",
    borderRadius = "10px",
    whiteSpace = "nowrap",
    isShadow = false
}){
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = className;
    btn.disabled = disabled;
    btn.type = type;
    btn.style.height = height;
    btn.style.width = width;
    btn.style.backgroundColor = backgroundColor;
    btn.style.borderRadius = borderRadius;
    btn.style.whiteSpace = whiteSpace
    btn.style.cursor = "pointer"
    if(isShadow){
        btn.style.boxShadow = "0 10px 25px rgba(0,0,0,0.35)";
        btn.style.transform = "translateZ(10px)";
        btn.style.backdropFilter = "blur(4px)";
    }

    return btn;
}