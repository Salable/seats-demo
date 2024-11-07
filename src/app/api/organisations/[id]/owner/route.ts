import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export const revalidate = 0

export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  try {
    if (!params.id) return NextResponse.json({status: 404})

    const result = await db.select()
      .from(organisationsTable)
      .where(eq(organisationsTable.uuid, params.id))
    if (result.length === 0) throw new Error("No users found")
    const organisation = result[0]

    return NextResponse.json(
      organisation.owner,
      {status: 200}
    )
  } catch (e) {
    console.log(e)
    return NextResponse.json({status: 400, message: "Error retrieving users"})
  }
}