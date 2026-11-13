import { z } from "zod"

export const couponFormSchema = z.object({
  code: z.string().trim().min(1, "Enter a coupon code").max(32, "This is too long")
})

export type CouponFormInput = z.infer<typeof couponFormSchema>
