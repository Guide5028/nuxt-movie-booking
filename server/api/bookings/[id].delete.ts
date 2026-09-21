import { dbQuery } from "../../utils/db"
import { requireCustomerId } from "../../utils/auth"

export default defineEventHandler(async (event) => {
  const customerId = requireCustomerId(event)
  const id = getRouterParam(event, 'id')

  const result = await dbQuery('SELECT customer_id FROM bookings WHERE id = :id', { id })
  if (!result.rows.length) {
    throw createError({ statusCode: 404, statusMessage: 'Booking not found' })
  }
  if (result.rows[0].CUSTOMER_ID !== customerId) {
    throw createError({ statusCode: 403, statusMessage: 'You can only cancel your own booking' })
  }

  await dbQuery('DELETE FROM bookings WHERE id = :id', { id })
  return { success: true }
})
