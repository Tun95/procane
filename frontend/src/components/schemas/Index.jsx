import * as yup from "yup";

const passwordRules = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const basicSchema = yup.object().shape({
  firstName: yup.string().required("First name is required*"),
  lastName: yup.string().required("Last name is required*"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required*"),
  password: yup
    .string()
    .min(8)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Password is required*"),
  passwordConfirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required*"),
});

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required*"),
  password: yup
    .string()
    .min(8)
    .matches(passwordRules, { message: "Invalid password" })
    .required("Password cannot be empty*"),
});

export const resetSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required*"),
});

export const newPassSchema = yup.object().shape({
  password: yup
    .string()
    .min(8)
    .matches(passwordRules, { message: "Please create a stronger password" })
    .required("Password is reqiured*"),
});

export const otpSchema = yup
  .object()
  .shape({ otp: yup.number().required("OTP box is empty*") });

export const contactSchema = yup.object().shape({
  name: yup.string().required("Name is required*"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required*"),
  subject: yup.string().required("Message title is required*"),
  message: yup.string().required("Message box cannot be empty*"),
});

export const sellerSchema = yup.object().shape({
  sellerName: yup.string().required("Store name is required*"),
  storeAddress: yup
    .string()
    .matches(/^[a-zA-Z0-9\s,'-.#]*$/, "Invalid store address")
    .required("Store address is required*"),
  sellerDescription: yup
    .string()
    .test("word-count", "About should have at least 50 words", (value) => {
      if (value) {
        const wordCount = value.trim().split(" ").length;
        return wordCount >= 50;
      }
      return false;
    })
    .required("About cannot be left empty*"),
  status: yup.boolean().oneOf([true], "This box needs to be checked*"),
});

export const billingSchema = yup.object().shape({
  firstName: yup.string().required("First name is required*"),
  lastName: yup.string().required("Last name is required*"),
  phone: yup.string().required("Phone number is required*"),
  address: yup.string().required("address is required*"),
  city: yup.string().required("City of residence is required*"),
  cstate: yup.string().required("Select State from the list*"),
  zip: yup.string().required("Zip Code is required*"),
  country: yup.string().required("Select Country from the list*"),
  delivery: yup.string().required("Select Delivery method from the list*"),
});

export const adminUserSchema = yup.object().shape({
  firstName: yup.string().required("First name is required*"),
  lastName: yup.string().required("Last name is required*"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required*"),
  phone: yup.string().required("Phone number is required*"),
  address: yup.string().required("address is required*"),
  city: yup.string().required("City of residence is required*"),
  country: yup.string().required("Select Country from the list*"),
});
