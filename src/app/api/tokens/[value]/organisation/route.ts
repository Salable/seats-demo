import {NextRequest, NextResponse} from "next/server";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, tokensTable, usersOrganisationsTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";

export const revalidate = 0

export async function GET(req: NextRequest, { params } : {params: {value: string}}) {
  try {
    const organisationResult = await db.select()
      .from(tokensTable)
      .leftJoin(organisationsTable, eq(organisationsTable.uuid, tokensTable.organisationUuid))
      .where(eq(tokensTable.value, params.value))

    const organisation = organisationResult[0].Organisations

    return NextResponse.json(organisation, {status: 200})
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}