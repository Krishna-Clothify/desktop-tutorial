import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClothes } from "../services/clothService";
import Productcard from "../components/Productcard";

function HomeLanding() {
  const [trending, setTrending] = useState([]);


useEffect(() => {
  const loadTrending = async () => {
    try {
      const res = await getClothes({ limit: 8 });
      setTrending(res.data.items || []);
    } catch (err) {
      console.log(err);
    }
  };

  loadTrending();
}, []);


  return (
    <div className="space-y-16">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl surface">
        <div className="grid md:grid-cols-2 items-center">

          {/* LEFT TEXT */}
          <div className="p-10 space-y-5">
            <p className="uppercase tracking-widest text-sm text-gray-500">
              Rent • Wear • Return
            </p>

            <h1 className="title-serif text-5xl leading-tight">
              Wear Designer <br /> Without Buying
            </h1>

            <p className="text-gray-600 max-w-md">
              Premium outfits for weddings, parties & events.
              Save money. Look rich. Repeat infinitely.
            </p>

            <div className="flex gap-3">
              <Link to="/shop" className="btn-brand">Browse Collection</Link>
              <Link to="/shop" className="btn-outline">How it works</Link>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div
            className="h-[380px] md:h-[480px] bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1593032465175-481ac7f401a0)"
            }}
          />
        </div>
      </section>


      {/* CATEGORY SECTION */}
      <section className="page-shell">
        <h2 className="title-serif text-3xl mb-6">Shop By Occasion</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Category name="Wedding" img="https://images.unsplash.com/photo-1610173826609-0f1c79f40a11" />
          <Category name="Party" img="https://images.unsplash.com/photo-1520975916090-3105956dac38" />
          <Category name="Traditional" img="https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03" />
          <Category name="Casual" img="https://images.unsplash.com/photo-1512436991641-6745cdb1723f" />

        </div>
      </section>


      {/* WHY RENT */}
      <section className="surface p-8 grid md:grid-cols-3 gap-6 text-center">
        <div>
          <h3 className="font-semibold text-lg mb-1">Save 90% Cost</h3>
          <p className="text-gray-600">Wear premium brands at a fraction of price</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">No Wardrobe Clutter</h3>
          <p className="text-gray-600">Return after use — no storage needed</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-1">Always New Looks</h3>
          <p className="text-gray-600">Never repeat outfits again</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="title-serif text-2xl md:text-3xl">Trending Rentals</h2>

        <div className="overflow-x-auto">
            <div className="flex gap-4 w-max px-1 pb-3">

            {trending.map(item => (
                <div
                key={item._id}
                className="w-[75vw] sm:w-[45vw] md:w-[280px] lg:w-[300px] flex-shrink-0"
                >
                <Productcard item={item} refreshClothes={() => {}} />
                </div>
            ))}

            </div>
        </div>
      </section>



    </div>
  );

}

/* CATEGORY CARD COMPONENT */
function Category({ name, img }) {
  return (
    <Link to="/shop" className="group relative rounded-xl overflow-hidden cursor-pointer">
      <div
        className="h-40 bg-cover bg-center group-hover:scale-110 transition duration-300"
        style={{ backgroundImage: `url(${img})` }}
      />
      <div className="absolute inset-0 bg-black/25 flex items-end p-3">
        <p className="text-white font-semibold text-lg">{name}</p>
      </div>
    </Link>
  );
}

export default HomeLanding;
