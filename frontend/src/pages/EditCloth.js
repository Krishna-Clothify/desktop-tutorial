import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { fitProfiles } from "../config/fitProfiles";
import { resolveMediaUrl } from "../utils/media";

const ALLOWED_FITS = new Set(["upper", "lower", "full", "footwear", "free"]);

function EditCloth() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    detailedDescription: "",
    brand: "",
    color: "",
    fabric: "",
    occasion: "",
    careInstructions: "",
    highlights: "",
    pricePerDay: "",
  });
  const [type, setType] = useState("");
  const [fitProfile, setFitProfile] = useState("");
  const [currentSize, setCurrentSize] = useState({});
  const [image, setImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImage, setCurrentImage] = useState("");
  const [currentGallery, setCurrentGallery] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imagePreview = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return "";
  }, [image]);
  const galleryPreviews = useMemo(
    () => galleryImages.map((file) => URL.createObjectURL(file)),
    [galleryImages]
  );

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      galleryPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreview, galleryPreviews]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/clothes/${id}`);
        const cloth = res.data;
        setForm({
          name: cloth.name || "",
          description: cloth.description || "",
          detailedDescription: cloth.detailedDescription || "",
          brand: cloth.brand || "",
          color: cloth.color || "",
          fabric: cloth.fabric || "",
          occasion: cloth.occasion || "",
          careInstructions: cloth.careInstructions || "",
          highlights: Array.isArray(cloth.highlights) ? cloth.highlights.join("\n") : "",
          pricePerDay: cloth.pricePerDay || "",
        });
        setType(cloth.type || "Outfit");
        setFitProfile(ALLOWED_FITS.has(cloth.fitProfile) ? cloth.fitProfile : "free");
        setCurrentSize(cloth.availableSizes?.[0]?.measurements || {});
        setCurrentImage(cloth.image || "");
        setCurrentGallery(
          Array.isArray(cloth.images) && cloth.images.length
            ? cloth.images
            : cloth.image
              ? [cloth.image]
              : []
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const moveImage = (index, direction) => {
    setCurrentGallery((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
      return copy;
    });
  };

  const onDragStart = (index) => setDragIndex(index);
  const onDropAt = (dropIndex) => {
    setCurrentGallery((prev) => {
      if (dragIndex === null || dragIndex === dropIndex) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(dragIndex, 1);
      copy.splice(dropIndex, 0, moved);
      return copy;
    });
    setDragIndex(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const formattedSizes = Object.keys(currentSize).length
      ? [
          {
            measurements: Object.fromEntries(
              Object.entries(currentSize)
                .filter(([, v]) => v !== "" && v !== null)
                .map(([k, v]) => [k, Number(v)])
            ),
          },
        ]
      : [];

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("detailedDescription", form.detailedDescription.trim());
    formData.append("brand", form.brand.trim());
    formData.append("color", form.color.trim());
    formData.append("fabric", form.fabric.trim());
    formData.append("occasion", form.occasion.trim());
    formData.append("careInstructions", form.careInstructions.trim());
    formData.append("highlights", form.highlights.trim());
    formData.append("pricePerDay", form.pricePerDay);
    formData.append("type", type.trim());
    formData.append("fitProfile", fitProfile);
    formData.append("availableSizes", JSON.stringify(formattedSizes));
    formData.append("imageOrder", JSON.stringify(currentGallery));
    if (image) formData.append("image", image);
    galleryImages.forEach((file) => formData.append("images", file));

    try {
      await api.put(`/clothes/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Product updated successfully.");
      setTimeout(() => navigate(`/cloth/${id}`), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div className="adminx-page">
      <div className="adminx-panel surface">
        <div className="adminx-head">
          <h2 className="title-serif text-3xl">Edit Product</h2>
          <p>Only products created by you can be edited.</p>
        </div>

        {message && <p className="msg-success">{message}</p>}
        {error && <p className="msg-error">{error}</p>}

        <form onSubmit={handleSave} className="adminx-form">
          <div className="form-field">
            <label className="field-label">Product Name</label>
            <input className="field-input" name="name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="adminx-form-row">
            <div className="form-field">
              <label className="field-label">Category Type</label>
              <input className="field-input" value={type} onChange={(e) => setType(e.target.value)} required />
            </div>
            <div className="form-field">
              <label className="field-label">Price per Day</label>
              <input
                className="field-input"
                name="pricePerDay"
                type="number"
                min="1"
                value={form.pricePerDay}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="adminx-form-row">
            <div className="form-field">
              <label className="field-label">Brand</label>
              <input className="field-input" name="brand" value={form.brand} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="field-label">Color</label>
              <input className="field-input" name="color" value={form.color} onChange={handleChange} />
            </div>
          </div>

          <div className="adminx-form-row">
            <div className="form-field">
              <label className="field-label">Fabric</label>
              <input className="field-input" name="fabric" value={form.fabric} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label className="field-label">Best Occasion</label>
              <input className="field-input" name="occasion" value={form.occasion} onChange={handleChange} />
            </div>
          </div>

          <div className="form-field">
            <label className="field-label">Short Description</label>
            <textarea className="field-input" name="description" rows="3" value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-field">
            <label className="field-label">Detailed Description</label>
            <textarea className="field-input" name="detailedDescription" rows="7" value={form.detailedDescription} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label className="field-label">Highlights (one per line)</label>
            <textarea className="field-input" name="highlights" rows="4" value={form.highlights} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label className="field-label">Care Instructions</label>
            <textarea className="field-input" name="careInstructions" rows="3" value={form.careInstructions} onChange={handleChange} />
          </div>

          <div className="form-field">
            <label className="field-label">Fit Profile</label>
            <select
              className="field-input"
              value={fitProfile}
              onChange={(e) => {
                setFitProfile(e.target.value);
                setCurrentSize({});
              }}
              required
            >
              <option value="">Select Fit Profile</option>
              <option value="upper">Upper Body</option>
              <option value="lower">Lower Body</option>
              <option value="full">Full Body</option>
              <option value="footwear">Footwear</option>
              <option value="free">Free Size</option>
            </select>
          </div>

          {fitProfile && fitProfiles[fitProfile]?.length > 0 && (
            <div className="form-field">
              <label className="field-label">Measurements (cm)</label>
              <div className="adminx-size-grid">
                {fitProfiles[fitProfile].map((field) => (
                  <input
                    key={field}
                    className="field-input"
                    type="number"
                    min="1"
                    placeholder={field}
                    value={currentSize[field] || ""}
                    onChange={(e) =>
                      setCurrentSize((prev) => ({
                        ...prev,
                        [field]: e.target.value,
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          <div className="form-field">
            <label className="field-label">Replace Primary Product Image (optional)</label>
            <input
              className="field-input"
              type="file"
              name="image"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <div className="form-field">
            <label className="field-label">Add More Gallery Images (optional)</label>
            <input
              className="field-input"
              type="file"
              name="images"
              accept="image/*"
              multiple
              onChange={(e) => setGalleryImages(Array.from(e.target.files || []))}
            />
          </div>

          {(imagePreview || currentImage) && (
            <div className="adminx-preview">
              <img src={imagePreview || resolveMediaUrl(currentImage)} alt="Preview" />
            </div>
          )}
          {(currentGallery.length > 0 || galleryPreviews.length > 0) && (
            <div className="adminx-gallery-preview">
              {currentGallery.map((src, idx) => (
                <div
                  key={`current-${src}-${idx}`}
                  className="adminx-gallery-item"
                  draggable
                  onDragStart={() => onDragStart(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropAt(idx)}
                >
                  <img src={resolveMediaUrl(src)} alt={`Current ${idx + 1}`} />
                  <div className="adminx-gallery-actions">
                    <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0}>
                      Left
                    </button>
                    <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === currentGallery.length - 1}>
                      Right
                    </button>
                  </div>
                </div>
              ))}
              {galleryPreviews.map((src, idx) => (
                <div key={`new-${src}`} className="adminx-gallery-item">
                  <img src={src} alt={`New ${idx + 1}`} />
                  <div className="adminx-gallery-actions">
                    <button type="button" disabled>New</button>
                    <button type="button" disabled>Save to move</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button disabled={saving} className="btn-brand">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditCloth;
