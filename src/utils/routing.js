export const postcall=async (url, input)=>{
    const response = await fetch(url, {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(input || "")
    })

    const data = await response.json()
    return data;
}

export const getCall = async (url)=>{
    const response = await fetch(url, {
        method:"GET",
        headers:{
            "Content-Type":"application/json"
        }
    })

    const data = await response.json()
    return data;
}