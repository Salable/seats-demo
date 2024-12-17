'use server'
import {randomBytes} from "crypto";
import {z} from "zod";
import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {licenseCheck} from "@/fetch/licenses/check";
import {env} from "@/app/environment";

const ZodCreateStringRequestBody = z.object({
  bytes: z.union([z.literal('16'), z.literal('32'), z.literal('64'), z.literal('128')]),
});

type CreateStringRequestBody = z.infer<typeof ZodCreateStringRequestBody>

export const generateString = async (formData: CreateStringRequestBody) =>{
  try {
    const data = ZodCreateStringRequestBody.parse(formData)
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    if (!session?.uuid) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    const bytes = Number(data.bytes)
    if (!bytes) return {data: null, error: 'Invalid bytes size'};

    const check = await licenseCheck(session.uuid)
    if (!check.data?.capabilities.find((c) => c.capability === formData.bytes)) {
      return {
        data: null,
        error: 'Unauthorised'
      }
    }
    return randomBytes(bytes).toString('hex');
  } catch (e) {
    console.error(e)
    return {error: 'Unknown error'}
  }
}