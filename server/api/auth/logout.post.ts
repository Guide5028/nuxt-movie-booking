import { clearCurrentCustomerId } from "../../utils/auth"

export default defineEventHandler((event) => {
  clearCurrentCustomerId(event)
  return { success: true }
})
