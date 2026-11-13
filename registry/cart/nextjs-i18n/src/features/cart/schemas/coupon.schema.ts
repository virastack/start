import { z } from "zod"

type CouponFormMessages = {
  required: string
  tooLong: string
}

/** The schema with the visitor's language, built where the messages are. */
export function createCouponFormSchema(messages: CouponFormMessages) {
  return z.object({
    code: z.string().trim().min(1, messages.required).max(32, messages.tooLong)
  })
}

export type CouponFormInput = z.infer<ReturnType<typeof createCouponFormSchema>>
