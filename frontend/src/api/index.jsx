import axios from "axios";
const API_BASE = "http://localhost:5000";

export async function getAllCategories() {
  const response = await fetch("http://localhost:5000/categories");
  const data = await response.json();
  return data;
}

export async function getCategoryBySlug(id) {
  const response = await fetch(`http://localhost:5000/categories/${id}`);
  const data = await response.json();
  return data;
}


// POST a new category
export async function postCategory({ name, description }) {
  const response = await fetch("http://localhost:5000/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to submit category");
  }

  return response.json();
}

// export async function getAllCategories() {
//   try {
//     const response = await fetch("http://localhost:5000/categories");
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const data = await response.json();
//     console.log("Raw API response:", data); // debug here
//     return data;
//   } catch (err) {
//     console.log("Error fetching categories:", err);
//     return { categories: [] };
//   }
// }

//Admin

export const fetchProducts = async () => {
  const res = await axios.get(`${API_BASE}/products`);
  return res.data;
};

export const addProduct = async (formData) => {
  const res = await axios.post(`${API_BASE}/products`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (id, formData) => {
  const res = await axios.put(`${API_BASE}/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_BASE}/products/${id}`);
  return res.data;
};

export const fetchCategories = async () => {
  const res = await axios.get(`${API_BASE}/categories`);
  return res.data;
};

export const addCategory = async (name) => {
  const res = await axios.post(`${API_BASE}/add_category`, { name });
  return res.data;
};

export const updateCategory = async (id, name) => {
  const res = await axios.put(`${API_BASE}/categories/${id}`, { name });
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await axios.delete(`${API_BASE}/categories/${id}`);
  return res.data;
};

export const registerUser = async ({ full_name, email_or_phone, password }) => {
  const payload = { full_name, email_or_phone, password };

  const res = await fetch("http://127.0.0.1:5000/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Registration failed");
  }

  return await res.json();
};

// api.js
export const verifyOTP = async ({ otp, email_or_phone }) => {
  const res = await fetch("http://127.0.0.1:5000/otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otp, email_or_phone }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!res.ok) {
    throw new Error(data.error || "OTP verification failed");
  }

  // return raw data for frontend to decide success/error
  return data;
};


export const resendOTP = async () => {
  const res = await fetch("http://127.0.0.1:5000/resend-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to resend OTP");
  }
  return await res.json();
};

// api.js

export const loginUser = async ({ email, password, remember }) => {
  const res = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email_or_phone: email, // transform email -> email_or_phone
      password,
      remember, // optional, backend can ignore if not needed
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Login failed");
  }

  return await res.json();
};
