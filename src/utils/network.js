import { redirect } from "./pageRouter";
import { avatarMap, createRemoteAvatar } from "./remoteAvatars";
import { getCall, postcall } from "./routing"

export const submitLogin=async (isRegister, userName, password)=>{
    const input = {
        userName:userName,
        password:password
    }
    let data;
    if(isRegister){
    data = await postcall(import.meta.env.VITE_API_BASE+"user/create", input)
    }
    else{
        data = await getCall(import.meta.env.VITE_API_BASE+`user/get?userName=${input.userName}&password=${input.password}`)
    }
    if(data.status == "SUCCESS"){
        sessionStorage.setItem("userName", data?.user.userName)
        sessionStorage.setItem("userId", data?.user?.id)
        redirect("/join")
    }
}

export const createSession = async(userId)=>{
    let data = await postcall(import.meta.env.VITE_API_BASE+"session/create", userId);
    if(data.status=="SUCCESS"){
        sessionStorage.setItem("sessionId", data?.data?.id);
        redirect("/room")
    }
}

export const findSession = async(sessionId)=>{
    let data = await getCall(import.meta.env.VITE_API_BASE+`session/find?sessionId=${sessionId}`);
    if(data.status=="SUCCESS"){
        sessionStorage.setItem("sessionId", data?.data?.id)
        redirect("/room")
        Object.keys(avatarMap).forEach(key => delete avatarMap[key]);
    }
}

export const getAvatarEvents = async(roomId)=>{
    let data = await getCall(import.meta.env.VITE_API_BASE+`event/fetch?roomId=${roomId}`);
    if(data.status=="SUCCESS"){
        data=data?.data
        data?.forEach(avatarEvent=>{
            if(avatarEvent){
                console.log("avatar events", avatarEvent)
                avatarEvent.eventType = "APPEARS"
                createRemoteAvatar(avatarEvent);
            }
        })
    }
}

