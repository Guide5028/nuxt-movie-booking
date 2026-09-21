import { dbQuery } from "../../utils/db"

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const showtimeResult = await dbQuery(
    `SELECT s.id, s.hall_name, s.starts_at, s.price, s.seat_count,
            m.id AS movie_id, m.title AS movie_title, m.genre, m.duration_minutes,
            t.id AS theater_id, t.name AS theater_name, t.city AS theater_city
     FROM showtimes s
     JOIN movies m ON m.id = s.movie_id
     JOIN theaters t ON t.id = s.theater_id
     WHERE s.id = :id`,
    { id }
  )

  if (!showtimeResult.rows?.length) {
    throw createError({ statusCode: 404, statusMessage: 'Showtime not found' })
  }

  const bookingsResult = await dbQuery(
    `SELECT b.id, b.seat_number, b.customer_id, c.name AS customer_name
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     WHERE b.showtime_id = :id
     ORDER BY b.seat_number`,
    { id }
  )

  return {
    ...showtimeResult.rows[0],
    bookings: bookingsResult.rows
  }
})
