import { Response, Request } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model";

export const registerUser = async (req: Request, res: Response) => {
  const { email, fullname, password } = req.body;

  const isUserExist = await userModel.findOne({ email });

  if (isUserExist) {
    return res.status(400).json({ message: "User already exist" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    email,
    fullname,
    password: hashedPassword,
  });

  const token = jwt.sign(
    { _id: newUser._id },
    process.env.JWT_SECRET as string,
  );

  res.cookie("token", token);

  return res.status(201).json(newUser);
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  if (!user.password) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string);

  res.cookie("token", token);

  return res.status(200).json({ message: "Login successful" });
};
