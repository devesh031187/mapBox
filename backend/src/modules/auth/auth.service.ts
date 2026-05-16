import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import type { SignOptions } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { prisma } from "../../config/database.js";
import { env } from "../../config/env.js";
import { AppError } from "../../middleware/errorHandler.js";

interface RefreshPayload {
  sub: string;
  jti: string;
}

function publicUser(user: User) {
  return {
    id: user.id,
    employeeCode: user.employeeCode,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    outletId: user.outletId,
    isActive: user.isActive,
  };
}

function signTokens(user: User) {
  const jti = randomUUID();
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, jti },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
  );
  const refreshToken = jwt.sign(
    { sub: user.id, jti },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions
  );
  return { accessToken, refreshToken };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new AppError(401, "Invalid credentials");
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new AppError(401, "Invalid credentials");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { accessToken, refreshToken } = signTokens(user);
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: publicUser(user),
  };
}

export async function refresh(refreshToken: string | undefined) {
  if (!refreshToken) {
    throw new AppError(401, "Refresh token missing");
  }
  let payload: RefreshPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as RefreshPayload;
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const revoked = await prisma.revokedToken.findUnique({
    where: { jti: payload.jti },
  });
  if (revoked) {
    throw new AppError(401, "Refresh token has been revoked");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw new AppError(401, "User no longer active");
  }

  const tokens = signTokens(user);
  return {
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    user: publicUser(user),
  };
}

export async function logout(jti: string, userId: string) {
  const decodedExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.revokedToken.upsert({
    where: { jti },
    create: { jti, userId, expiresAt: decodedExpiry },
    update: {},
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return publicUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError(400, "Current password is incorrect");
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
