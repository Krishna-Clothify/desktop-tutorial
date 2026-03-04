const router = require("express").Router();
const {
  createRental,
  checkoutCart,
  myRentals,
  returnCloth,
  getBookedDates,
  getAllRentals
} = require("../controllers/rentalController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// Create single rental (date-based)
router.post("/", auth, createRental);

// Checkout cart
router.post("/checkout", auth, checkoutCart);

// Get my rentals
router.get("/my", auth, myRentals);

// Return item
router.put("/return/:id", auth, returnCloth);

router.get("/admin/all", auth, admin, getAllRentals);

router.get("/booked/:clothesId", auth, getBookedDates);

// Clear returned history
router.delete("/clear-history", auth, async (req, res) => {
  try {
    const Rental = require("../models/Rental");

    await Rental.deleteMany({
      status: "returned",
      userId: req.user._id
    });

    res.json({ message: "History cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
