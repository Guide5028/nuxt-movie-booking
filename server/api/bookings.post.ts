import { dbTransaction } from "../utils/db"
import { requireCustomerId } from "../utils/auth"
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  const customerId = requireCustomerId(event)
  const body = await readBody(event)
  const seatNumbers: string[] = body.seatNumbers

  if (!body.showtimeId || !Array.isArray(seatNumbers) || !seatNumbers.length) {
    throw createError({ statusCode: 400, statusMessage: 'showtimeId and seatNumbers are required' })
  }

  try {
    const ids = await dbTransaction(async (connection) => {
      const insertedIds: number[] = []
      for (const seatNumber of seatNumbers) {
        const result = await connection.execute(
          `INSERT INTO bookings (showtime_id, customer_id, seat_number)
           VALUES (:showtimeId, :customerId, :seatNumber)
           RETURNING id INTO :id`,
          {
            showtimeId: body.showtimeId,
            customerId,
            seatNumber,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          }
        )
        insertedIds.push((result.outBinds as any).id[0])
      }
      return insertedIds
    })
    return { ids }
  } catch (err: any) {
    if (err.errorNum === 1) {
      throw createError({ statusCode: 409, statusMessage: 'One or more of those seats is already booked' })
    }
    throw err
  }
})
