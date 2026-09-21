import { dbQuery } from "../utils/db"

export default defineEventHandler(async () => {
  const result = await dbQuery(`
    SELECT id, title, description, image_url
    FROM promotions
    ORDER BY id
  `)
  return result.rows
})
