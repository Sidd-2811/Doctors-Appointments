// fetching api data through custom hook

import { toast } from "sonner"

const { useState } = require("react")

const useFetch = (cb)=>{
    const[data,setData] = useState(undefined)
    const[loading,setLoading] = useState(null)
    const[error,setError] = useState(null)

    // to provide some extra arguments use ...args
    const fn = async(...args)=>{
        // before fetching 
        setLoading(true)
        setError(null);

        try{
            const response = await cb(...args);
            setData(response);
            setError(null);
        }
        catch(e){
            setError(e)
            toast.error(e.message)
        }
        finally{
            setLoading(false);
        }
    }
    return {data,loading,error,fn,setData}
}

export default useFetch;