import { z } from "zod";

// Centralized Zod schemas used by both API routes and client-side forms
// (react-hook-form + @hookform/resolvers/zod), so validation rules never
// drift between client and server.

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/[0-9]/, "Include at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const createSubscriptionSchema = z.object({
  platform: z.string().min(2).max(60),
  logoUrl: z.string().url().optional(),
  monthlyPrice: z.number().positive(),
  availableSlots: z.number().int().min(1).max(50),
  renewalDate: z.coerce.date(),
  description: z.string().max(500).optional(),
  tosAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "You must confirm this platform allows shared seats" }),
  }),
});

export const joinSubscriptionSchema = z.object({
  subscriptionId: z.string().cuid(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "RAZORPAY", "JAZZCASH", "WALLET"]),
  couponCode: z.string().optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
});
