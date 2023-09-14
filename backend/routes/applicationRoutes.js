import express from "express";
import expressAsyncHandler from "express-async-handler";
import Apply from "../models/application.js";
import { isAdmin, isAuth } from "../utils.js";
import User from "../models/userModels.js";
import nodemailer from "nodemailer";
import Settings from "../models/settings.js";

const applicationRoutes = express.Router();

//======
//APPLY
//======
applicationRoutes.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const existingApplication = await Apply.findOne({ user: req.user._id });
    if (existingApplication) {
      return res.status(400).send({
        message: "You have already submitted an application.",
      });
    }
    try {
      const application = await Apply.create({
        ...req.body,
        user: req.user._id,
        status: "pending",
      });
      res.status(201).send(application);
    } catch (error) {
      res.status(500).send({ message: "Internal Server Error" });
    }
  })
);

//=========
//FETCH ALL
//=========
applicationRoutes.get(
  "/",
  // isAuth,
  // isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const applications = await Apply.find({})
        .sort("-createdAt")
        .populate("user");
      res.send(applications);
    } catch (error) {
      res.status(500).send({ message: "Fail to fetch all applications" });
    }
  })
);

//=============
// FETCH SINGLE
//=============
applicationRoutes.get(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const application = await Apply.findById(id).populate("user");
      res.send(application);
    } catch (error) {
      res.status(500).send({ message: "Internal server error" });
    }
  })
);

//===========================
// Function to send an email
//===========================
async function sendEmail(to, subject, html) {
  const smtpTransport = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `${process.env.SHOP_NAME} <${process.env.EMAIL_ADDRESS}>`,
    to: to,
    subject: subject,
    html: html,
  };

  try {
    await smtpTransport.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Email template styling
function getEmailTemplate(content, settings) {
  const { facebook, twitter, whatsapp } = settings || {};
  return `
    <html>
      <head>
        <style>
          .main {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            border-radius: 8px;
            padding: 20px;
           
          }
          .container {
            max-width: 600px;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            margin: 1% auto;
            overflow: hidden;
          }
          .header {
            background-color: #007bff;
            padding: 20px;
            text-align: center;
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
          }
          .content{
            text-align: center;
          }
          h2 {
            color: #333;
          }
          p {
            color: #666;
            margin: 10px 0;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
          }
          .social-icons {
            margin-top: 10px;
          }
          .social-icon {
            margin: 0 5px;
            font-size: 24px;
            color: #333;
          }
          .icons{
            width:25px;
            height: 25px;
          }
        </style>
      </head>
      <body>
       <div class="main">
        <div class="container">
         <div class="header">            
          <h1>${process.env.SHOP_NAME}</h1>
        </div>
         <div class="content">
           ${content}
         </div>
        <div class="footer">
          <p>For more information, visit our website:</p>
          <p><strong>${process.env.SHOP_NAME}</strong></p>
          <div class="social-icons">
            <a href=${facebook} class="social-icon">
              <img
                class="icons"
                src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/facebook_e2bdv6.png"
                alt="Facebook"
              />
            </a>
            <a href=${twitter} class="social-icon">
              <img
                class="icons"
                src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399098/twitter_djgizx.png"
                alt="Twitter"
              />
            </a>
            <a href=https://wa.me/${whatsapp} class="social-icon">
              <img
                class="icons"
                src="https://res.cloudinary.com/dstj5eqcd/image/upload/v1693399099/whatsapp_m0dmdp.png"
                alt="WhatsApp"
              />
            </a>
          </div>
        </div>  
        </div>
       </div> 
      </body>
    </html>
  `;
}

//======================
//APPROVE AN APPLICATION
//======================
applicationRoutes.put(
  "/:id/approve",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.findOne({});
    const { id } = req.params;
    try {
      const application = await Apply.findById(id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      application.status = "approved";
      const updatedApplication = await application.save();

      // Send styled email to user (application creator) about application approval
      const user = await User.findById(application.user);
      if (user) {
        const subject = "Application Status Update";
        const message = getEmailTemplate(
          `<h2>Application Approved</h2><p>Congratulations! Your application has been approved.</p>`,
          settings
        );
        // Log before sending email
        console.log("Sending email to:", user.email);
        await sendEmail(user.email, subject, message);
        console.log("Email sent successfully");
      }

      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Error updating application" });
    }
  })
);
//======================
//DECLINE AN APPLICATION
//======================
applicationRoutes.put(
  "/:id/decline",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const settings = await Settings.findOne({});
    const { id } = req.params;
    try {
      const application = await Apply.findById(id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      application.status = "declined";
      const updatedApplication = await application.save();

      // Send styled email to user (application creator) about application decline
      const user = await User.findById(application.user);
      if (user) {
        const subject = "Application Status Update";
        const message = getEmailTemplate(
          `<h2>Application Declined</h2><p>Your application has been declined.</p>`,
          settings
        );
        await sendEmail(user.email, subject, message);
      }

      res.json(updatedApplication);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Error updating application" });
    }
  })
);

// //=========
// // DECLINED
// //=========
// applicationRoutes.put(
//   "/:id",
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const { id } = req.params;
//     try {
//       const application = await Apply.findById(id);
//       if (!application) {
//         res.status(404).json({ message: "Application not found" });
//         return;
//       }
//       application.status = false;
//       const updatedApplication = await application.save();

//       res.json(updatedApplication);
//     } catch (error) {
//       res.status(500).json({ message: "Error updating application" });
//     }
//   })
// );

// //==========
// // ACCEPT
// //==========
// applicationRoutes.put(
//   "/:id/approve",
//   isAuth,
//   isAdmin,
//   expressAsyncHandler(async (req, res) => {
//     const { id } = req.params;
//     try {
//       const application = await Apply.findById(id);
//       if (!application) {
//         res.status(404).json({ message: "Application not found" });
//         return;
//       }
//       application.status = true;
//       const updatedApplication = await application.save();

//       res.json(updatedApplication);
//     } catch (error) {
//       res.status(500).json({ message: "Error updating application" });
//     }
//   })
// );

//=======
//DELETE
//=======
applicationRoutes.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const application = await Apply.findByIdAndDelete(id);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: "Error Deleting application" });
    }
  })
);

export default applicationRoutes;
