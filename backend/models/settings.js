import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    about: {
      type: String,
      default: "Your About here",
    },
    terms: {
      type: String,
      default: "Your terms here",
    },
    returns: {
      type: String,
      default: "Your return here",
    },
    privacy: {
      type: String,
      default: "Your privacy here",
    },

    currency: {
      type: String,
      default: "GBP",
    },
    rate: {
      type: Number,
      default: 0,
    },
    tax: {
      type: String,
      default: 14,
    },
    shipping: {
      type: String,
      default: 24,
    },
    express: {
      type: String,
      default: "Your express here",
    },
    expressCharges: {
      type: String,
      default: "Your express here",
    },
    standard: {
      type: String,
      default: "Your standard here",
    },
    standardCharges: {
      type: String,
      default: "Your standard charges here",
    },
    messenger: {
      type: String,
      default: "john.stone",
    },
    email: {
      type: String,
      default: "admin@gmail.com",
    },
    playstore: {
      type: String,
      default: "https://playstore.com/",
    },
    appstore: {
      type: String,
      default: "https://www.appstore.com/",
    },
    whatsapp: {
      type: String,
      default: "+918851746286",
    },
    webname: {
      type: String,
      default: "SHOPMATE",
    },
    bannerBackground: {
      type: String,
      default:
        "https://res.cloudinary.com/dstj5eqcd/image/upload/v1673724164/banner2_l71yuh.png",
    },
    buyInfo: {
      type: String,
      default: "How to buy",
    },
    bulk: {
      type: String,
      default: "Corporate & Bulk Purchasing",
    },
    reviewGuide: {
      type: String,
      default: "review guidelines",
    },
    careers: {
      type: String,
      default: "careers here",
    },
    ourcares: {
      type: String,
      default: "Our cares info here",
    },
    ourstores: {
      type: String,
      default: "Our stores info here",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
