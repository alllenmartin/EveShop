import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { postCategory,getCategoryBySlug } from "../../api";

const CategoryDetails = () => {
  const [catdetails, setCategory] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [postMessage, setPostMessage] = useState("");
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryBySlug(id);
        setCategory(data.category);
        setName(data.category.name); // prefill form
        setDescription(data.category.description);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category details");
      }
    };

    fetchCategory();
  }, [id]);

 
const handlePost = async (e) => {
  e.preventDefault();
  try {
    const data = await postCategory({ name, description });
    console.log("POST response:", data);
    setPostMessage("Category submitted successfully!");
  } catch (err) {
    console.error(err);
    setPostMessage("Error submitting category");
  }
};

  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;
  if (!catdetails) return <div className="container mt-5 text-center">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>;

  return (
    <div className="container mt-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ← Go Back
      </button>

      <div className="card shadow-lg border-0 rounded-3 mb-4">
        <div className="card-body">
          <h2 className="card-title text-primary mb-4">{catdetails.name}</h2>

          <ul className="list-group list-group-flush mb-3">
            <li className="list-group-item"><strong>ID:</strong> {catdetails.id}</li>
            <li className="list-group-item"><strong>Name:</strong> {catdetails.name}</li>
            <li className="list-group-item"><strong>Description:</strong> {catdetails.description}</li>
          </ul>

          <button className="btn btn-primary mb-3" onClick={() => alert("Do Something clicked!")}>
            Do Something
          </button>

          {/* POST Form */}
          <form onSubmit={handlePost}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input 
                type="text" 
                className="form-control" 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea 
                className="form-control" 
                id="description" 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required
              />
            </div>

            <button type="submit" className="btn btn-success">Submit Category</button>
          </form>

          {postMessage && <div className="mt-3 alert alert-info">{postMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;
