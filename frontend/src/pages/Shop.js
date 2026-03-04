import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Productcard from "../components/Productcard";
import { getClothes } from "../services/clothService";

function Home() {
  const sizeOptions = ["chest", "waist", "shoulder", "hips", "length"];
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get("q") || "";
  const initialMaxPrice = searchParams.get("maxPrice") || "";
  const initialSize = searchParams.get("size") || "";
  const initialSort = searchParams.get("sort") || "newest";
  const initialAvailable = searchParams.get("available") === "true";
  const initialPage = Math.max(1, Number(searchParams.get("page")) || 1);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice);
  const [size, setSize] = useState(initialSize);
  const [sort, setSort] = useState(initialSort);
  const [onlyAvailable, setOnlyAvailable] = useState(initialAvailable);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const didMountRef = useRef(false);

const fetchClothes = useCallback(async (filters) => {
  setLoading(true);
  setError("");

  try {
    const res = await getClothes(filters);
    const responseData = res.data;

    if (Array.isArray(responseData)) {
      setItems(responseData);
      setTotalPages(1);
      setTotalItems(responseData.length);
    } else {
      setItems(responseData.items || []);
      setTotalPages(responseData.pagination?.totalPages || 1);
      setTotalItems(responseData.pagination?.total || 0);
    }
  } catch (err) {
    console.log(err);
    setError("Failed to load clothes. Please try again.");
  } finally {
    setLoading(false);
  }
}, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);
  

  useEffect(() => {
    const params = {};

    if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
    if (maxPrice) params.maxPrice = maxPrice;
    if (size) params.size = size;
    if (sort && sort !== "newest") params.sort = sort;
    if (onlyAvailable) params.available = "true";
    if (page > 1) params.page = String(page);

    const filters = {
      q: debouncedSearch.trim(),
      maxPrice,
      size,
      sort,
      available: onlyAvailable,
      page,
      limit: 9,
    };

    setSearchParams(params, { replace: true });
    fetchClothes(filters);
  }, [debouncedSearch, maxPrice, size, sort, onlyAvailable, page, setSearchParams, fetchClothes]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    setPage(1);
  }, [debouncedSearch, maxPrice, size, sort, onlyAvailable]);

const refreshClothes = useCallback(() => {
  fetchClothes({
    q: debouncedSearch.trim(),
    maxPrice,
    size,
    sort,
    available: onlyAvailable,
    page,
    limit: 9,
  });
}, [fetchClothes, debouncedSearch, maxPrice, size, sort, onlyAvailable, page]);


  useEffect(() => {
  const handleFocus = () => {
    refreshClothes();
  };

  window.addEventListener("focus", handleFocus);
  return () => window.removeEventListener("focus", handleFocus);
}, [refreshClothes]);

  const clearFilters = () => {
    setSearch("");
    setMaxPrice("");
    setSize("");
    setSort("newest");
    setOnlyAvailable(false);
    setPage(1);
  };

return (
  <div className="space-y-6">
  <div className="products-grid"></div>

    {/* HERO */}
    <div className="hero">
      <div className="hero-inner">
        <p className="hero-eyebrow">Everyday Rental Edit</p>
        <h1 className="hero-title">Clothify Rentals</h1>
        <p className="hero-subtext">
          Browse premium outfits, filter by fit and budget, and place your order in minutes.
        </p>
      </div>
    </div>

    {/* MAIN */}
    <div className="home-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="title-serif text-2xl mb-4">Filters</h2>

        <label className="filter-label">Search</label>
        <input type="text" value={search} onChange={(e)=>setSearch(e.target.value)} className="filter-input"/>

        <label className="filter-label">Max Price / Day</label>
        <input type="number" min="0" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} className="filter-input"/>

        <label className="filter-label">Size Measurement</label>
        <select value={size} onChange={(e)=>setSize(e.target.value)} className="filter-select">
          <option value="">Any</option>
          {sizeOptions.map(option => <option key={option} value={option}>{option}</option>)}
        </select>

        <label className="filter-label">Sort</label>
        <select value={sort} onChange={(e)=>setSort(e.target.value)} className="filter-select">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>

        <label className="filter-checkbox">
          <input type="checkbox" checked={onlyAvailable} onChange={(e)=>setOnlyAvailable(e.target.checked)} />
          In stock only
        </label>

        <button onClick={clearFilters} disabled={loading} className="btn-brand w-full">
          {loading ? "Loading..." : "Clear Filters"}
        </button>
      </aside>

      {/* PRODUCTS */}
      <section className="products-section">
        <div className="results-bar">
          {loading ? "Loading products..." : `${totalItems} product(s) found`}
        </div>

        <div className="product-grid">
          {error && <p className="msg-error">{error}</p>}
          {!error && !loading && items.length === 0 && <p className="msg-empty">No clothes found for these filters.</p>}
          {!error && items.map(item => <Productcard key={item._id} item={item} refreshClothes={refreshClothes} />)}
        </div>

        {!error && totalPages > 1 && (
          <div className="pagination">
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={loading||page===1} className="page-btn">Prev</button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={loading||page===totalPages} className="page-btn">Next</button>
          </div>
        )}
      </section>

    </div>
  </div>
);
}

export default Home;
