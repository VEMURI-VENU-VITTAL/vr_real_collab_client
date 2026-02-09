import { Button } from "../components/button";
import { Input } from "../components/input"
import { linkClieckerAnimation } from "../utils/componentListeners";
import { submitLogin } from "../utils/network";
import { redirect } from "../utils/pageRouter";


export function LoginPage(isRegister = false){

  const pageWrapper = document.createElement("div");
  const storedUser = sessionStorage.getItem("userName")
  if(storedUser){
    setTimeout(()=>redirect("/join"), 0)
  }
  
  const toggleForm = ()=>{
    if(isRegister){
        redirect("/login")
    }
    else{
        redirect("/register")
    }
  }


  Object.assign(pageWrapper.style, {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dbebe8"
  });
    const root = document.createElement("div")
    Object.assign(root.style,{
        height:"300px",
        width:"400px",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        gap:"10px",
        border:"1px",
        boxShadow : "0 10px 25px rgba(0,0,0,0.35)",
        transform : "translateZ(10px)",
        backdropFilter : "blur(4px)",
        borderRadius:"10px"
    })

    //login heading
    const loginHeading = document.createElement("div")
    loginHeading.textContent = isRegister?"REGISTRATION":"LOGIN"
    loginHeading.style.fontSize="18px"

    const userName = Input({placeHolder:"Username", labelText:"Username", width:"90%"})
    const password = Input({placeHolder:"password", labelText:"password", inputType:"password", width:"90%"})

    //footer buttons
    const buttonsSection = document.createElement("div")
    buttonsSection.style.width = "100%"
    buttonsSection.style.position = "relative";
    buttonsSection.style.display = "flex";
    buttonsSection.style.justifyContent = "space-evenly";
    buttonsSection.style.margin = "10px"
    const loginButton = Button({
        text:"login"
    })

    //when clicking login button process the request
    loginButton.addEventListener("click", ()=>{
        submitLogin(isRegister, userName.input.value, password.input.value)
        userName.input.value = ""
        password.input.value = ""
    })

    const registerButton = Button({
        text:"register"
    })

    //when clicking register button process the request
    registerButton.addEventListener("click", ()=>{
        submitLogin(isRegister, userName.input.value, password.input.value)
        userName.input.value = ""
        password.input.value = ""
    })

    const newUserLink = document.createElement("span")
    newUserLink.textContent = "New User?"
    linkClieckerAnimation(newUserLink)
    newUserLink.addEventListener("click",toggleForm)

    const existingLogin = document.createElement("span")
    existingLogin.textContent = "Existing User?"
    linkClieckerAnimation(existingLogin)

    existingLogin.addEventListener("click",toggleForm)

    if(!isRegister){
        buttonsSection.appendChild(loginButton)
        buttonsSection.appendChild(newUserLink)
    }
    else{
        buttonsSection.appendChild(registerButton)
        buttonsSection.appendChild(existingLogin)
    }

    root.appendChild(loginHeading)
    root.appendChild(userName.root)
    root.append(password.root)

    root.append(buttonsSection)
    pageWrapper.appendChild(root);
    return pageWrapper;
}