import { dbQuery } from "../utils/db"

export default defineEventHandler(async () => {
  const result = await dbQuery('SELECT 1 AS OK FROM dual')
  return { db: result.rows }
})
