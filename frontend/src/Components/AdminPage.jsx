import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Base URL for backend
const BASE_URL = "http://localhost:5000";

// Resolve image helper
const resolveImage = (imgUrl) => {
  if (!imgUrl) return "https://via.placeholder.com/400x300?text=No+Image";
  if (imgUrl.startsWith("http")) return imgUrl;
  if (imgUrl.startsWith("/")) return `${BASE_URL}${imgUrl}`;
  return `${BASE_URL}/uploads/${imgUrl}`;
};

// Toast Component
const Toast = ({ message, duration = 3000, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  return (
    <div
      className="position-fixed top-0 end-0 m-3 p-3 bg-success text-white shadow-lg rounded-4"
      style={{ zIndex: 1055, minWidth: "220px", animation: `fadeInOut ${duration}ms forwards` }}
    >
      <i className="bi bi-check-circle me-2"></i>
      {message}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

const AdminPage = () => {
  const [activeMenu, setActiveMenu] = useState("Products");
  const [toasts, setToasts] = useState([]);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);

  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  // Fetch data
  useEffect(() => {
    fetch(`${BASE_URL}/products`).then((res) => res.json()).then(setProducts).catch(console.error);
    fetch(`${BASE_URL}/orders`).then((res) => res.json()).then(setOrders).catch(console.error);
    fetch(`${BASE_URL}/users`).then((res) => res.json()).then(setUsers).catch(console.error);
    fetch(`${BASE_URL}/categories`).then((res) => res.json()).then(setCategories).catch(console.error);
  }, []);

  // Toast
  const showToast = (message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
  };

  // Pagination & search
  const getPaginated = (data) => {
    const filtered = data.filter((item) =>
      Object.values(item).join(" ").toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);
    return { paginated, totalPages };
  };

  // const handleDelete = (id) => {
  //   if (activeMenu === "Products") setProducts((prev) => prev.filter((p) => p.id !== id));
  //   if (activeMenu === "Orders") setOrders((prev) => prev.filter((o) => o.id !== id));
  //   if (activeMenu === "Users") setUsers((prev) => prev.filter((u) => u.id !== id));
  //   if (activeMenu === "Categories") setCategories((prev) => prev.filter((c) => c.id !== id));
  //   showToast(`${activeMenu.slice(0, -1)} deleted successfully!`);
  // };

  const handleDelete = async (id) => {
  if (!window.confirm(`Are you sure you want to delete this ${activeMenu.slice(0, -1)}?`)) return;

  try {
    let url = "";
    if (activeMenu === "Products") url = `${BASE_URL}/products/${id}`;
    if (activeMenu === "Categories") url = `${BASE_URL}/categories/${id}`;
    if (activeMenu === "Orders") url = `${BASE_URL}/orders/${id}`;
    if (activeMenu === "Users") url = `${BASE_URL}/users/${id}`;

    if (!url) return;

    const res = await fetch(url, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      // If deleting a category with products, show product list
      if (activeMenu === "Categories" && data.products) {
        const productNames = data.products.map(p => p.name).join(", ");
        alert(
          `Cannot delete category. It has assigned products: ${productNames}.\n` +
          `Please reassign or delete these products first.`
        );
        return;
      }

      throw new Error(data.error || "Failed to delete");
    }

    // Update frontend state
    if (activeMenu === "Products") setProducts(prev => prev.filter(p => p.id !== id));
    if (activeMenu === "Categories") setCategories(prev => prev.filter(c => c.id !== id));
    if (activeMenu === "Orders") setOrders(prev => prev.filter(o => o.id !== id));
    if (activeMenu === "Users") setUsers(prev => prev.filter(u => u.id !== id));

    showToast(`${activeMenu.slice(0, -1)} deleted successfully!`);
  } catch (err) {
    console.log(err);
    showToast(err.message);
  }
};


  const openModal = (item = null) => {
    setEditingItem(item);
    setShowModal(true);
    setImagePreview(item?.image ? resolveImage(item.image) : "");
    setImageFile(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // const handleSave = async () => {
  //   if (activeMenu !== "Products") return;

  //   const formData = new FormData();
  //   formData.append("name", document.querySelector("#product-name").value);
  //   formData.append("category", document.querySelector("#product-category").value);
  //   formData.append("price", document.querySelector("#product-price").value);
  //   formData.append("rating", document.querySelector("#product-rating").value);

  //   // Send new image if selected, else send current image filename
  //   if (imageFile) {
  //     console.log("Uploading file:", imageFile.name);
  //     formData.append("image", imageFile);
  //   } else if (editingItem?.image) {
      
  //     formData.append("existingImage", editingItem.image);
  //   }

  //   const url = editingItem ? `${BASE_URL}/products/${editingItem.id}` : `${BASE_URL}/products`;

  //   try {
  //     const res = await fetch(url, {
  //       method: editingItem ? "PUT" : "POST",
  //       body: formData,
  //     });

  //     const text = await res.text();
  //     let data = text ? JSON.parse(text) : {};
  //     if (!res.ok) throw new Error(data?.error || "Failed to save product");

     

  //     showToast(`Product ${editingItem ? "updated" : "added"} successfully!`);

  //     if (editingItem) {
  //       setProducts((prev) => prev.map((p) => (p.id === editingItem.id ? data.data || { ...p } : p)));
  //     } else {
  //       setProducts((prev) => [...prev, data.data || {}]);
  //     }

  //     setShowModal(false);
  //     setImageFile(null);
  //     setImagePreview("");
  //   } catch (err) {
  //      console.log(err.message);
  //     showToast(err.message);
  //   }
  // };

  const handleSave = async () => {
  let url = "";
  let method = "";
  let formData = new FormData();

  // ----------------------
  // SAVE PRODUCT
  // ----------------------
  if (activeMenu === "Products") {
    formData.append("name", document.querySelector("#product-name").value);
    formData.append("category", document.querySelector("#product-category").value);
    formData.append("price", document.querySelector("#product-price").value);
    formData.append("rating", document.querySelector("#product-rating").value);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    url = editingItem
      ? `${BASE_URL}/products/${editingItem.id}`
      : `${BASE_URL}/products`;

    method = editingItem ? "PUT" : "POST";
  }

  // ----------------------
  // SAVE CATEGORY
  // ----------------------
  if (activeMenu === "Categories") {
    const name = document.querySelector("#category-name").value;

    formData.append("name", name);
    formData.append("description", name);

    url = editingItem
      ? `${BASE_URL}/categories/${editingItem.id}`
      : `${BASE_URL}/categories`;

    method = editingItem ? "PUT" : "POST";
  }

  // NOTHING TO SAVE
  if (!url) return;

  try {
    const res = await fetch(url, { method, body: formData });

    const text = await res.text();
    let data = text ? JSON.parse(text) : {};
    console.log(data)
    if (!res.ok) throw new Error(data.error || "Failed to save");

    showToast(
      `${activeMenu.slice(0, -1)} ${editingItem ? "updated" : "added"} successfully!`
    );

    // Update state
    if (activeMenu === "Products") {
      if (editingItem) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingItem.id ? data.data : p
          )
        );
      } else {
        setProducts((prev) => [...prev, data.data]);
      }
    }

    if (activeMenu === "Categories") {
      if (editingItem) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingItem.id ? data.data : c
          )
        );
      } else {
        setCategories((prev) => [...prev, data.data]);
      }
    }

    setShowModal(false);
    setImageFile(null);
    setImagePreview("");
  } catch (err) {
    console.log(err.message);
    showToast(err.message);
  }
};


  const { paginated, totalPages } = (() => {
    if (activeMenu === "Products") return getPaginated(products);
    if (activeMenu === "Orders") return getPaginated(orders);
    if (activeMenu === "Users") return getPaginated(users);
    return getPaginated(categories);
  })();

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="d-flex min-vh-100 bg-light flex-column flex-lg-row">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} onDone={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
      ))}

      {/* Sidebar */}
      <div className="bg-white shadow-sm p-3 flex-shrink-0" style={{ width: "220px" }}>
        <h5 className="fw-bold text-success mb-4">Admin Panel</h5>
        {["Dashboard", "Products", "Orders", "Users", "Categories"].map((menu) => (
          <div
            key={menu}
            className={`p-2 mb-1 rounded ${activeMenu === menu ? "bg-success text-white" : "text-secondary"}`}
            style={{ cursor: "pointer" }}
            onClick={() => { setActiveMenu(menu); setPage(1); }}
          >
            {menu}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h4 className="text-success">{activeMenu}</h4>
          {(activeMenu === "Products" || activeMenu === "Users" || activeMenu === "Categories") && (
            <button className="btn btn-success" onClick={() => openModal()}>
              <i className="bi bi-plus-circle me-2"></i> Add {activeMenu.slice(0, -1)}
            </button>
          )}
        </div>

        {/* Search */}
        <input
          type="text"
          className="form-control mb-3 rounded-pill"
          placeholder={`Search ${activeMenu.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Table */}
        <div className="table-responsive">
          <table className="table table-striped table-hover shadow-sm rounded-4 bg-white">
            <thead className="table-success">
              <tr>
                {activeMenu === "Products" && <><th>#</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Rating</th></>}
                {activeMenu === "Orders" && <><th>#</th><th>Order Ref</th><th>Customer</th><th>Total</th><th>Status</th></>}
                {activeMenu === "Users" && <><th>#</th><th>Name</th><th>Email</th><th>Role</th></>}
                {activeMenu === "Categories" && <><th>#</th><th>Name</th></>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, i) => (
                <tr key={item.id}>
                  <td>{i + 1 + (page - 1) * itemsPerPage}</td>
                  {activeMenu === "Products" && <>
                    <td><img src={resolveImage(item.image)} alt={item.name} style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }} /></td>
                    <td>{item.name}</td><td>{item.category}</td><td>{item.price.toLocaleString()}</td><td>{item.rating}</td>
                  </>}
                  {activeMenu === "Orders" && <>
                    <td>{item.reference}</td><td>{item.customer}</td><td>{item.total.toLocaleString()}</td><td>{item.status}</td>
                  </>}
                  {activeMenu === "Users" && <>
                    <td>{item.name}</td><td>{item.email}</td><td>{item.role}</td>
                  </>}
                  {activeMenu === "Categories" && <td>{item.name}</td>}
                  <td>
                    {activeMenu !== "Orders" && <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openModal(item)}>Edit</button>}
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={activeMenu === "Categories" ? 2 : activeMenu === "Products" ? 6 : 4} className="text-center text-muted py-3">
                    No {activeMenu.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <nav>
            <ul className="pagination justify-content-center">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link rounded-pill" onClick={prevPage}>Prev</button></li>
              {[...Array(totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                  <button className="page-link rounded-pill" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link rounded-pill" onClick={nextPage}>Next</button></li>
            </ul>
          </nav>
        )}

        {/* Modal */}
        {showModal && (
          <div className="modal fade show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content rounded-4 shadow-sm">
                <div className="modal-header">
                  <h5 className="modal-title">{editingItem ? "Edit" : "Add"} {activeMenu.slice(0, -1)}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                </div>
                <div className="modal-body">
                  {activeMenu === "Products" && <>
                    <input id="product-name" type="text" className="form-control mb-3" placeholder="Product Name" defaultValue={editingItem?.name || ""} />
                    <select id="product-category" className="form-control mb-3" defaultValue={editingItem?.category || ""}>
                      <option value="" disabled>Select Category</option>
                      {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <input id="product-price" type="number" className="form-control mb-3" placeholder="Price" defaultValue={editingItem?.price || ""} />
                    <input id="product-rating" type="number" className="form-control mb-3" placeholder="Rating" defaultValue={editingItem?.rating || 0} />
                    <input id="product-image" type="file" className="form-control mb-2" accept="image/*" onChange={handleImageChange} />
                    {imagePreview && <div className="text-center mb-2">
                      <img src={imagePreview} alt="Preview" style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "5px" }} />
                    </div>}
                  </>}
                  {activeMenu === "Users" && <>
                    <input type="text" className="form-control mb-3" placeholder="Name" defaultValue={editingItem?.name || ""} />
                    <input type="email" className="form-control mb-3" placeholder="Email" defaultValue={editingItem?.email || ""} />
                    <input type="text" className="form-control mb-3" placeholder="Role" defaultValue={editingItem?.role || "user"} />
                  </>}
                  {activeMenu === "Categories" && <input type="text" className="form-control mb-3" id="category-name" placeholder="Category Name" defaultValue={editingItem?.name || ""} />}
                  {activeMenu === "Orders" && <p>Orders cannot be manually added here.</p>}
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  {activeMenu !== "Orders" && <button className="btn btn-success" onClick={handleSave}>Save</button>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
