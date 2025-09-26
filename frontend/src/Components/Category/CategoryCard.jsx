
import { Link } from "react-router-dom";

const CategoryCard = ({ category }) => {
  if (!category) {
    return null;
  }
  return (
    <div key={category.id} className="cocktail-card">
      {/* <img src={category.image.url} alt="" className="cocktail-img" /> */}
      <div className="cocktail-info">
        <div className="content-text">
          <h2 className="cocktail-name">{category.name}</h2>
          <span className="info">{category.description}</span>
        </div>
        <Link to={`/categories/${category.id}`}>
          <div className="btn">View Details</div>
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;