import { dbQuery } from "../../utils/db"
import { setCurrentCustomerId } from "../../utils/auth"
import oracledb from 'oracledb'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.email) {
    throw createError({ statusCode: 400, statusMessage: 'name and email are required' })
  }

  const existing = await dbQuery(
    'SELECT id, name, email FROM customers WHERE email = :email',
    { email: body.email }
  )

  let customer
  if (existing.rows.length) {
    customer = existing.rows[0]
  } else {
    const result = await dbQuery(
      `INSERT INTO customers (name, email) VALUES (:name, :email) RETURNING id INTO :id`,
      {
        name: body.name,
        email: body.email,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    )
    customer = { ID: (result.outBinds as any).id[0], NAME: body.name, EMAIL: body.email }
  }

  setCurrentCustomerId(event, customer.ID)
  return customer
})
