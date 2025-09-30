import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categoryName, setCategoryName] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Pagination for products
  const [prodPage, setProdPage] = useState(1);
  const prodPerPage = 6;
  const prodIndexLast = prodPage * prodPerPage;
  const prodIndexFirst = prodIndexLast - prodPerPage;
  const currentProducts = products.slice(prodIndexFirst, prodIndexLast);
  const totalProdPages = Math.ceil(products.length / prodPerPage);

  // Pagination for categories
  const [catPage, setCatPage] = useState(1);
  const catPerPage = 5;
  const catIndexLast = catPage * catPerPage;
  const catIndexFirst = catIndexLast - catPerPage;
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const currentCategories = filteredCategories.slice(catIndexFirst, catIndexLast);
  const totalCatPages = Math.ceil(filteredCategories.length / catPerPage);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const resetProductForm = () => {
    setName(""); setPrice(""); setDescription(""); setCategoryId(""); setImage(null); setImagePreview(null); setEditingProduct(null);
  };

  const handleAddOrEditProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category_id", categoryId);
      if (image) formData.append("image", image);

      if (editingProduct) {
        await axios.put(`http://localhost:5000/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5000/add_product", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      resetProductForm();
      fetchProducts();
    } catch (err) {
      console.error("Error adding/updating product:", err);
    }
  };

  const handleEditProduct = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setDescription(prod.description);
    setCategoryId(prod.category_id || "");
    setImagePreview(prod.image);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const resetCategoryForm = () => { setCategoryName(""); setEditingCategory(null); };

  const handleAddOrEditCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`http://localhost:5000/categories/${editingCategory.id}`, { name: categoryName });
      } else {
        await axios.post("http://localhost:5000/add_category", { name: categoryName });
      }
      resetCategoryForm();
      fetchCategories();
    } catch (err) {
      console.error("Error adding/updating category:", err);
    }
  };

  const handleEditCategory = (cat) => { setEditingCategory(cat); setCategoryName(cat.name); };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`http://localhost:5000/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.id === catId);
    return cat ? cat.name : "N/A";
  };

  return (
    <div className="container my-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      <div className="row mb-4">
        {/* Product Form */}
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h4>{editingProduct ? "Edit Product" : "Add Product"}</h4>
            <form onSubmit={handleAddOrEditProduct}>
              <input type="text" className="form-control mb-2" placeholder="Product Name" value={name} onChange={e => setName(e.target.value)} required />
              <input type="number" className="form-control mb-2" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} required />
              <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
              <select className="form-control mb-2" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
              <input type="file" className="form-control mb-2" onChange={e => { setImage(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }} />
              {imagePreview && <img src={imagePreview} alt="Preview" className="img-fluid mb-2" style={{ height: "100px", objectFit: "contain" }} />}
              <button className="btn btn-primary w-100">{editingProduct ? "Update Product" : "Add Product"}</button>
            </form>
          </div>
        </div>

        {/* Category Form */}
        <div className="col-md-6 mb-3">
          <div className="card p-3 h-100">
            <h4>{editingCategory ? "Edit Category" : "Add Category"}</h4>
            <form onSubmit={handleAddOrEditCategory} className="mb-2">
              <input type="text" className="form-control mb-2" placeholder="Category Name" value={categoryName} onChange={e => setCategoryName(e.target.value)} required />
              <button className="btn btn-success w-100">{editingCategory ? "Update Category" : "Add Category"}</button>
            </form>

            <input type="text" className="form-control mb-2" placeholder="Search Categories..." value={categorySearch} onChange={e => setCategorySearch(e.target.value)} />

            <ul className="list-group mb-2">
              {currentCategories.map(cat => (
                <li key={cat.id} className="list-group-item d-flex justify-content-between align-items-center">
                  {cat.name}
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditCategory(cat)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Category Pagination */}
            {totalCatPages > 1 && (
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${catPage === 1 ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCatPage(p => Math.max(1, p-1))}>Prev</button>
                  </li>
                  {Array.from({ length: totalCatPages }, (_, i) => (
                    <li key={i} className={`page-item ${i+1 === catPage ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setCatPage(i+1)}>{i+1}</button>
                    </li>
                  ))}
                  <li className={`page-item ${catPage === totalCatPages ? "disabled" : ""}`}>
                    <button className="page-link" onClick={() => setCatPage(p => Math.min(totalCatPages, p+1))}>Next</button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <h4>Products</h4>
      <div className="row row-cols-1 row-cols-md-3 g-3 mb-3">
        {currentProducts.map(prod => (
          <div key={prod.id} className="col">
            <div className="card h-100 d-flex flex-column justify-content-between p-2">
            {prod.image && (
            <div style={{ height: "140px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <img
                src={prod.image}
                alt={prod.name}
                className="card-img-top product-img"
                style={{
                    height: "100%",
                    width: "100%",
                    objectFit: "contain",
                    transition: "transform 0.3s ease",
                    // backgroundColor: "#f8f9fa",
                }}
                />
            </div>
            )}

              <div className="card-body d-flex flex-column justify-content-between">
                <div>
                  <h6 className="card-title">{prod.name}</h6>
                  <p className="card-text mb-1">${prod.price}</p>
                  <small className="text-muted">Category: {prod.category}</small>
                  <br />
                  <small className="text-truncate d-block" style={{ maxHeight: "3em", overflow: "hidden" }}>{prod.description}</small>
                </div>
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEditProduct(prod)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteProduct(prod.id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Pagination */}
      {totalProdPages > 1 && (
        <nav>
          <ul className="pagination">
            <li className={`page-item ${prodPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setProdPage(p => Math.max(1, p-1))}>Prev</button>
            </li>
            {Array.from({ length: totalProdPages }, (_, i) => (
              <li key={i} className={`page-item ${i+1 === prodPage ? "active" : ""}`}>
                <button className="page-link" onClick={() => setProdPage(i+1)}>{i+1}</button>
              </li>
            ))}
            <li className={`page-item ${prodPage === totalProdPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setProdPage(p => Math.min(totalProdPages, p+1))}>Next</button>
            </li>
          </ul>
        </nav>
      )}

      <style>
        {`
          .product-img:hover {
            transform: scale(1.2);
          }
        `}
      </style>
    </div>
  );
};

export default AdminPage;
