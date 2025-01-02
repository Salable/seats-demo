'use server'
import {randomBytes} from "crypto";
import {hashString} from "@/utils/hash-string";
import {getIronSession} from "iron-session";
import {cookies} from "next/headers";
import {Session} from "@/app/actions/sign-in";
import {z} from "zod";
import {prismaClient} from "../../../../prisma";
import {redirect} from "next/navigation";
import {getCheckoutLink} from "@/app/actions/checkout-link";
import {env} from "@/app/environment";

const signUpRequestBody = z.object({
  organisationName: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});

type SignUpRequestBody = z.infer<typeof signUpRequestBody>

export async function signUp(formData: SignUpRequestBody, planUuid: string | null) {
  let checkoutUrl: string | null = null
  try {
    const data = signUpRequestBody.parse(formData);
    const existingOrganisation = await prismaClient.organisation.findUnique({
      where: {name: data.organisationName},
      include: {
        users: {
          where: {
            user: {
              is: {
                OR: [
                  {email: data.email},
                  {username: data.username},
                ],
              }
            }
          }
        }
      }
    })
    if (existingOrganisation?.uuid) {
      return {
        data: null,
        error: 'Organisation already exists'
      }
    }
    if (existingOrganisation?.users.length) {
      return {
        data: null,
        error: 'Sign up failed'
      }
    }

    const salt = randomBytes(16).toString('hex');
    const hash = hashString(data.password, salt)
    const organisation = await prismaClient.organisation.create({
      data: {
        name: formData.organisationName,
        users: {
          create: {
            isAdmin: true,
            user: {
              create: {
                username: data.username,
                email: data.email,
                salt,
                hash
              }
            }
          }
        }
      },
      include: {users: true}
    })
    const session = await getIronSession<Session>(await cookies(), { password: env.SESSION_COOKIE_PASSWORD, cookieName: env.SESSION_COOKIE_NAME });
    session.uuid = organisation.users[0].userUuid;
    session.email = formData.email
    session.organisationUuid = organisation.uuid
    await session.save();
    if (planUuid) {
      const checkoutUrlData = await getCheckoutLink(session, planUuid)
      if (checkoutUrlData.data) {
        checkoutUrl = checkoutUrlData.data.checkoutUrl
      } else {
        return {
          data: null,
          error: checkoutUrlData.error
        }
      }
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Sign up failed'
    }
  }

  redirect(checkoutUrl ?? '/')
}