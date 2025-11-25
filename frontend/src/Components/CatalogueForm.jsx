import React, { useState, useEffect,useContext  } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link,useNavigate } from "react-router-dom";
import { AuthContext } from "../Components/AuthContext";

// Toast Component
const Toast = ({ message, duration = 3000, onDone }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDone(), duration);
    return () => clearTimeout(timer);
  }, [duration, onDone]);

  return (
    <div
      className="position-fixed top-0 end-0 m-3 p-3 bg-success text-white shadow-lg rounded-4"
      style={{
        zIndex: 1055,
        minWidth: "220px",
        animation: `fadeInOut ${duration}ms forwards`,
      }}
    >
      <i className="bi bi-check-circle me-2"></i>
      {message}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-20px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }
        .hover-shadow:hover { box-shadow: 0 8px 20px rgba(0,0,0,0.08) !important; transform: translateY(-3px); transition: all 0.18s ease; }
      `}</style>
    </div>
  );
};



//Handle Login

const redirectToLoginWithToast = () => {
  // Create toast
  const toastEl = document.createElement("div");
  toastEl.className = "position-fixed top-0 end-0 m-3 p-3 bg-danger text-white shadow-lg rounded-4";
  toastEl.innerHTML = `<i class="bi bi-exclamation-circle me-2"></i>You'll be redirected to login.`;
  toastEl.style.zIndex = 1055;
  toastEl.style.minWidth = "220px";
  toastEl.style.opacity = "0";
  toastEl.style.transform = "translateY(-60px)";
  toastEl.style.transition = "opacity 0.8s ease, transform 0.8s cubic-bezier(.68,-0.55,.27,1.55)";
  document.body.appendChild(toastEl);

  // Animate in
  requestAnimationFrame(() => {
    toastEl.style.opacity = "1";
    toastEl.style.transform = "translateY(0)";
  });

  // Keep visible 3s then fade out
  setTimeout(() => {
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateY(-60px)";
    setTimeout(() => {
      document.body.removeChild(toastEl);

      // Fade out current page and navigate to login
      document.body.style.transition = "opacity 0.6s ease";
      document.body.style.opacity = 0;
      setTimeout(() => {
       window.location.href = "/login";
      }, 600);
    }, 800); // matches transition
  }, 3000);
};


const CataloguePage = () => {
  // Products & categories
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);

  const [showWishlist, setShowWishlist] = useState(false);
  

  // Filters / UI state
  const [selectedCategory, setSelectedCategory] = useState(localStorage.getItem("category") || "All");
  const [searchTerm, setSearchTerm] = useState(localStorage.getItem("search") || "");
  const [minPrice, setMinPrice] = useState(localStorage.getItem("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(localStorage.getItem("maxPrice") || "");
  const [selectedRatings, setSelectedRatings] = useState(JSON.parse(localStorage.getItem("ratings")) || []);
  const [sortOption, setSortOption] = useState(localStorage.getItem("sort") || "default");
  const [itemsPerPage, setItemsPerPage] = useState(Number(localStorage.getItem("itemsPerPage")) || 6);
  const [page, setPage] = useState(Number(localStorage.getItem("page")) || 1);
  

  // Auth / checkout
  const [checkoutMode, setCheckoutMode] = useState(false);
  // const [isLoggedIn, setIsLoggedIn] = useState(false); // default true for testing
  const [userPhone, setUserPhone] = useState("254703622386"); // default
  const { user,logout } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const navigate = useNavigate();

  

  useEffect(() => {
    if (user) setIsLoggedIn(true);
  }, [user]);

  console.log("Is logged in?", isLoggedIn);

  // Cart
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [showCart, setShowCart] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [toasts, setToasts] = useState([]);



  // Wishlist
  const [wishlist, setWishlist] = useState(() => {
    const stored = localStorage.getItem("wishlist");
    return stored ? JSON.parse(stored) : [];
  });

   const handleWishlist = (product) => {
  let newList;
  let message;
  
  if (wishlist.find(p => p.id === product.id)) {
    // Remove from wishlist
    newList = wishlist.filter(p => p.id !== product.id);
    message = `${product.name} removed from wishlist`;
  } else {
    // Add to wishlist
    newList = [...wishlist, product];
    message = `${product.name} added to wishlist`;
  }
  
  setWishlist(newList);
  localStorage.setItem("wishlist", JSON.stringify(newList));
  
  // Add toast
  const id = Date.now();
  setToasts(prev => [...prev, { id, message }]);
};

const handleLogout = () => {
    logout();            // Clear session
    
    navigate("/products"); // Redirect user
  };


  // Fetch products
  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setQuantities(data.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
        setCategories(["All", ...new Set(data.map(p => p.category).filter(Boolean))]);
      })
      .catch(err => console.error(err));
  }, []);
  

  // Persist UI state
  useEffect(() => { localStorage.setItem("category", selectedCategory); }, [selectedCategory]);
  useEffect(() => { localStorage.setItem("search", searchTerm); }, [searchTerm]);
  useEffect(() => { localStorage.setItem("minPrice", minPrice); }, [minPrice]);
  useEffect(() => { localStorage.setItem("maxPrice", maxPrice); }, [maxPrice]);
  useEffect(() => { localStorage.setItem("ratings", JSON.stringify(selectedRatings)); }, [selectedRatings]);
  useEffect(() => { localStorage.setItem("sort", sortOption); }, [sortOption]);
  useEffect(() => { localStorage.setItem("itemsPerPage", itemsPerPage); }, [itemsPerPage]);
  useEffect(() => { localStorage.setItem("page", page); }, [page]);
  useEffect(() => { localStorage.setItem("cart", JSON.stringify(cart)); }, [cart]);

  // Filtering & sorting
  const toggleRating = (r) => {
    setPage(1);
    setSelectedRatings(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  let filtered = products.filter(p => {
    const matchCat = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMin = minPrice === "" || p.price >= Number(minPrice);
    const matchMax = maxPrice === "" || p.price <= Number(maxPrice);
    const matchRating = selectedRatings.length === 0 || selectedRatings.includes(p.rating);
    return matchCat && matchSearch && matchMin && matchMax && matchRating;
  });

  if (sortOption === "priceLowHigh") filtered.sort((a, b) => a.price - b.price);
  else if (sortOption === "priceHighLow") filtered.sort((a, b) => b.price - a.price);
  else if (sortOption === "ratingHighLow") filtered.sort((a, b) => b.rating - a.rating);
  else if (sortOption === "nameAZ") filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortOption === "nameZA") filtered.sort((a, b) => b.name.localeCompare(a.name));

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = filtered.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endIdx = Math.min(page * itemsPerPage, filtered.length);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const grandTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

// Base URL for backend
const BASE_URL = "http://localhost:5000";

// Resolve image helper
const resolveImage = (imgUrl) => {
  if (!imgUrl) return "https://via.placeholder.com/400x300?text=No+Image";
  if (imgUrl.startsWith("http")) return imgUrl;
  if (imgUrl.startsWith("/")) return `${BASE_URL}${imgUrl}`;
  return `${BASE_URL}/uploads/${imgUrl}`;
};


  // Handle Checkout
const handleCheckoutRedirect = (e) => {
  const target = isLoggedIn ? "/checkout" : "/login";

  if (!isLoggedIn) {
    // Show toast
    const toastEl = document.createElement("div");
    toastEl.className =
      "position-fixed top-0 end-0 m-3 p-3 bg-danger text-white shadow-lg rounded-4";
    toastEl.innerHTML = `<i class="bi bi-exclamation-circle me-2"></i>Please log in first`;
    toastEl.style.zIndex = 1055;
    toastEl.style.minWidth = "220px";
    toastEl.style.opacity = "0";
    toastEl.style.transform = "translateY(-60px)";
    toastEl.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    document.body.appendChild(toastEl);

    requestAnimationFrame(() => {
      toastEl.style.opacity = "1";
      toastEl.style.transform = "translateY(0)";
    });

    setTimeout(() => {
      toastEl.style.opacity = "0";
      toastEl.style.transform = "translateY(-20px)";

      setTimeout(() => {
        document.body.removeChild(toastEl);

        // Fade out page
        document.body.style.transition = "opacity 0.6s ease";
        document.body.style.opacity = 0;

        // Redirect
        setTimeout(() => {
          window.location.href = target;
        }, 600);
      }, 500);
    }, 2500);

    return; // stop further execution
  }

  // Save checkout data
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  localStorage.setItem("checkoutData", JSON.stringify({ cart, subtotal }));

  // Animate button
  e.currentTarget.style.transform = "scale(1.1)";
  e.currentTarget.style.opacity = "0.7";

  // Fade out page and redirect
  document.body.style.transition = "opacity 0.6s ease";
  document.body.style.opacity = 0;
  setTimeout(() => {
    window.location.href = target;
  }, 600);
};
 //End
  

  // Cart manipulation functions
  const handleAddToCart = (product) => {
    const existing = cart.find(p => p.id === product.id);
    const qty = quantities[product.id] || 1;
    if (existing) {
      setCart(prev => prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + qty } : p));
    } else {
      setCart(prev => [...prev, { ...product, quantity: qty }]);
    }
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: `${product.name} added to cart!` }]);
  };

  const handleCartQuantityChange = (id, newQty) => {
    if (newQty < 1) return;
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Place order
  const placeOrder = () => {
    if (!userPhone) {
      alert("Please enter a phone number before placing the order.");
      return;
    }

    const generateReference = () => {
      const timestamp = Date.now();
      const randomStr = Math.floor(Math.random() * 9000 + 1000);
      return `ORDER-${timestamp}-${randomStr}`;
    };
    const reference = generateReference();

    const payload = {
      phone_number: userPhone,
      amount: grandTotal,
      reference: reference,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity }))
    };

    console.log("Order payload:", payload);

    fetch("http://localhost:5000/place_order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        const id = Date.now() + 1;
        setToasts(prev => [...prev, { id, message: "Order placed successfully!" }]);

        setCart([]);
        setQuantities(products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {}));
        setCheckoutMode(false);
        setShowCart(false);
        localStorage.removeItem("cart");
        console.log("Order response:", data);
      })
      .catch(err => {
        console.error("Order error:", err);
        alert("Error placing order. Please try again.");
      });
  };

  const prevPage = () => setPage(p => Math.max(1, p - 1));
  const nextPage = () => setPage(p => Math.min(totalPages, p + 1));
  const goToPage = (n) => setPage(() => Math.max(1, Math.min(totalPages, n)));

   return (
    <div id="top" className="bg-light min-vh-100">
      {toasts.map(t => (
        <Toast
          key={t.id}
          message={t.message}
          duration={3000}
          onDone={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
        />
      ))}

      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold text-success fs-4" href="#top">
            <i className="bi bi-leaf-fill me-2"></i>EveShop
          </a>

          <form className="d-flex mx-auto" style={{ maxWidth: "420px", width: "100%" }} onSubmit={e => e.preventDefault()}>
            <input
              className="form-control rounded-start-pill"
              placeholder="Search..."
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            />
            <button className="btn btn-success rounded-end-pill px-3" onClick={(e) => e.preventDefault()}>
              <i className="bi bi-search"></i>
            </button>
          </form>

          <div className="d-flex align-items-center">
           <button
              className="btn btn-outline-success position-relative me-2 p-1"
              onClick={() => { setShowCart(true); setCheckoutMode(false); }}
              style={{ fontSize: "1rem", width: "38px", height: "38px" }}
              title="Cart"
            >
              <i className="bi bi-cart3"></i>
              {cart.length > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill"
                  style={{
                    fontSize: "0.7rem",
                    minWidth: "18px",
                    height: "18px",
                    lineHeight: "18px",
                    padding: "0 4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {cart.length}
                </span>
              )}
            </button>




            <button
              className="btn btn-outline-warning position-relative me-2 p-1"
              onClick={() => setShowWishlist(true)}
              style={{ fontSize: "1rem", width: "38px", height: "38px" }}
              title="Wishlist"
            >
              <i className="bi bi-heart"></i>
              {wishlist.length > 0 && (
                <span
                  className="position-absolute top-0 start-100 translate-middle badge bg-danger rounded-pill"
                  style={{
                    fontSize: "0.65rem",
                    minWidth: "18px",
                    height: "18px",
                    lineHeight: "18px",
                    padding: "0 4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {wishlist.length > 99 ? "99+" : wishlist.length}
                </span>
              )}
            </button>




     {/* Login / User Dropdown */}

                    {!isLoggedIn ? (
                      <button
                        className="btn btn-outline-success position-relative me-3 p-1"
                        style={{ width: "38px", height: "38px", fontSize: "1rem" }}
                        onClick={redirectToLoginWithToast}
                        title="Login"
                      >
                        <i className="bi bi-box-arrow-in-right"></i>
                      </button>
                    ) : (
                      <div className="dropdown me-3" style={{ position: "relative" }}>
                        <button
                          className="btn btn-outline-success position-relative p-1 dropdown-toggle"
                          style={{
                            width: "38px",
                            height: "38px",
                            fontSize: "1.1rem",
                            borderRadius: "50%",   // make it a circle
                            padding: "0",           // remove extra padding
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#28a745"        // green icon color
                          }}
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                          title="User Menu"
                        >
                          <i className="bi bi-person-circle"></i>
                        </button>

                        <ul
                          className="dropdown-menu py-1 shadow-sm"
                          style={{
                            minWidth: "140px",
                            right: 0,
                            left: "auto",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <li>
                            <a className="dropdown-item py-1" href="/account">
                              <i className="bi bi-person me-2"></i> My Account
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item py-1" href="/orders">
                              <i className="bi bi-card-list me-2"></i> My Orders
                            </a>
                          </li>
                          <li><hr className="dropdown-divider my-1" /></li>
                          <li>
                           <button
                          className="dropdown-item py-1 text-success"
                          onClick={handleLogout}                          
                        >
                          <i className="bi bi-box-arrow-right me-2"></i> Logout
                        </button>
                          </li>
                        </ul>
                      </div>
                    )}



          </div>
        </div>
      </nav>

      {/* Wishlist Modal */}
      {showWishlist && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-sm">
              <div className="modal-header">
                <h5 className="modal-title">Your Wishlist</h5>
                <button type="button" className="btn-close" onClick={() => setShowWishlist(false)} />
              </div>

              <div className="modal-body" style={{ minHeight: "220px" }}>
                {wishlist.length === 0 ? (
                  <div className="text-center py-5 text-muted">Your wishlist is empty.</div>
                ) : (
                  <ul className="list-group">
                    {wishlist.map(item => (
                      <li key={item.id} className="list-group-item d-flex align-items-center gap-3">
                        <img src={resolveImage(item.image)} alt={item.name} style={{ width: 64, height: 64, objectFit: "contain" }} className="rounded" />
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="fw-semibold">{item.name}</div>
                              <small className="text-muted">Ksh {item.price.toLocaleString()}</small>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success" onClick={() => handleAddToCart(item)}>
                            <i className="bi bi-cart-plus me-1"></i> Add to Cart
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleWishlist(item)}>
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowWishlist(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-sm">
              <div className="modal-header">
                <h5 className="modal-title">{checkoutMode ? "Checkout" : "Your Cart"}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCart(false)} />
              </div>

              <div className="modal-body" style={{ minHeight: "220px", position: "relative" }}>
                {/* Cart View */}
                <div style={{
                  opacity: checkoutMode ? 0 : 1,
                  transform: checkoutMode ? "translateX(-10px)" : "translateX(0)",
                  transition: "all 0.25s ease",
                  position: checkoutMode ? "absolute" : "relative",
                  width: "100%",
                }}>
                  {cart.length === 0 ? (
                    <div className="text-center py-5 text-muted">Your cart is empty.</div>
                  ) : (
                    <ul className="list-group">
                      {cart.map(item => (
                        <li key={item.id} className="list-group-item d-flex align-items-center gap-3">
                          <img src={resolveImage(item.image)} alt={item.name} style={{ width: 64, height: 64, objectFit: "contain" }} className="rounded" />
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">{item.name}</div>
                                <small className="text-muted">Ksh {item.price.toLocaleString()}</small>
                              </div>
                              <div className="text-end fw-bold">Ksh {(item.price * item.quantity).toLocaleString()}</div>
                            </div>

                            <div className="d-flex gap-2 align-items-center mt-2">
                              <button className="btn btn-sm btn-outline-secondary p-1" style={{ minWidth: 32 }} onClick={() => handleCartQuantityChange(item.id, Math.max(1, item.quantity - 1))}>-</button>
                              <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                style={{ width: 60 }}
                                value={item.quantity}
                                min={1}
                                onChange={e => handleCartQuantityChange(item.id, Math.max(1, Number(e.target.value) || 1))}
                              />
                              <button className="btn btn-sm btn-outline-secondary p-1" style={{ minWidth: 32 }} onClick={() => handleCartQuantityChange(item.id, item.quantity + 1)}>+</button>

                              <button className="btn btn-sm btn-outline-danger ms-2" onClick={() => handleRemoveFromCart(item.id)}>Remove</button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Checkout View */}
                <div style={{
                  opacity: checkoutMode ? 1 : 0,
                  transform: checkoutMode ? "translateX(0)" : "translateX(10px)",
                  transition: "all 0.25s ease",
                  position: checkoutMode ? "relative" : "absolute",
                  width: "100%",
                }}>
                  {checkoutMode && (
                    <div>
                      <h6 className="fw-semibold">Confirm your order</h6>
                      <p className="text-muted">Grand Total: <span className="fw-bold">Ksh {grandTotal.toLocaleString()}</span></p>

                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={userPhone}
                          onChange={e => setUserPhone(e.target.value)}
                          placeholder="Enter phone number"
                        />
                      </div>

                      <div className="d-flex gap-2">
                        <button className="btn btn-success" onClick={placeOrder}>
                          <i className="bi bi-check-circle me-2"></i> Place Order
                        </button>

                        <button className="btn btn-secondary" onClick={() => { setCheckoutMode(false); }}>
                          <i className="bi bi-arrow-left me-2"></i> Back to Cart
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!checkoutMode && (
              <div className="modal-footer">
                <div className="me-auto">
                  <h6 className="mb-0">
                    Grand Total: <span className="fw-bold">Ksh {grandTotal.toLocaleString()}</span>
                  </h6>
                </div>

                <button className="btn btn-outline-secondary" onClick={() => setShowCart(false)}>
                  Close
                </button>

                {cart.length > 0 && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success"
                      style={{ transition: "transform 0.3s ease, opacity 0.3s ease" }}
                      onClick={handleCheckoutRedirect}
                    >
                      <i className="bi bi-credit-card-2-front me-2"></i> Checkout
                    </button>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 mb-4">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h5 className="fw-bold text-success mb-3">Filters</h5>
                <input type="text" className="form-control mb-3 rounded-pill" placeholder="Search products..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }} />

                <h6 className="fw-semibold text-muted">Category</h6>
                <ul className="list-group list-group-flush mb-3">
                  {categories.map(cat => (
                    <li key={cat} className={`list-group-item border-0 py-2 ${selectedCategory === cat ? "fw-bold text-success" : "text-secondary"}`} style={{ cursor: "pointer" }} onClick={() => { setSelectedCategory(cat); setPage(1); }}>
                      {cat}
                    </li>
                  ))}
                </ul>

                <h6 className="fw-semibold text-muted">Price Range</h6>
                <div className="d-flex gap-2 mb-3">
                  <input type="number" className="form-control rounded-pill" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1); }} />
                  <input type="number" className="form-control rounded-pill" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1); }} />
                </div>

                <h6 className="fw-semibold text-muted">Ratings</h6>
                {[5, 4, 3, 2, 1].map(r => (
                  <div key={r} className="form-check mb-1">
                    <input type="checkbox" className="form-check-input" id={`rating-${r}`} checked={selectedRatings.includes(r)} onChange={() => toggleRating(r)} />
                    <label htmlFor={`rating-${r}`} className="form-check-label">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`bi bi-star-fill ${i < r ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.8rem" }}></i>
                      ))}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-success mb-0">Products</h5>
                <small className="text-muted">Showing {filtered.length === 0 ? 0 : startIdx}-{endIdx} of {filtered.length}</small>
              </div>

              <div className="d-flex gap-2">
                <select className="form-select form-select-sm rounded-pill" value={sortOption} onChange={e => { setSortOption(e.target.value); setPage(1); }}>
                  <option value="default">Sort By</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="ratingHighLow">Rating: High to Low</option>
                  <option value="nameAZ">Name: A-Z</option>
                  <option value="nameZA">Name: Z-A</option>
                </select>

                <select className="form-select form-select-sm rounded-pill" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setPage(1); }}>
                  <option value={6}>6 per page</option>
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                </select>
              </div>
            </div>

            <div className="row">
              {paginated.length === 0 ? (
                <div className="col-12 text-center py-5 text-muted">No products found.</div>
              ) : (
                paginated.map(product => (
                  <div key={product.id} className="col-lg-4 col-md-6 col-6 mb-4">
                    <div className="card h-100 border-0 shadow-sm rounded-4 hover-shadow">
                      <div className="p-2 overflow-hidden">
                        <Link to={`/product/${product.id}`}>
                          <img src={resolveImage(product.image)} alt={product.name} className="w-100 rounded-3" style={{ height: "150px", objectFit: "contain", transition: "transform 0.25s ease" }} onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")} onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}/>
                        </Link>
                      </div>
                      <div className="card-body p-3 d-flex flex-column">
                        <h6 className="fw-semibold mb-1" style={{ fontSize: "0.95rem" }}>{product.name}</h6>
                        <div className="mb-1">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star-fill ${i < product.rating ? "text-warning" : "text-muted"}`} style={{ fontSize: "0.75rem" }}></i>
                          ))}
                        </div>
                        <p className="text-success fw-bold mb-2">Ksh {product.price.toLocaleString()}</p>

                        <div className="d-flex gap-1 align-items-center mb-2">
                          <button className="btn btn-sm btn-outline-secondary p-1" onClick={() => setQuantities(prev => ({ ...prev, [product.id]: Math.max(1, prev[product.id] - 1) }))}>-</button>
                          <input type="number" className="form-control form-control-sm text-center" style={{ width: "45px" }} value={quantities[product.id] ?? 1} onChange={e => setQuantities(prev => ({ ...prev, [product.id]: Math.max(1, Number(e.target.value) || 1) }))} />
                          <button className="btn btn-sm btn-outline-secondary p-1" onClick={() => setQuantities(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 1) + 1 }))}>+</button>

                          <Link to={`/product/${product.id}`} className="ms-auto text-success text-decoration-none small">View →</Link>
                        </div>

                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-success rounded-pill mt-auto shadow-sm" onClick={() => handleAddToCart(product)}>
                            <i className="bi bi-cart-plus me-1"></i> Add
                          </button>

                          <button
                            className={`btn btn-sm mt-auto shadow-sm rounded-pill ${wishlist.find(p => p.id === product.id) ? "btn-warning" : "btn-outline-warning"}`}
                            onClick={() => handleWishlist(product)}
                          >
                            <i className="bi bi-heart"></i> Wish
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <nav>
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}><button className="page-link rounded-pill" onClick={prevPage}>Prev</button></li>
                  {[...Array(totalPages)].map((_, i) => (
                    <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}><button className="page-link rounded-pill" onClick={() => goToPage(i + 1)}>{i + 1}</button></li>
                  ))}
                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}><button className="page-link rounded-pill" onClick={nextPage}>Next</button></li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;
