'use server'
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {z} from "zod";
import {prismaClient} from "../../../../prisma";
import {env} from "@/app/environment";
import {redirect} from "next/navigation";
import {Result} from "@/app/actions/checkout-link";
import {Session} from "@/app/actions/sign-in";

const zodAcceptInviteRequestBody = z.object({
  token: z.string(),
  username: z.string(),
  password: z.string(),
  licenseUuid: z.string().uuid().optional(),
});
type AcceptInviteRequestBody = z.infer<typeof zodAcceptInviteRequestBody>

export async function acceptInvite(formData: AcceptInviteRequestBody): Promise<Result<void>> {
  try {
    const data = zodAcceptInviteRequestBody.parse(formData)
    const token = await prismaClient.token.findFirst({
      where: {value: data.token}
    })
    if (!token) {
      return {
        data: null,
        error: 'Sign up failed'
      }
    }
    const existingUsername = await prismaClient.user.findFirst({
      where: {username: data.username}
    })
    if (existingUsername) {
      return {
        data: null,
        error: 'Sign up failed'
      }
    }
    const salt = randomBytes(16).toString('hex');
    const hash = hashString(data.password, salt)
    const user = await prismaClient.user.update({
      where: {uuid: token.userUuid},
      data: {
        salt,
        hash,
        username: data.username
      }
    })
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    session.uuid = user.uuid;
    session.organisationUuid = token.organisationUuid
    session.email = user.email
    await session.save();
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Sign up failed'
    }
  }
  redirect('/')
}