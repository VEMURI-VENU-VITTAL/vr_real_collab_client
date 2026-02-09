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
    gap: "8px",
    width: width,
    margin: "0 auto"
  });

  const label = document.createElement("label");
  label.textContent = labelText;

  const input = document.createElement("input");
  input.type = inputType;
  input.placeholder = placeHolder;

  Object.assign(input.style, {
    height: height,
    width: "100%",
    borderRadius: "10px",
    boxSizing: "border-box",
    padding: "6px 10px"
  });

  root.appendChild(label);
  root.appendChild(input);

  return {root, input};
}
