import { Directions } from "../components/directions";
import { DiscussionRoom } from "../pages/conference";
import { JoinSession } from "../pages/join";
import { LoginPage } from "../pages/login";

const routes = {
    "/":"Login",
    "/login":"Login",
    "/register":"Register",
    "/join":JoinSession,
    "/room":"DiscussionRoom"
}

export const router = ()=>{
    const path = window.location.pathname;
    let view = routes[path] || "Login";
    const sessionUser = sessionStorage.getItem("userId")
    const sessionRoom = sessionStorage.getItem("sessionId")
    document.body.innerHTML = ""
    if (view == "DiscussionRoom") {
        if (!sessionUser) {
            redirect("/");
        } else if (!sessionRoom) {
            redirect("/join");
        }

        const container = document.createElement("div");
        container.id = "app-container";

        const canvas = document.createElement("canvas");
        const directionBlock = Directions();

        container.appendChild(canvas);
        container.appendChild(directionBlock);

        document.body.appendChild(container);

        DiscussionRoom(canvas);
    }
    else if(view=="Login"){
        document.body.appendChild(LoginPage(false))
    }
    else if(view=="Register"){
        document.body.appendChild(LoginPage(true))
    }
    else{
        if(!sessionUser){
            redirect("/")
        }
        else if(!sessionRoom){
            view = JoinSession
        }
        document.body.appendChild(view());
    }
}

export const redirect = (url)=>{
    history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"))
}