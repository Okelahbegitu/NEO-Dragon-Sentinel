const mongoose = require("mongoose");

const filterLinkChannelSchema = new mongoose.Schema(
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
  { timestamps: true }
);
filterLinkChannelSchema.index({ guildId: 1, channelId: 1 });
module.exports = mongoose.model("FilterLinkChannel", filterLinkChannelSchema)