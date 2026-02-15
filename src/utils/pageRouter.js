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
    const view = routes[path] || "Login";
    document.body.innerHTML = ""
    if(view=="DiscussionRoom"){
        const canvas = document.createElement("canvas")
        document.body.appendChild(canvas);
        DiscussionRoom(canvas)
    }
    else if(view=="Login"){
        document.body.appendChild(LoginPage(false))
    }
    else if(view=="Register"){
        document.body.appendChild(LoginPage(true))
    }
    else{
        document.body.appendChild(view());
    }
}

export const redirect = (url)=>{
    history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"))
}