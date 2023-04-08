import { Kysely } from 'kysely'
import { PlanetScaleDialect } from 'kysely-planetscale'
import { DatabaseTables } from './kysely'

if (!process.env.DATABASE_URL) {
    throw new Error('Kysely has not found a DATABASE_URL in the env')
}
let uri = new URL(process.env.DATABASE_URL!)

export const db = new Kysely<DatabaseTables>({
    dialect: new PlanetScaleDialect({
        url: uri.toString(),
    }),
})
