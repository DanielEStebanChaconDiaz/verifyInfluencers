// models/User.js
const mongoose = require("mongoose");

const influencersSchema = new mongoose.Schema({
  name: { type: String, required: true },
  twitter_handle: { type: String, required: false }, // Agregar el campo twitter_handle
});

module.exports = mongoose.model("Influencers", influencersSchema);
