import { dbQuery } from "../utils/db"
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.showtimeId || !body.customerName || !body.seatNumber) {
    throw createError({ statusCode: 400, statusMessage: 'showtimeId, customerName, and seatNumber are required' })
  }

  try {
    const result = await dbQuery(
      `INSERT INTO bookings (showtime_id, customer_name, seat_number)
       VALUES (:showtimeId, :customerName, :seatNumber)
       RETURNING id INTO :id`,
      {
        showtimeId: body.showtimeId,
        customerName: body.customerName,
        seatNumber: body.seatNumber,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    )
    return { id: result.outBinds.id[0] }
  } catch (err: any) {
    if (err.errorNum === 1) {
      throw createError({ statusCode: 409, statusMessage: 'That seat is already booked' })
    }
    throw err
  }
})
