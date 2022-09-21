import React from 'react';
type Box = {
    key : number;
    country: never;
  };

const Card = (props:Box) => {
    return (
        <li>
            <div className="card">
                <img src = {props.country['flags']['svg']} alt= {"drapeau"+ props.country['translations']['fra']['common']}/>
                <div className="infos">
                    <h2>{props.country['translations']['fra']['common']}</h2>
                </div>
            </div>
        </li>
            
    );
};

export default Card;