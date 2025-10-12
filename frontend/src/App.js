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
import ForgotPassword from './Components/ForgotPassword';
import ResetPassword from './Components/ResetPassword';
import OTPPage from './Components/OTPPage';
import WishlistPage from './Components/WishlistPage';
import CheckoutSummary from './Components/CheckoutSummary';
import DeliveryAddress from './Components/DeliveryAddress';
import AddressPage from './Components/AddressPage';
import OrdersPage from './Components/OrdersPage';
import WalletPage from './Components/WalletPage';
import WalletHistoryPage from './Components/WalletHistoryPage';
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
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/category" element={<CategoryForm />} />
        <Route path="/categories/:id" element={<CategoryDetails />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/products" element={<CatalogueForm />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/forgotpass" element={<ForgotPassword />} />
        <Route path="/resetpass" element={<ResetPassword />} />
        <Route path="/otp" element={<OTPPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutSummary />} />
        <Route path="/delivery-address" element={<DeliveryAddress />} />
        <Route path="/address" element={<AddressPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/history" element={<WalletHistoryPage />} />
       
      </Routes>
      </Suspense>
    </>
  );
};

const Home = () => (
  <div className="container py-5 text-center">
    <h1>Welcome to EveShop</h1>
    <a href="/checkout" className="btn btn-success mt-3">Go to Checkout</a>
  </div>
);
export default App;
