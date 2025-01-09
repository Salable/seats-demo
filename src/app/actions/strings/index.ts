'use server'
import {randomBytes} from "crypto";
import {z} from "zod";
import {getIronSession} from "iron-session";
import {Session} from "@/app/actions/sign-in";
import {cookies} from "next/headers";
import {licenseCheck} from "@/fetch/licenses/check";
import {env} from "@/app/environment";
import {Result} from "@/app/actions/checkout-link";

const zodCreateStringRequestBody = z.object({
  bytes: z.union([z.literal('16'), z.literal('32'), z.literal('64'), z.literal('128')]),
});

type CreateStringRequestBody = z.infer<typeof zodCreateStringRequestBody>

export const generateString = async (formData: CreateStringRequestBody): Promise<Result<string>> =>{
  try {
    const data = zodCreateStringRequestBody.parse(formData)
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
    return {
      data: randomBytes(bytes).toString('hex'),
      error: null
    }
  } catch (e) {
    console.error(e)
    return {
      data: null,
      error: 'Failed to generate string'
    }
  }
}