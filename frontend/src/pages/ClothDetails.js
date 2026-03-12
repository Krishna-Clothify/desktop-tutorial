import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../services/api";
import { rentCloth } from "../services/rentalService";
import { addToCart } from "../features/cartSlice";
import { resolveMediaUrl, resolvePrimaryImage } from "../utils/media";

const fitHighlights = {
  upper: ["Tailored upper silhouette", "Shoulder and chest fit optimized", "Best for formal layering"],
  lower: ["Waist and hips focus", "Comfort fit for movement", "Ideal with shirts or kurtas"],
  full: ["Head-to-toe coordinated fit", "Balanced cut across body", "Event-ready statement look"],
  footwear: ["Size-first fit profile", "Comfort for long wear", "Pairs with ethnic and western"],
  free: ["Flexible fit profile", "Easy to style for occasions", "No strict measurement dependency"],
};

function ClothDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [cloth, setCloth] = useState(null);
  const [bookedDates, setBookedDates] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [reviews, setReviews] = useState([
    {
      id: "r1",
      name: "Anita S",
      rating: 5,
      comment: "Fabric quality was excellent and fit was exactly as shown.",
      when: "2 days ago",
    },
    {
      id: "r2",
      name: "Rahul K",
      rating: 4,
      comment: "Smooth delivery and pickup. Styling support was helpful.",
      when: "1 week ago",
    },
  ]);
  const [reviewForm, setReviewForm] = useState({
    name: "",
    rating: 5,
    comment: "",
  });

  const getCurrentUser = () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return { id: payload.id, role: payload.role };
    } catch {
      return null;
    }
  };
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      try {
        const [clothRes, bookedRes, allRes] = await Promise.all([
          api.get(`/clothes/${id}`),
          api.get(`/rentals/booked/${id}`).catch(() => ({ data: [] })),
          api.get("/clothes", { params: { limit: 12 } }).catch(() => ({ data: { items: [] } })),
        ]);

        const allItems = Array.isArray(allRes.data) ? allRes.data : allRes.data.items || [];

        const clothData = clothRes.data;
        const gallery =
          Array.isArray(clothData.images) && clothData.images.length
            ? clothData.images
            : clothData.image
              ? [clothData.image]
              : [];

        setCloth(clothData);
        setSelectedImage(gallery[0] || "");
        setBookedDates(bookedRes.data || []);
        setRelatedItems(allItems.filter((item) => item._id !== id).slice(0, 4));
      } catch {
        alert("Product not found");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id, navigate]);

  const isAvailable = cloth?.status === "available";
  const totalDays = !startDate || !endDate
    ? 0
    : Math.max(0, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
  const totalPrice = cloth ? totalDays * cloth.pricePerDay : 0;

  const blockedIntervals = useMemo(
    () =>
      bookedDates.map((slot) => ({
        start: new Date(slot.startDate),
        end: new Date(slot.endDate),
      })),
    [bookedDates]
  );

  const statusMeta = {
    available: {
      label: "Available",
      text: "Ready for immediate booking",
      cls: "pdp-status-available",
    },
    returning_soon: {
      label: "Returning Soon",
      text: "Expected to be available shortly",
      cls: "pdp-status-returning",
    },
    rented: {
      label: "Rented",
      text: "Currently in an active rental cycle",
      cls: "pdp-status-rented",
    },
  }[cloth?.status || "rented"];

  const reviewScore = useMemo(() => {
    if (!reviews.length) return "0.0";
    const sum = reviews.reduce((acc, item) => acc + item.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);
  const reviewCount = reviews.length;
  const originalPrice = cloth ? Math.round(cloth.pricePerDay * 1.8) : 0;
  const savePercent = cloth ? Math.round(((originalPrice - cloth.pricePerDay) / originalPrice) * 100) : 0;

  const normalizedType = cloth?.type
    ? cloth.type.charAt(0).toUpperCase() + cloth.type.slice(1)
    : "Outfit";
  const normalizedProfile = cloth?.fitProfile
    ? cloth.fitProfile.charAt(0).toUpperCase() + cloth.fitProfile.slice(1)
    : "Standard";

  const measurements = cloth?.availableSizes?.[0]?.measurements || {};
  const highlights =
    Array.isArray(cloth?.highlights) && cloth.highlights.length > 0
      ? cloth.highlights
      : fitHighlights[cloth?.fitProfile] || fitHighlights.free;
  const hasMeasurements = Object.keys(measurements).length > 0;
  const estDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString();
  }, []);

  const handleRent = async () => {
    setBookingError("");
    if (!startDate || !endDate) {
      setBookingError("Please select both start and end dates.");
      return;
    }
    if (endDate <= startDate) {
      setBookingError("End date must be after start date.");
      return;
    }

    setSubmitting(true);
    try {
      await rentCloth(cloth._id, startDate.toISOString(), endDate.toISOString());
      alert("Rental successful");
      navigate("/my-rentals");
    } catch (err) {
      setBookingError(err.response?.data?.message || "Rent failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDuration = (days) => {
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() + 1);
    }
    const end = new Date(start);
    end.setDate(end.getDate() + days);
    setStartDate(start);
    setEndDate(end);
    setBookingError("");
  };

  const handleAddToCart = () => {
    dispatch(addToCart(cloth));
    setCartMessage("Added to cart");
    setTimeout(() => setCartMessage(""), 1600);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/clothes/${id}`);
      alert("Deleted");
      navigate("/shop");
    } catch (err) {
      alert(err.response?.data?.message || "Not allowed");
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;

    setReviews((prev) => [
      {
        id: `r-${Date.now()}`,
        name: reviewForm.name.trim(),
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
        when: "Just now",
      },
      ...prev,
    ]);

    setReviewForm({ name: "", rating: 5, comment: "" });
  };

  if (loading) return <div className="page-loader">Loading...</div>;
  if (!cloth) return null;
  const ownerId = String(cloth.createdBy?._id || cloth.createdBy || "");
  const canManageProduct =
    currentUser?.role === "admin" && (!ownerId || String(currentUser.id) === ownerId);
  const galleryImages = Array.from(
    new Set(
      [
        ...(Array.isArray(cloth.images) ? cloth.images : []),
        cloth.image || "",
      ].filter(Boolean)
    )
  );
  const activeImage = selectedImage || galleryImages[0] || cloth.image;
  const activeIndex = Math.max(0, galleryImages.findIndex((img) => img === activeImage));
  const canSlide = galleryImages.length > 1;
  const goToPrevImage = () => {
    if (!canSlide) return;
    const nextIndex = (activeIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  };
  const goToNextImage = () => {
    if (!canSlide) return;
    const nextIndex = (activeIndex + 1) % galleryImages.length;
    setSelectedImage(galleryImages[nextIndex]);
  };

  return (
    <div className="pdp-page pdp-amz-page pdp-polish pdp-vibe-next">
      <section className="pdp-amz-main">
        <div className="pdp-amz-gallery surface">
          <div className="pdp-amz-gallery-shell">
            <div className="pdp-amz-thumb-rail">
              {galleryImages.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  className={`pdp-amz-thumb ${activeImage === img ? "active" : ""}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={resolveMediaUrl(img)} alt={`${cloth.name} ${idx + 1}`} />
                </button>
              ))}
            </div>
            <div className="pdp-amz-media">
              <img src={resolveMediaUrl(activeImage)} alt={cloth.name} />
              {canSlide && (
                <>
                  <button type="button" className="pdp-gallery-nav pdp-gallery-prev" onClick={goToPrevImage}>
                    ‹
                  </button>
                  <button type="button" className="pdp-gallery-nav pdp-gallery-next" onClick={goToNextImage}>
                    ›
                  </button>
                </>
              )}
              <div className="pdp-vibe-floating">
                <strong>{normalizedType}</strong>
                <span>{normalizedProfile} Fit</span>
              </div>
              <div className="pdp-gallery-counter">
                {activeIndex + 1}/{galleryImages.length}
              </div>
            </div>
          </div>
        </div>

        <div className="pdp-amz-center">
          <div className="pdp-head surface">
            <div className="pdp-breadcrumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to="/shop">Shop</Link>
              <span>/</span>
              <span>{normalizedType}</span>
            </div>

            <p className="pdp-overline">Signature Rental Edit</p>
            <h1 className="pdp-title">{cloth.name}</h1>

            <div className="pdp-rating">
              <span className="pdp-stars">*****</span>
              <strong>{reviewScore}</strong>
              <span>({reviewCount} ratings)</span>
            </div>

            <div className="pdp-vibe-divider" />

            <div className="pdp-price-row">
              <p className="pdp-price">Rs {cloth.pricePerDay}</p>
              <p className="pdp-price-sub">/day</p>
              <p className="pdp-strike">Rs {originalPrice}</p>
              <span className="pdp-save">Save {savePercent}% vs buying</span>
            </div>

            <div className={`pdp-status ${statusMeta.cls}`}>
              <span>{statusMeta.label}</span>
              <small>{statusMeta.text}</small>
            </div>

            <div className="pdp-polish-tags">
              {cloth.brand && <span>{cloth.brand}</span>}
              {cloth.fabric && <span>{cloth.fabric}</span>}
              {cloth.occasion && <span>{cloth.occasion}</span>}
              <span>Verified Cleaned</span>
            </div>

            <div className="pdp-amz-delivery">
              <p>
                Delivery by <strong>{estDeliveryDate}</strong> | Free pickup on return
              </p>
            </div>
          </div>

          <div className="pdp-card surface">
            <h3 className="pdp-card-title">About this item</h3>
            <p className="pdp-amz-desc">
              {cloth.description?.trim() || "No description available for this outfit yet."}
            </p>
            {cloth.detailedDescription?.trim() && (
              <p className="pdp-amz-desc">{cloth.detailedDescription.trim()}</p>
            )}
            <ul className="pdp-list">
              {highlights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>

          <div className="pdp-card surface">
            <h3 className="pdp-card-title">Product specs</h3>
            <div className="pdp-amz-spec-grid">
              <div>
                <span>Category</span>
                <strong>{normalizedType}</strong>
              </div>
              {cloth.brand && (
                <div>
                  <span>Brand</span>
                  <strong>{cloth.brand}</strong>
                </div>
              )}
              {cloth.color && (
                <div>
                  <span>Color</span>
                  <strong>{cloth.color}</strong>
                </div>
              )}
              {cloth.fabric && (
                <div>
                  <span>Fabric</span>
                  <strong>{cloth.fabric}</strong>
                </div>
              )}
              {cloth.occasion && (
                <div>
                  <span>Occasion</span>
                  <strong>{cloth.occasion}</strong>
                </div>
              )}
              <div>
                <span>Fit Profile</span>
                <strong>{normalizedProfile}</strong>
              </div>
              <div>
                <span>Availability</span>
                <strong>{statusMeta.label}</strong>
              </div>
              <div>
                <span>Booked Slots</span>
                <strong>{bookedDates.length}</strong>
              </div>
            </div>
            {cloth.careInstructions?.trim() && (
              <p className="pdp-amz-desc mt-3">
                <strong>Care:</strong> {cloth.careInstructions.trim()}
              </p>
            )}
          </div>

          <div className="pdp-card surface">
            <h3 className="pdp-card-title">Fit and Measurements</h3>
            {!hasMeasurements ? (
              <p className="muted">Measurement data not available.</p>
            ) : (
              <div className="pdp-measure-grid">
                {Object.entries(measurements).map(([key, value]) => (
                  <div key={key} className="pdp-measure-item">
                    <span>{key}</span>
                    <strong>{value} cm</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="pdp-booking surface">
          <h3>Rent this outfit</h3>
          <p className="pdp-vibe-secure">Trusted quality check | Secure rental workflow</p>
          <p className="pdp-book-note">Blocked dates are already reserved and cannot be selected.</p>

          <div className="pdp-quick-days">
            <button type="button" onClick={() => handleQuickDuration(2)}>2 Days</button>
            <button type="button" onClick={() => handleQuickDuration(4)}>4 Days</button>
            <button type="button" onClick={() => handleQuickDuration(7)}>7 Days</button>
          </div>

          <div className="pdp-date-grid">
            <div>
              <label className="field-label">Start Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  if (endDate && date > endDate) setEndDate(null);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                minDate={new Date()}
                excludeDateIntervals={blockedIntervals}
                className="date-input"
                placeholderText="Select start date"
                disabled={!isAvailable || submitting}
              />
            </div>

            <div>
              <label className="field-label">End Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || new Date()}
                excludeDateIntervals={blockedIntervals}
                className="date-input"
                placeholderText="Select end date"
                disabled={!isAvailable || submitting}
              />
            </div>
          </div>

          <div className="pdp-summary">
            <div>
              <span>Total Days</span>
              <strong>{totalDays}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>Rs {totalPrice}</strong>
            </div>
            <div>
              <span>Delivery + Care</span>
              <strong>Included</strong>
            </div>
          </div>

          <div className="pdp-selected-range">
            <span>Selected</span>
            <strong>
              {startDate ? startDate.toLocaleDateString() : "--"} to {endDate ? endDate.toLocaleDateString() : "--"}
            </strong>
          </div>

          <button className="rent-main-btn" disabled={!isAvailable || submitting} onClick={handleRent}>
            {submitting ? "Placing Rental..." : isAvailable ? "Rent Now" : "Currently Unavailable"}
          </button>
          {bookingError && <p className="pdp-booking-error">{bookingError}</p>}

          <button className="btn-outline w-full mt-2" onClick={handleAddToCart}>
            Add to Cart
          </button>
          {cartMessage && <p className="pdp-cart-msg">{cartMessage}</p>}

          <div className="pdp-policy">
            <h4>Rental Policy</h4>
            <p>Free cancellation up to 24 hours before delivery.</p>
            <p>Late return charges apply after grace period.</p>
            <p>Professional cleaning is included in rental fee.</p>
          </div>

          {canManageProduct && (
            <div className="pdp-admin-row pdp-admin-actions">
              <Link className="btn-outline pdp-admin-btn pdp-admin-btn-link" to={`/admin/cloth/${id}/edit`}>
                Edit Product
              </Link>
              <button className="delete-product-btn pdp-admin-btn" onClick={handleDelete}>
                Delete Product
              </button>
              <div className="pdp-admin-note">Owner admin action: only your own product can be changed.</div>
            </div>
          )}
        </aside>
      </section>

      <div className="pdp-trust surface">
        <div>
          <h4>Delivery and Pickup</h4>
          <p>Flexible delivery slots with doorstep pickup at return time.</p>
        </div>
        <div>
          <h4>Care Included</h4>
          <p>Every item is cleaned and quality checked before shipping.</p>
        </div>
        <div>
          <h4>Styling Help</h4>
          <p>Our team can help with fit and pairing before you checkout.</p>
        </div>
      </div>

      <section className="pdp-card surface">
        <h3 className="pdp-card-title">Current Bookings</h3>
        {bookedDates.length === 0 ? (
          <p className="muted">No active bookings for this item.</p>
        ) : (
          <div className="pdp-booked-list">
            {bookedDates.map((slot, index) => (
              <div key={`${slot.startDate}-${index}`} className="pdp-booked-row">
                <span>{new Date(slot.startDate).toLocaleDateString()}</span>
                <span>to</span>
                <span>{new Date(slot.endDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="pdp-reviews surface">
        <div className="pdp-reviews-head">
          <h3>Customer Feedback</h3>
          <p>{reviewScore} average rating from {reviewCount} customers</p>
        </div>

        <div className="pdp-reviews-grid">
          <div className="pdp-review-list">
            {reviews.map((review) => (
              <article key={review.id} className="pdp-review-card">
                <div className="pdp-review-top">
                  <strong>{review.name}</strong>
                  <span>{"*".repeat(review.rating)}</span>
                </div>
                <p>{review.comment}</p>
                <small>{review.when}</small>
              </article>
            ))}
          </div>

          <form className="pdp-review-form" onSubmit={handleSubmitReview}>
            <h4>Write a review</h4>

            <input
              className="field-input"
              placeholder="Your name"
              value={reviewForm.name}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />

            <select
              className="field-input"
              value={reviewForm.rating}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Average</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Bad</option>
            </select>

            <textarea
              className="field-input"
              rows={4}
              placeholder="Share your fit, quality and delivery experience"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
              required
            />

            <button className="btn-brand" type="submit">Submit Feedback</button>
          </form>
        </div>
      </section>

      <section className="pdp-related surface">
        <div className="pdp-related-head">
          <h3>You may also like</h3>
          <Link to="/shop">View all</Link>
        </div>
        <div className="pdp-related-grid">
          {relatedItems.map((item) => (
            <Link key={item._id} to={`/cloth/${item._id}`} className="pdp-mini-card">
              <img src={resolveMediaUrl(resolvePrimaryImage(item))} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <strong>Rs {item.pricePerDay}/day</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ClothDetails;
