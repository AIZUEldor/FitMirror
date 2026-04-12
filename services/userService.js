const bcrypt = require("bcrypt");
const prisma = require("../src/lib/prisma");
const jwt = require("jsonwebtoken");

const registerUser = async ({ email, password, fullName }) => {
  if (!email || !password) {
    const error = new Error("Email va password majburiy");
    error.statusCode = 400;
    throw error;
  }

  email = email.trim().toLowerCase();
  fullName = fullName ? fullName.trim() : null;

  if (password.length < 6) {
    const error = new Error("Password kamida 6 ta belgidan iborat bo'lishi kerak");
    error.statusCode = 400;
    throw error;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });


  if (existingUser) {
    const error = new Error("Bu email allaqachon ro'yxatdan o'tgan");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
};

const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email va password majburiy");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    const error = new Error("Email yoki password noto'g'ri");
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Email yoki password noto'g'ri");
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

return {
  user: {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
  },
  token,
};
};

module.exports = {
  registerUser,
  loginUser,
};