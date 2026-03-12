import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClothes } from "../services/clothService";
import Productcard from "../components/Productcard";

const spotlightCards = [
  {
    title: "Wedding Luxe",
    subtitle: "Premium sherwani and lehenga edits",
    image: "https://images.unsplash.com/photo-1610173826609-0f1c79f40a11?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Party Edit",
    subtitle: "Modern fits for evening events",
    image: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1400&auto=format&fit=crop",
  },
  {
    title: "Festive Classic",
    subtitle: "Traditional wear with modern comfort",
    image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=1400&auto=format&fit=crop",
  },
];

const valueProps = [
  { heading: "Premium Without Ownership", text: "Wear high-value styles for occasions without full-price buying." },
  { heading: "Fit + Care Confidence", text: "Measurement-first discovery with cleaning and quality checks included." },
  { heading: "Fast Rental Workflow", text: "Book online in minutes with straightforward pickup and return process." },
];

const chips = ["Wedding", "Cocktail", "Ethnic", "Formal", "Designer", "Weekend"];
const trustStats = [
  { value: "98%", label: "On-time deliveries" },
  { value: "12K+", label: "Orders fulfilled" },
  { value: "7K+", label: "Happy renters" },
  { value: "24/7", label: "Support response" },
];

function HomeLanding() {
  const [trending, setTrending] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const loadTrending = async () => {
      try {
        setLoadingTrending(true);
        const res = await getClothes({ limit: 8 });
        setTrending(res.data.items || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoadingTrending(false);
      }
    };

    loadTrending();
  }, []);

  return (
    <div className="mixhome">
      <section className="mixhome-promo">
        <span>New User Offer</span>
        <p>Get up to 20% off on your first rental booking this week.</p>
      </section>

      <section className="mixhome-hero">
        <div className="mixhome-hero-left">
          <p className="mixhome-kicker">Curated Rental Marketplace</p>
          <h1 className="title-serif">Discover, reserve, and wear premium fashion like it is your own closet.</h1>
          <p className="mixhome-sub">
            A modern rental experience combining discovery-first shopping, occasion curation, and premium service quality.
          </p>

          <div className="mixhome-hero-actions">
            <Link to="/shop" className="btn-brand">Shop Collection</Link>
            <Link to="/signup" className="btn-outline">Get Started</Link>
          </div>

          <div className="mixhome-metrics">
            <article><strong>500+</strong><span>Live Catalog</span></article>
            <article><strong>4.9/5</strong><span>User Rating</span></article>
            <article><strong>48h</strong><span>Avg Fulfillment</span></article>
          </div>
        </div>

        <div className="mixhome-hero-right">
          <img
            src="https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=1600&auto=format&fit=crop"
            alt="Premium rental fashion visual"
          />
          <div className="mixhome-float-tag">
            <span>Most Booked</span>
            <strong>Reception Collection</strong>
          </div>
        </div>
      </section>

      <section className="mixhome-chip-row">
        {chips.map((chip) => (
          <Link key={chip} to="/shop">{chip}</Link>
        ))}
      </section>

      <section className="mixhome-editorial">
        <article className="mixhome-editorial-copy">
          <p className="mixhome-kicker">Editor’s Pick</p>
          <h2 className="title-serif">The Rental Wardrobe That Adapts To Your Calendar</h2>
          <p>
            From engagement evenings to reception nights and office celebrations, build a rotation of standout outfits
            without accumulating one-time purchases.
          </p>
          <ul>
            <li>Curated outfit drops every week</li>
            <li>Fit-profile based filtering</li>
            <li>Professional cleaning and prep included</li>
          </ul>
          <Link to="/shop" className="btn-brand">View Editor Collection</Link>
        </article>

        <article className="mixhome-editorial-media">
          <img
            src="https://images.unsplash.com/photo-1464863979621-258859e62245?q=80&w=1400&auto=format&fit=crop"
            alt="Editorial fashion rental showcase"
            loading="lazy"
          />
          <div className="mixhome-editorial-badge">
            <span>Style Intel</span>
            <strong>Most saved look this month</strong>
          </div>
        </article>
      </section>

      <section className="mixhome-proof">
        {trustStats.map((item) => (
          <article key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </section>

      <section className="mixhome-spotlight">
        <div className="mixhome-section-head">
          <p>Spotlight Collections</p>
          <h2 className="title-serif">High-demand edits for real events</h2>
        </div>

        <div className="mixhome-spotlight-grid">
          {spotlightCards.map((card) => (
            <article className="mixhome-spotlight-card" key={card.title}>
              <img src={card.image} alt={card.title} loading="lazy" />
              <div className="mixhome-spotlight-overlay">
                <h3>{card.title}</h3>
                <p>{card.subtitle}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mixhome-values">
        {valueProps.map((item) => (
          <article key={item.heading} className="mixhome-value-card">
            <h3>{item.heading}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="mixhome-trending">
        <div className="mixhome-section-head">
          <p>Trending Now</p>
          <h2 className="title-serif">Rent-ready picks your city is loving</h2>
        </div>

        <div className="mixhome-trending-row">
          {loadingTrending && <p className="muted">Loading trending styles...</p>}
          {!loadingTrending && trending.length === 0 && <p className="muted">No products available right now.</p>}
          {!loadingTrending && trending.map((item) => (
            <article key={item._id} className="mixhome-trending-item">
              <Productcard item={item} refreshClothes={() => {}} />
            </article>
          ))}
        </div>
      </section>

      <section className="mixhome-cta">
        <div>
          <p className="mixhome-kicker">Ready To Elevate Your Event Style?</p>
          <h2 className="title-serif">One platform. Premium looks. Smart rental value.</h2>
          <p>Start exploring curated outfits and book your first look in minutes.</p>
        </div>
        <div className="mixhome-cta-actions">
          <Link to="/shop" className="btn-brand">Browse Rentals</Link>
          <Link to="/login" className="btn-outline">Login</Link>
        </div>
      </section>
    </div>
  );
}

export default HomeLanding;
