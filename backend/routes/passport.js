import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import User from "../models/userModels.js";
import "./config.js";

//==============
//GOOGLE AUTH
//==============
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/users/google/callback",
      profileFields: ["emails", "displayName"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in your database
        const user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If the user already exists, return the user object
          return done(null, user);
        } else {
          // If the user doesn't exist, create a new user
          const newUser = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            // Additional user properties as needed
          });

          // Set default values for the user's properties
          newUser.isAdmin = false;
          newUser.isSeller = false;
          newUser.isBlocked = false;
          newUser.isAccountVerified = false;

          const savedUser = await newUser.save();
          return done(null, savedUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

//==============
//FACEBOOK AUTH
//==============
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/api/users/auth/facebook/callback",
      profileFields: ["id", "displayName", "name", "email"], // Additional fields you want to retrieve
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if the user already exists in your database
        const user = await User.findOne({ facebookId: profile.id });

        if (user) {
          // If the user already exists, return the user object
          return done(null, user);
        } else {
          // If the user doesn't exist, create a new user
          const newUser = new User({
            facebookId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            // Additional user properties as needed
          });

          // Set default values for the user's properties
          newUser.isAdmin = false;
          newUser.isSeller = false;
          newUser.isBlocked = false;
          newUser.isAccountVerified = false;

          const savedUser = await newUser.save();
          return done(null, savedUser);
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
