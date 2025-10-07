import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AddressPage = () => {
  const navigate = useNavigate();

  const [address, setAddress] = useState(() => {
    const stored = localStorage.getItem("userAddress");
    return stored
      ? JSON.parse(stored)
      : { name: "", phone: "", street: "", city: "", postal: "" };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const saveAddress = () => {
    const { name, phone, street, city, postal } = address;
    if (!name || !phone || !street || !city || !postal) {
      alert("Please fill in all address fields.");
      return;
    }
    localStorage.setItem("userAddress", JSON.stringify(address));
    navigate("/checkout");
  };

  return (
    
    <div className="container py-5">
      <h3 className="fw-semibold mb-4">Delivery Address</h3>
      <div className="mb-3">
        <label className="form-label">Full Name</label>
        <input type="text" name="name" className="form-control" value={address.name} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Phone Number</label>
        <input type="tel" name="phone" className="form-control" value={address.phone} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Street Address</label>
        <input type="text" name="street" className="form-control" value={address.street} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">City</label>
        <input type="text" name="city" className="form-control" value={address.city} onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label className="form-label">Postal Code</label>
        <input type="text" name="postal" className="form-control" value={address.postal} onChange={handleChange} />
      </div>

      <button className="btn btn-success w-100" onClick={saveAddress}>
        Save Address & Continue
      </button>
    </div>
  );
};

export default AddressPage;
