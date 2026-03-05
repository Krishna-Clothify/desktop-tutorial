import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../features/cartSlice";

function Productcard({ item, refreshClothes }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRent = async () => {
    navigate(`/cloth/${item._id}`);
    refreshClothes();
  };

  const getStatusInfo = () => {
    if (item.status === "available") {
      return { label: "Available", className: "status-available", canRent: true };
    }

    if (item.status === "returning_soon") {
      return { label: "Returning Soon", className: "status-returning", canRent: false };
    }

    return { label: "Rented", className: "status-rented", canRent: false };
  };

  const statusInfo = getStatusInfo();
  const cardImage = (Array.isArray(item.images) && item.images[0]) || item.image;

  return (
    <div className="product-card">
      <Link to={`/cloth/${item._id}`} className="product-media">
        <div className="product-image-wrapper">
          <img src={`http://clothify-wb4m.onrender.com/uploads/${cardImage}`} alt={item.name} loading="lazy" />
        </div>

        <span className={`product-badge ${statusInfo.className}`}>{statusInfo.label}</span>
      </Link>

      <div className="product-info">
        <h2 className="product-title">{item.name}</h2>

        <p className="product-desc">
          {item.description?.trim() || "Premium rental outfit - Perfect for occasions"}
        </p>

        <p className="product-price">₹{item.pricePerDay}/day</p>

        <button onClick={() => dispatch(addToCart(item))} className="primary-action">
          Add to Cart
        </button>

        <button onClick={handleRent} disabled={!statusInfo.canRent} className="secondary-action">
          {statusInfo.canRent ? "Rent Now" : statusInfo.label}
        </button>
      </div>
    </div>
  );
}

export default Productcard;
