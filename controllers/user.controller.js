import User from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import RemovedUser from "../models/removed.model.js";
import { getCoordinatesFromAddress } from "../utils/locationUtils.js";

// User Registration
export const signup = async (req, res) => {
  try {
    const { name, email, password, userType, address } = req.body;

    // Check if any required field is missing
    if (!name || !email || !password || !userType || !address) {
      return res
        .status(400)
        .json({
          message:
            "Please provide all required fields (name, email, password, userType, address)",
        });
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    // Get coordinates from address
    const locationData = await getCoordinatesFromAddress(address);

    if (locationData.error) {
      return res.status(400).json({
        message: `Location error: ${locationData.error}`,
      });
    }

    // Create new user with address and coordinates
    const newUser = new User({
      name,
      email,
      password,
      userType,
      address: locationData.address,
      location: {
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
      },
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        address: newUser.address,
        location: {
          latitude: newUser.location.latitude,
          longitude: newUser.location.longitude,
        },
      },
    });
  } catch (error) {
    console.log("Error in signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Login also check like if user is removed by admin or not
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    //first we need to get the user id from the email and then we will check in removed collection
    const userId = await User.findOne({ email }).select("_id").exec();
    //check if user is removed by admin
    const removedUser = await RemovedUser.findOne({ userId: userId?._id });
    if (removedUser) {
      return res.status(403).json({
        message: `Your account has been removed. Reason: ${removedUser.reason}. Please contact admin for more details.`,
      });
    }
    //check if any required field is missing
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }
    //find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }
    //check if password matches
    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid password" });
    }
    //update last login time
    user.lasLogin = Date.now();
    await user.save();

    //generate token
    const token = generateToken({
      id: user._id,
      email: user.email,
      userType: user.userType,
    }); //payload can be customized

    // Set token as httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.log("Error in login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all users
export const getAllUsers = async (req, res) => {
  try {
    //getall users from db with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .select("-password") //exclude password field
      .exec();

    const totalUsers = await User.countDocuments().exec();
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      page,
      totalPages,
      totalUsers,
      users,
    });
  } catch (error) {
    console.log("Error in getAllUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get user by id
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password").exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete user
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByIdAndDelete(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error in deleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//logout user
export const logout = (req, res) => {
  //in JWT based auth logout is handled on client side by deleting the token
  res.status(200).json({ message: "Logout successful on client side" });
};

//active user count
export const getActiveUserCount = async (req, res) => {
  try {
    const activeSince = new Date(Date.now() - 10 * 60 * 1000); //last 10 minutes
    const activeUserCount = await User.countDocuments({
      lastLogin: { $gte: activeSince },
    }).exec();
    res.status(200).json({ activeUserCount });
  } catch (error) {
    console.log("Error in getActiveUserCount:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// user retention rate
export const getUserRetentionRate = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments().exec();
    const retainedUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, //last 30 days
    }).exec();
    const retentionRate =
      totalUsers === 0 ? 0 : (retainedUsers / totalUsers) * 100;
    res.status(200).json({ retentionRate: retentionRate.toFixed(2) + "%" });
  } catch (error) {
    console.log("Error in getUserRetentionRate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, address } = req.body;

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update basic fields
    if (name) {
      user.name = name;
    }

    // Handle address update and get new coordinates
    if (address) {
      const locationData = await getCoordinatesFromAddress(address);

      if (locationData.error) {
        return res.status(400).json({
          message: `Location error: ${locationData.error}`,
        });
      }

      user.address = locationData.address;
      user.location = {
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
      };
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        address: user.address,
        location: {
          latitude: user.location.latitude,
          longitude: user.location.longitude,
        },
      },
    });
  } catch (error) {
    console.log("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete user by admin (with some reason)
//we will not remove them from user we will just keep them in remove collection so everytime during login we can check if user is removed or not and if yes then we will display the reason and tell them to connect with the admin
export const adminDeleteUser = async (req, res) => {
  try {
    const user = req.user;
    if (user.userType !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const userId = req.params.id;
    const { reason } = req.body;
    if (!reason) {
      return res
        .status(400)
        .json({ message: "Please provide a reason for deletion" });
    }
    const userToDelete = await User.findById(userId).exec();
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }
    // we will find user and add them to remove collection but not delete them from user collection
    const removedUser = new RemovedUser({
      userId: userToDelete._id,
      email: userToDelete.email,
      reason,
      removedBy: user.id,
      removedAt: new Date(),
    });
    await removedUser.save();
    res.status(200).json({ message: "User removed successfully" });
  } catch (error) {
    console.log("Error in adminDeleteUser:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
