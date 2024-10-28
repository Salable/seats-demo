import {NextRequest, NextResponse} from "next/server";
import {env} from "@/app/environment";
import {randomBytes, randomUUID} from "crypto";
import {getIronSession} from "iron-session";
import {Session} from "@/app/settings/subscriptions/[uuid]/page";
import {cookies} from "next/headers";
import {z} from "zod";
import {salableApiBaseUrl, salableBasicUsagePlanUuid} from "@/app/constants";

const ZodCreateStringRequestBody = z.object({
  bytes: z.union([z.literal(16), z.literal(32), z.literal(64)]),
});

type CreateStringRequestBody = z.infer<typeof ZodCreateStringRequestBody>

export async function POST(req: NextRequest) {
  const session = await getIronSession<Session>(cookies(), { password: 'Q2cHasU797hca8iQ908vsLTdeXwK3BdY', cookieName: "salable-session" });
  try {
    const body: CreateStringRequestBody = await req.json()
    const data = ZodCreateStringRequestBody.parse(body)
    const randomString = randomBytes(body.bytes).toString('hex');

    let increment: number
    switch (data.bytes) {
      case 16 :
        increment = 1000
        break
      case 32 :
        increment = 2000
        break
      case 64 :
        increment = 3000
        break
      default: throw Error("Unknown bytes int")
    }

    const res = await fetch(`${salableApiBaseUrl}/usage`, {
      method: "PUT",
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
        'unique-key': randomUUID()
      },
      body: JSON.stringify({
        planUuid: salableBasicUsagePlanUuid,
        granteeId: session.uuid,
        countOptions: {
          increment
        }
      }),
      cache: "no-store",
    })

    return NextResponse.json(
      {randomString, credits: increment}, { status: res.status }
    );
  } catch (e) {
    const error = e as Error
    console.log(error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}