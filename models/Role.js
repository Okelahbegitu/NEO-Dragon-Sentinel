const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    roleId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

roleSchema.index({ guildId: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model("Role", roleSchema);
