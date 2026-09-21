import { dbQuery } from "../utils/db"

export default defineEventHandler(async () => {
  const result = await dbQuery(`
    SELECT id, title, genre, duration_minutes
    FROM movies
    ORDER BY title
  `)
  return result.rows
})
