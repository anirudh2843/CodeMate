const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};

const validateEditProfileData = (req) => {
  const { firstName, lastName, emailId, photoUrl, gender, age, about, skills } =
    req.body;

  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  // Optional: Validate presence of at least one valid field
  const hasValidFields = [
    firstName,
    lastName,
    emailId,
    photoUrl,
    gender,
    age,
    about,
    skills,
  ].some((val) => val !== undefined);

  if (!hasValidFields) return false;

  // Check if all fields in the body are allowed
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validateEditProfileData,
};
