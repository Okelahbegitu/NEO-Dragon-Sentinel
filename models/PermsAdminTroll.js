const mongoose = require("mongoose");

const permsAdminTrollSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    usernameId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "perms_admin_troll" }
);

permsAdminTrollSchema.index({ guildId: 1, usernameId: 1 }, { unique: true });

module.exports = mongoose.model("PermsAdminTroll", permsAdminTrollSchema);
