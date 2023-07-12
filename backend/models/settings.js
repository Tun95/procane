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

    razorkeyid: {
      type: String,
      default: "rzp_test_yyI1vXw8dNpnfO",
    },
    razorsecret: {
      type: String,
      default: "kIwDzb0JYPzwzoePpseCBEXe",
    },
    paytmid: {
      type: String,
      default: "frogiro89f409r099rofhepko",
    },
    paytmkey: {
      type: String,
      default: "frogiro89f409r099rofhepko",
    },
    exhangerate: {
      type: String,
      default: "10270e08382c90d68a845cdd",
    },
    stripe: {
      type: String,
      default:
        "sk_test_51LddZCG74SnLVBhQgEpJEtwmrZun228Px4rYGTLUZ1xC81NzN2TP2svtDGXT3UPaYcEy8jtfj6X6k5EbzcEROpFu00eKwTYye4",
    },
    paystackkey: {
      type: String,
      default: "pk_test_ef13bcd8c41beba368902728447ba2b4f79a3287",
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
