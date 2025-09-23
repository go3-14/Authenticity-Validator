import React,{useState,useEffect} from 'react';

const App=()=>{
    const[data,setData] = useState(null);
    useEffect(()=>{
        fetch("http://127.0.0.1:5000/api/data")
            .then((res)=>res.json())
            .then((json)=>setData(json))
            .catch((err)=>console.log("Error fetching data",err));
    },[]);

    return(
        <div>
            <h1>Data from backend!</h1>
            {data?(
                <div>
                    <p>Name:{data.name}</p>
                    <p>Age:{data.age}</p>
                    <p>Skills:{data.skills.join(', ')}</p>

                </div>
            ):(
                <p>Loading...</p>
            )}
        </div>
        
    );
}

export default App;