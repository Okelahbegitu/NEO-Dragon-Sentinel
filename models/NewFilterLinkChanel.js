const mongoose = require("mongoose");

const newFilterLinkChanelSchema = new mongoose.Schema(
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