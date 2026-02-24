import { z } from "zod/v4"

export const loginScehma = z.object({
    email: z.email("Please enter valid email"),
    password: z.string().min(6),
    rememberMe: z.boolean().optional(false)
})
export const registerScehma = loginScehma.extend({
    fullname: z.string().min(3).max(50),
    otp: z.string().length(4).regex(/^\d{4}/, "Please enter a valid 4 digit OTP")
})