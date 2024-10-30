import {NextRequest, NextResponse} from "next/server";
import {randomBytes, randomUUID} from "crypto";
import {db} from "@/drizzle/drizzle";
import {organisationsTable, tokensTable, usersOrganisationsTable, usersTable} from "@/drizzle/schema";
import {eq} from "drizzle-orm";
import {env} from "@/app/environment";
import {z} from "zod";

export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json({error: 'email parameter is required'},
        { status: 400 }
      );
    }


    // const res = await db.select()
    //   .from(users)
    //   .leftJoin(posts, eq(posts.authorId, users.id))
    //   .orderBy(users.id)
    const existingUsersResult = await db.select()
      .from(usersTable)
      .where(eq(usersTable.email, email))

    if (existingUsersResult.length === 0) return NextResponse.json({status: 404});
    const user = existingUsersResult[0]

    // const users = await db.select()
    //   .from(usersOrganisationsTable)
    //   .rightJoin(usersTable, eq(usersOrganisationsTable.userUuid, usersTable.uuid))
    //   .where(eq(usersOrganisationsTable.organisationUuid, params.id))

    const organisationResult = await db.select()
      .from(usersOrganisationsTable)
      .leftJoin(organisationsTable, eq(organisationsTable.uuid, usersOrganisationsTable.organisationUuid))
      .where(eq(usersOrganisationsTable.userUuid, user.uuid))

    if (organisationResult.length === 0) return NextResponse.json({status: 404});
    const organisation = organisationResult[0].Organisations


    console.log('organisation', organisation)

    console.log(user)

    const existingTokensResult = await db.select()
      .from(tokensTable)
      .where(eq(tokensTable.userUuid, user.uuid))
    if (existingTokensResult.length === 0) return NextResponse.json({status: 404});

    const token = existingTokensResult[0]

    return NextResponse.json({value: token.value, organisation},
      { status: 200 }
    );
  } catch (e) {
    const error = e as Error
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}

const ZodCreateTokenRequestBody = z.object({
  organisationUuid: z.string().uuid(),
  email: z.string(),
  licenseUuid: z.string().uuid().optional(),
});

type CreateTokenRequestBody = z.infer<typeof ZodCreateTokenRequestBody>

export async function POST(req: NextRequest) {
  try {
    const body: CreateTokenRequestBody = await req.json()
    const data = ZodCreateTokenRequestBody.parse(body)

    const existingOrganisationsResult = await db.select().from(organisationsTable).where(eq(organisationsTable.uuid, data.organisationUuid))
    if (existingOrganisationsResult.length === 0) throw new Error("Organisation does not exist")

    const existingUserEmailResult = await db.select().from(usersTable).where(eq(usersTable.email, data.email));
    if (existingUserEmailResult.length > 0) throw new Error("User email already exists")

    const createUser = await db.insert(usersTable).values({
      uuid: randomUUID(),
      username: null,
      email: data.email,
      salt: null,
      hash: null,
    }).returning();

    const user = createUser[0]

    await db.insert(usersOrganisationsTable).values({
      userUuid: createUser[0].uuid,
      organisationUuid: existingOrganisationsResult[0].uuid,
    }).returning();

    const token = randomBytes(32).toString('hex')

    await db.insert(tokensTable).values({
      uuid: randomUUID(),
      value: token,
      organisationUuid: existingOrganisationsResult[0].uuid,
      userUuid: user.uuid
    }).returning();

    if (data.licenseUuid) {
      const updateLicense = await fetch(`${process.env.NEXT_PUBLIC_SALABLE_API_BASE_URL}/licenses/${data.licenseUuid}`, {
        method: "PUT",
        headers: {
          'x-api-key': env.SALABLE_API_KEY,
          version: 'v2',
        },
        body: JSON.stringify({
          granteeId: user.uuid
        })
      })
      if (!updateLicense.ok) {
        throw new Error("Failed to assign license")
      }
    }

    return NextResponse.json({token},
      { status: 200 }
    );
  } catch (e) {
    const error = e as Error
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}