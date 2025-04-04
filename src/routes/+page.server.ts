import ContactForm from "$lib/server/ContactForm.js";
import { error } from "@sveltejs/kit";
import { RateLimiterMemory, RateLimiterRes } from "rate-limiter-flexible";

// Limit to 5 per hour per IP
const mailRatelimit = new RateLimiterMemory({
  duration: 3600,
  points: 5,
  blockDuration: 3600,
});

export const actions = {
  contact: async ({ request, getClientAddress }) => {
    const ip = getClientAddress();
    try {
      await mailRatelimit.consume(ip, 1);
    } catch (rejRes) {
      // Rate limit exceeded
      if (rejRes instanceof RateLimiterRes) {
        error(429, "Too many requests");
      }
      console.error("Rate limit error:", rejRes);
    }

    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const message = formData.get("message");

    try {
      ContactForm.create({
        name: name,
        email: email,
        message: message,
      });

      console.log("Contact form data:", {
        name,
        email,
        message,
        ip: getClientAddress(),
      });

      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return { success: false, error: "Failed to send email" };
    }
  },
};
