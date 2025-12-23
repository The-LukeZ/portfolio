import { dev } from "$app/environment";
import { env } from "$env/dynamic/private";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

export async function load({ cookies, url }) {
  const token = jwt.sign(
    {
      accessKey: randomBytes(16).toString("hex"),
    },
    env.JWT_SECRET,
    {
      expiresIn: "1h",
      algorithm: "ES256",
      audience: "lukez-portfolio",
      issuer: "lukez-portfolio",
      subject: "img-access",
    },
  );
  cookies.set("img_token", token, {
    httpOnly: true,
    priority: "high",
    path: "/get-image",
    domain: url.hostname,
    secure: !dev,
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
  });
  return {
    message: "he-he",
  };
}
