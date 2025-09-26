import React, { useEffect, useState } from 'react'; 

function ProductsList() {  
    const [items, setItems] = useState([]); 
 
    useEffect(() => { 
        fetch('http://127.0.0.1:5000/products') 
            .then(response => response.json())  
            .then(data => setItems(data)); 
    }, []); 

    return (
       <ul>
            {items.map((item, index) => (
             <li key={index}>{item.name}</li>
            ))}
    </ul>
    );
}
export default ProductsList; 