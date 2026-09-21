import { dbQuery } from "../../utils/db"
import { getCurrentCustomerId } from "../../utils/auth"

export default defineEventHandler(async (event) => {
  const id = getCurrentCustomerId(event)
  if (!id) return null

  const result = await dbQuery('SELECT id, name, email FROM customers WHERE id = :id', { id })
  return result.rows[0] || null
})
