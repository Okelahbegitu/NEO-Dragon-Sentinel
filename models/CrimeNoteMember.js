const { time } = require("discord.js");
const mongoose = require("mongoose");

const crimeNoteMemberSchema = new mongoose.Schema({
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    usernameId: {
      type: String,
      required: true,
      index: true,
    },
    history:[
        {
            id_note:{
                type: String,
                required: true,
            },
            date: {
                type:Date,
                default: Date.now()
            },
            reason: {
                type:String,
                required: true
            },
            status: {
                type: String,
                enum: ["active", "removed"],
                default: "active"
            }
        }
    ],
} , { timestamps: true, collection: "crime_note_members" });
crimeNoteMemberSchema.index({ guildId: 1, usernameId: 1 });
module.exports = mongoose.model("CrimeNoteMember", crimeNoteMemberSchema)