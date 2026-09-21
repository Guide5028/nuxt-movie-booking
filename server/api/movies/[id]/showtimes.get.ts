import { dbQuery } from "../../../utils/db"

export default defineEventHandler(async (event) => {
  const movieId = getRouterParam(event, 'id')
  const result = await dbQuery(
    `SELECT id, hall_name, starts_at, price, seat_count
     FROM showtimes
     WHERE movie_id = :movieId
     ORDER BY starts_at`,
    { movieId }
  )
  return result.rows
})
