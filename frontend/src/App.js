// import logo from './logo.svg';
import './App.css';
import React from 'react';
import ProductsList from './Components/ProductsList'; //1
import LoginForm from './Components/LoginForm';
import RegisterForm from './Components/RegisterForm';

import CategoryDetails from './Components/Category/CategoryDetails';
import NavBar from './Components/NavBar';
import ProductDetailsPage from './Components/ProductDetailsPage'; 
import CatalogueForm from './Components/CatalogueForm';
import AdminPage from './Components/AdminPage';
import { lazy, Suspense } from 'react';




import { Routes, Route } from 'react-router-dom';
import CataloguePage from './Components/CatalogueForm';
const CategoryForm = lazy(() => import('./Components/Category/CategoryForm'));

// function App() { 
//   return ( 
//     <div className="App">  
//       <h1>Items</h1>  
//       <ItemsList />  
//     </div>
//   );
// }
// const App = () => {
//    return (
//       <>
//          <Routes>
//             <Route path="/" element={<HomeForm />} />
//             <Route path="/products" element={<ProductsList />} />
//             {/* <Route path="/about" element={<About />} /> */}
//          </Routes>
//       </>
//    );
// };

// export default App;

const App = () => {
  return (
    <>
       {/* <NavBar /> */}
         <Suspense fallback={<div className="container">Loading...</div>}>
      <Routes>
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/category" element={<CategoryForm />} />
        <Route path="/categories/:id" element={<CategoryDetails />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/products" element={<CatalogueForm />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/admin" element={<AdminPage />} />
       
      </Routes>
      </Suspense>
    </>
  );
};
export default App;
