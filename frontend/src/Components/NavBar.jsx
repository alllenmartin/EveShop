// component/NavBar.js
import CategoryDetails from './Category/CategoryDetails';
import CategoryForm from './Category/CategoryForm';
import LoginForm from './LoginForm';
import ProductsList from './ProductsList'; 
import { NavLink } from "react-router-dom";

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li>
          <NavLink to="/" >Home</NavLink>
        </li>
          <li>
           <NavLink to="/login" element={<LoginForm />} >Login</NavLink>
        </li>
        <li>
          <NavLink to="/about">About</NavLink>
        </li>
        <li>
          <NavLink to="/products" element={<ProductsList />} >Products</NavLink>
        </li>
         <li>
          <NavLink to="/category" element={<CategoryForm />} >Categories</NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;