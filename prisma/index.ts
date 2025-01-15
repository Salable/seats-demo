import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import {env} from "@/app/environment";

const pool = new Pool({ connectionString: env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prismaClient = new PrismaClient({ adapter })

/**
 * To avoid using Docker locally follow the steps below.
 *
 * 1. Update the datasource in the schema.prisma file in the root of the project to use the provider "sqlite"
 * datasource db {
 *   provider = "sqlite"
 *   url      = env("DATABASE_URL")
 * }
 *
 * 2. Update the DATABASE_URL var in your .env file to be "file:./dev.db"
 * 3. Replace the code what was in this file with the below -
 * import { PrismaClient } from "@prisma/client";
 * import { PrismaLibSQL } from "@prisma/adapter-libsql";
 * import { createClient } from "@libsql/client";
 * import {env} from "@/app/environment";
 *
 * const libsql = createClient({
 *   url: env.DATABASE_URL,
 * });
 *
 * const adapter = new PrismaLibSQL(libsql);
 * export const prismaClient = new PrismaClient({ adapter });
 * 4. npm install -g prisma
 * 5. prisma db push
 * */