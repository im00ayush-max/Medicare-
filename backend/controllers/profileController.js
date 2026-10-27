const User = require("../models/User");
const toSafeUser = require("../utils/safeUser");

// GET: Logged-in user ki profile fetch karna
const getProfile = async (req, res) => {
try {
const userId = req.user?.userId || req.user?.id || req.user?._id;


if (!userId) {
  return res.status(401).json({
    success: false,
    message: "User ID not found in authentication token",
  });
}

const user = await User.findById(userId);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

return res.status(200).json({
  success: true,
  message: "Profile fetched successfully",
  user: toSafeUser(user),
});


} catch (error) {
console.error("GET PROFILE ERROR:", error);


return res.status(500).json({
  success: false,
  message: error.message,
});


}
};

// PUT: Logged-in user ki profile update karna
const updateProfile = async (req, res) => {
try {
const userId = req.user?.userId || req.user?.id || req.user?._id;


if (!userId) {
  return res.status(401).json({
    success: false,
    message: "User ID not found in authentication token",
  });
}

const { name, phone, age, address } = req.body;

const updates = {};

if (name !== undefined) {
  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name cannot be empty",
    });
  }

  updates.name = name.trim();
}

if (phone !== undefined) {
  if (typeof phone !== "string") {
    return res.status(400).json({
      success: false,
      message: "Phone must be a string",
    });
  }

  updates.phone = phone.trim();
}

if (age !== undefined) {
  const parsedAge = Number(age);

  if (
    !Number.isInteger(parsedAge) ||
    parsedAge < 1 ||
    parsedAge > 120
  ) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid age between 1 and 120",
    });
  }

  updates.age = parsedAge;
}

if (address !== undefined) {
  if (typeof address !== "string") {
    return res.status(400).json({
      success: false,
      message: "Address must be a string",
    });
  }

  updates.address = address.trim();
}

if (Object.keys(updates).length === 0) {
  return res.status(400).json({
    success: false,
    message: "Please provide at least one field to update",
  });
}

const user = await User.findByIdAndUpdate(
  userId,
  { $set: updates },
  {
    new: true,
    runValidators: true,
  }
);

if (!user) {
  return res.status(404).json({
    success: false,
    message: "User not found",
  });
}

return res.status(200).json({
  success: true,
  message: "Profile updated successfully",
  user: toSafeUser(user),
});


} catch (error) {
console.error("UPDATE PROFILE ERROR:", error);


return res.status(500).json({
  success: false,
  message: error.message,
});

}
};

module.exports = {
getProfile,
updateProfile,
};
