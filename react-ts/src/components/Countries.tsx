import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Card from './Card';


const Countries = () => {
    const [data, setData] = useState([]);
    const [rangeValue, setRangeValue] = React.useState('5');
    const radios = ["Africa", "America", "Asia", "Europe", "Oceania"];
    const [selectedRadio, setSelectedRadio] = useState("");
    useEffect(()=>{
        axios.get("https://restcountries.com/v3.1/all")
        .then((res) => setData(res.data));
    },[]);
 
    return (    
        <div className="countries">
            <ul className="radio-container">
                <input type="range" min="1" max = "250" defaultValue={rangeValue} onChange={(e) => setRangeValue(e['target']['value'])}/>
               {radios.map((continent)=>
               <li>
                    <input type="radio" id={continent} name="continentRadio" onChange={(e) => setSelectedRadio(e.target.id)}/>
                    <label  htmlFor={continent}>{continent}
                    </label>
               </li>)}
            </ul>
           
            <ul>
               {data.filter((country) => Array(country['continents']).includes(selectedRadio))
               .slice(0,Number(rangeValue))
               .map((country, index) => (<Card key={index} country={country}  />))}
            </ul>
        </div>
    );
};

export default Countries;