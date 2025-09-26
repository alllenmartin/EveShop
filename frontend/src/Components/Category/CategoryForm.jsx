import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllCategories } from "../../api";
import CategoryCard from "./CategoryCard";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
       console.log("API returned:", data, "Type:", typeof data);
        setCategories(data || []); // fallback in case categories is missing
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="container">
      <button className="btn" onClick={() => navigate(-1)}>
        Go Back
      </button>
      <div className="title">
        <h1>Categories</h1>
      </div>

      {error && <p className="error">{error}</p>}

     

    <div className="cocktails-container">
    {/* Debug log */}
     {console.log("Rendering categories:", categories)}

     {/* If categories is empty, show a message */}
      {categories.length === 0 ? (
        <p>No categories found</p>
      ) : (
        categories.map((category) => (
          <CategoryCard key={category.id || category.id} category={category} />
        ))
      )}
     </div>

    </div>
  );
};

export default Categories;
