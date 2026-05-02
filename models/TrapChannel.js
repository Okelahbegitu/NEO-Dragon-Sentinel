const mongoose = require("mongoose");

const trapChannelSchema = new mongoose.Schema(
  {
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, collection: "trap_channels" }
);

trapChannelSchema.index({ guildId: 1, channelId: 1 }, { unique: true });

module.exports = mongoose.model("TrapChannel", trapChannelSchema);
