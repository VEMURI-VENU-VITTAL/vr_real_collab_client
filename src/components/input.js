export function Input({
  height = "25px",
  width = "90%",
  placeHolder = "Type Here",
  labelText = "Input",
  inputType = "text"
}) {
  const root = document.createElement("div");

  Object.assign(root.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: !labelText!=""?"8px":"0px",
    width: width,
    margin: "0 auto"
  });

  if(labelText!=""){
    const label = document.createElement("label");
    label.textContent = labelText;

    root.appendChild(label);
  }

  const input = document.createElement("input");
  input.type = inputType;
  input.placeholder = placeHolder;

  Object.assign(input.style, {
    height: height,
    width: "100%",
    borderRadius: "10px",
    boxSizing: "border-box",
    padding: "6px 10px",
    margin:0
  });

  root.appendChild(input);

  return {root, input};
}
