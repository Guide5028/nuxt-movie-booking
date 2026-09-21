import { dbQuery } from "../../../utils/db"

export default defineEventHandler(async (event) => {
  const movieId = getRouterParam(event, 'id')
  const result = await dbQuery(
    `SELECT s.id, s.hall_name, s.starts_at, s.price, s.seat_count,
            t.id AS theater_id, t.name AS theater_name, t.city AS theater_city
     FROM showtimes s
     JOIN theaters t ON t.id = s.theater_id
     WHERE s.movie_id = :movieId
     ORDER BY t.name, s.starts_at`,
    { movieId }
  )
  return result.rows
})
