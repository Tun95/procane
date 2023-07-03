import express from "express";
import Stripe from "stripe";
import { isAuth } from "../utils.js";

// const stripe = require("stripe")(process.env.STRIPE_KEY);
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const stripeRouter = express.Router();
stripeRouter.post("/payment", isAuth, (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      // name: req.body.name,
      // card: req.body.card,
      // cvv: req.body.cvv,
      // date: req.body.date,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).send(stripeErr);
      } else {
        res.status(200).send(stripeRes);
      }
    }
  );
});

export default stripeRouter;
