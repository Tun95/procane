import express from "express";
import expressAsyncHandler from "express-async-handler";
import Sib from "sib-api-v3-sdk";
import EmailMsg from "../models/emailMessaging.js";
import { isAdmin, isAuth } from "../utils.js";
import nodemailer from "nodemailer";

const sendEmailRouter = express.Router();

//Contact Admin
sendEmailRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    apiKey.apiKey = process.env.SEND_IN_BLUE_API_KEY;

    const { email, name, subject, message } = req.body;
    const tranEmailApi = new Sib.TransactionalEmailsApi();
    const sender = {
      email,
      name,
    };
    const receivers = [
      {
        email: process.env.EMAIL_ADDRESS,
      },
    ];
    tranEmailApi
      .sendTransacEmail({
        sender,
        to: receivers,
        subject,
        textContent: message,
        params: {
          role: "Frontend",
        },
      })
      .then(console.log)
      .catch(console.log);
    res.json("sent");
  })
);

//Subscribe to News Letter
sendEmailRouter.post(
  "/subscribe",
  // isAuth,
  expressAsyncHandler(async (req, res) => {
    const emailExist = await EmailMsg.findOne({ email: req.body.email });
    if (emailExist) {
      return res.status(400).send({ message: "Email already exists" });
    }
    const subscribe = await EmailMsg.create({
      email: req.body.email,
      //user: req.user._id,
    });
    res
      .status(200)
      .send({ message: "You have successfully subscribe to our newsletter" });
    console.log(subscribe);
  })
);

// Unsubscribe from News Letter
sendEmailRouter.post(
  "/unsubscribe",
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;
    const unsubscribedUser = await EmailMsg.findOneAndDelete({ email });
    if (unsubscribedUser) {
      return res
        .status(200)
        .send({ message: "You have successfully unsubscribed" });
    } else {
      return res.status(404).send({ message: "Email not found" });
    }
  })
);

//Fetch All
sendEmailRouter.get(
  "/",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const subscribers = await EmailMsg.find({}).sort("-createdAt");
      res.send(subscribers);
    } catch (error) {
      res.send(error);
    }
  })
);

//=======
//Delete
//=======
sendEmailRouter.delete(
  "/:id",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const subscriber = await EmailMsg.findById(req.params.id);
    if (subscriber) {
      await subscriber.remove();
      res.send({ message: "Subscriber Deleted Successfully" });
    } else {
      res.status(404).send({ message: "Subscriber Not Found" });
    }
  })
);

//Send News Letter email
sendEmailRouter.post(
  "/send",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { subject, message } = req.body;

    EmailMsg.find({}, function (err, allUsers) {
      if (err) {
        console.log(err);
      }
      const mailList = [];
      allUsers.forEach(function (users) {
        mailList.push(users.email);
        return mailList;
      });
      const smtpTransport = nodemailer.createTransport({
        service: process.env.MAIL_SERVICE,
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.GMAIL_PASS,
        },
      });

      // Add unsubscribe link to the end of the email message
      const unsubscribeLink = `${process.env.SUB_DOMAIN}/unsubscribe`;
      const shopName = process.env.SHOP_NAME;

      const emailMessageWithUnsubscribe = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              background-color: #f4f4f4;
              padding: 20px;
            }
            .header {
              background-color: #007bff;
              color: #ffffff;
              padding: 10px;
              text-align: center;
            }
            .content {
              background-color: #ffffff;
              padding: 20px;
            }
            .footer {
              background-color: #f4f4f4;
              padding: 10px;
              text-align: center;
            }
            .unsubscribe {
              margin-top: 20px;
              text-align: center;
            }
            .unsubscribe a {
              color: #007bff;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${shopName}</h1>
            </div>
            <div class="content">
              ${message}
            </div>
            <div class="footer">
              <p>If you wish to unsubscribe from our newsletter, <a href="${unsubscribeLink}">click here</a>.</p>
            </div>
            <div class="unsubscribe">
              <p><a href="${unsubscribeLink}">Unsubscribe</a> from our newsletter</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        to: [],
        bcc: mailList,
        from: `${shopName} ${process.env.EMAIL_ADDRESS}`,
        subject,
        html: emailMessageWithUnsubscribe,
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        if (err) {
          console.log(err);
          req.flash(
            "error",
            "We seem to be experiencing issues. Please try again later."
          );
          res.redirect("/");
        }
        res.send("Mail sent to " + mailList);
        console.log("Mail sent to " + mailList);
      });
    });
  })
);

export default sendEmailRouter;
