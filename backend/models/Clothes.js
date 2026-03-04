const mongoose = require('mongoose');
const clothSchema = new mongoose.Schema({
  name: String,
  pricePerDay: Number,
  image: String,
  available: {
    type: Boolean,
    default: true
  },

  type: {
    type: String,
    required: true
  },

  fitProfile: {
    type: String,
    required: true,
    enum: ["upper", "lower", "full", "footwear", "free"]
  },

  availableSizes: [
    {
      measurements: Object
    }
  ]
});

module.exports = mongoose.model("Clothes", clothSchema);
