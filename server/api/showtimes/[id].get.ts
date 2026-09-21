import { dbQuery } from "../../utils/db"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const showtimeResult = await dbQuery(
    `SELECT s.id, s.hall_name, s.starts_at, s.price, s.seat_count,
            m.id AS movie_id, m.title AS movie_title, m.genre, m.duration_minutes
     FROM showtimes s
     JOIN movies m ON m.id = s.movie_id
     WHERE s.id = :id`,
    { id }
  )

  if (!showtimeResult.rows?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Showtime not found' })
  }

  const bookingsResult = await dbQuery(
    `SELECT id, seat_number, customer_name FROM bookings WHERE showtime_id = :id ORDER BY seat_number`,
    { id }
  )

  return {
    ...showtimeResult.rows[0],
    bookings: bookingsResult.rows
  }
})
