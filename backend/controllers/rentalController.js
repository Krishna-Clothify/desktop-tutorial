const Rental = require("../models/Rental");
const Clothes = require("../models/Clothes");

const createOrderId = () =>
  `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

exports.createRental = async (req, res) => {
  try {
    const { clothesId, startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || !endDate || isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Invalid date input" });
    }

    if (start >= end) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    const conflict = await Rental.findOne({
      clothesId,
      status: { $ne: "returned" },
      $or: [{ startDate: { $lte: end }, endDate: { $gte: start } }],
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: "This item is already booked for selected dates" });
    }

    const cloth = await Clothes.findById(clothesId);
    if (!cloth) {
      return res.status(404).json({ message: "Cloth not found" });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const rentalDays = Math.max(1, Math.ceil((end - start) / msPerDay));

    const rental = await Rental.create({
      clothesId,
      userId: req.user._id,
      rentalDays,
      totalPrice: rentalDays * cloth.pricePerDay,
      startDate: start,
      endDate: end,
      status: "active",
    });

    res.status(201).json(rental);
  } catch (err) {
    console.error("RENTAL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkoutCart = async (req, res) => {
  try {
    const cartItems = Array.isArray(req.body?.items) ? req.body.items : [];

    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const requestedClothIds = cartItems.map((item) => item.clothesId);
    const uniqueClothIds = [...new Set(requestedClothIds)];

    const clothes = await Clothes.find({ _id: { $in: uniqueClothIds } });
    const clothMap = new Map(clothes.map((c) => [String(c._id), c]));

    if (clothes.length !== uniqueClothIds.length) {
      return res.status(400).json({ message: "One or more items are invalid" });
    }

    const activeRentals = await Rental.find({
      clothesId: { $in: uniqueClothIds },
      status: { $ne: "returned" },
    }).select("clothesId");

    if (activeRentals.length > 0) {
      return res.status(400).json({ message: "One or more items are already rented" });
    }

    const orderId = createOrderId();
    const startDate = new Date();

    const rentalPayload = cartItems.map((item) => {
      const cloth = clothMap.get(String(item.clothesId));
      const days = Math.max(1, Number(item.rentalDays) || 1);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);

      return {
        orderId,
        userId: req.user._id,
        clothesId: cloth._id,
        rentalDays: days,
        totalPrice: cloth.pricePerDay * days,
        startDate,
        endDate,
      };
    });

    const rentals = await Rental.insertMany(rentalPayload);

    await Clothes.updateMany(
      { _id: { $in: uniqueClothIds } },
      { $set: { available: false } }
    );

    res.status(201).json({ rentals, orderId });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.myRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      userId: req.user._id
    }).populate("clothesId");

    res.json(rentals);
  } catch (err) {
    console.error("MY RENTALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.returnCloth = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    rental.status = "returned";
    await rental.save();

    await Clothes.findByIdAndUpdate(rental.clothesId, { available: true });

    res.json({ message: "Returned successfully" });
  } catch (err) {
    console.error("RETURN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBookedDates = async (req, res) => {
  try {
    const rentals = await Rental.find({
      clothesId: req.params.clothesId,
      status: { $ne: "returned" },
    }).select("startDate endDate");

    res.json(rentals);
  } catch (err) {
    console.error("BOOKED DATES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("clothesId")
      .populate("userId", "name email");

    res.json(rentals);
  } catch (err) {
    console.error("ADMIN RENTALS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
