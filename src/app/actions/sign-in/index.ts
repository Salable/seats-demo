'use server'
import {z} from "zod";
import {validateHash} from "@/utils/validate-hash";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {prismaClient} from "../../../../prisma";
import {redirect} from "next/navigation";
import {env} from "@/app/environment";

export type Session = {
  uuid: string;
  email: string;
  organisationUuid: string;
}

const zodSignInRequestBody = z.object({
  username: z.string(),
  password: z.string(),
});
type SignInRequestBody = z.infer<typeof zodSignInRequestBody>


export async function signIn(formData: SignInRequestBody) {
  try {
    const data = zodSignInRequestBody.parse(formData)
    const user = await prismaClient.user.findUnique({
      where: {username: data.username},
      include: {organisations: true}
    })

    if (!user || !user.salt || !user.hash) {
      return {
        data: null,
        error: 'Sign in failed'
      }
    }

    const validLogin = validateHash(data.password, user.salt, user.hash)

    if (!validLogin) {
      return {
        data: null,
        error: 'Sign in failed',
      }
    }

    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    session.uuid = user.uuid;
    session.email = user.email
    session.organisationUuid = user.organisations[0].organisationUuid

    await session.save();
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Sign in failed'
    }
  }

  redirect('/')
}