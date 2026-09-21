import { dbQuery } from "../../utils/db"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  await dbQuery('DELETE FROM bookings WHERE id = :id', { id })
  return { success: true }
})
