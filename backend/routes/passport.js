import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import User from "../models/userModels.js";
import "./config.js";

//==============
//GOOGLE AUTH
//==============
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "/auth/google/callback", // Update this URL with your server's endpoint
//     },
//     function (accessToken, refreshToken, profile, cb) {
//       User.findOne({ googleId: profile.id }, function (err, user) {
//         if (err) {
//           return cb(err, null);
//         }
//         if (!user) {
//           // If the user does not exist, you can create a new user here with the Google profile info
//           user = new User({
//             googleId: profile.id,
//             firstName: profile.name.givenName,
//             lastName: profile.name.familyName,
//             email:
//               profile.emails && profile.emails[0]
//                 ? profile.emails[0].value
//                 : null,
//             profilePhoto: profile.photos[0].value,
//           });
//           user.save(function (err) {
//             if (err) {
//               return cb(err, null);
//             }
//             return cb(null, user);
//           });
//         } else {
//           // If the user already exists, simply return the user
//           return cb(null, user);
//         }
//       });
//     }
//   )
// );

// export default passport;
