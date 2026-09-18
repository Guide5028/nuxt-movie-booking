import oracledb from 'oracledb'

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT

let pool: oracledb.Pool | null = null

async function getPool() {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = await oracledb.createPool({
      user: config.oracleUser,
      password: config.oraclePassword,
      connectString: config.oracleConnectString,
      poolMin: 1,
      poolMax: 5
    })
  }
  return pool
}

export async function dbQuery<T = any>(
  sql: string,
  binds: oracledb.BindParameters = [],
  options: oracledb.ExecuteOptions = {}
) {
  const dbPool = await getPool()
  const connection = await dbPool.getConnection()
  try {
    return await connection.execute<T>(sql, binds, { autoCommit: true, ...options })
  } finally {
    await connection.close()
  }
}
