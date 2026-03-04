import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import HomeLanding from "./pages/HomeLanding";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MyRentals from "./pages/MyRentals";
import Admin from "./pages/Admin";

import ClothDetails from "./pages/ClothDetails";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import ProductDetails from "./pages/ProductDetails";



function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomeLanding />} />
          <Route path="/shop" element={<Shop />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetails />} />

          <Route path="/cloth/:id" element={<ClothDetails />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/my-rentals" element={<PrivateRoute><MyRentals /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
