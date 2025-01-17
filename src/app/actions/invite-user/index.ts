'use server'
import {randomBytes} from "crypto";
import { z } from "zod";
import {prismaClient} from "../../../../prisma";
import {salableApiBaseUrl} from "@/app/constants";
import {env} from "@/app/environment";
import {getErrorMessage} from "@/app/actions/get-error-message";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";

const zodCreateTokenRequestBody = z.object({
  organisationUuid: z.string().uuid(),
  email: z.string(),
  licenseUuid: z.string().uuid().optional(),
});

type CreateTokenRequestBody = z.infer<typeof zodCreateTokenRequestBody>

export async function inviteUser(formData: CreateTokenRequestBody, revalidatePage: string) {
  try {
    const data = zodCreateTokenRequestBody.parse(formData)
    const existingOrganisation = await prismaClient.organisation.findUnique({
      where: {uuid: formData.organisationUuid},
    })
    if (!existingOrganisation) {
      return {
        data: null,
        error: 'Invite user failed'
      }
    }
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email: formData.email,
      }
    })
    if (existingUser) {
      return {
        data: null,
        error: 'Invite user failed'
      }
    }
    const token = randomBytes(32).toString('hex')
    const createToken = await prismaClient.token.create({
      data: {
        value: token,
        user: {
          create: {
            username: null,
            email: data.email,
            salt: null,
            hash: null,
            organisations: {
              create: {
                isAdmin: false,
                organisationUuid: formData.organisationUuid
              }
            }
          }
        },
        organisation: {connect: {uuid: formData.organisationUuid}}
      },
      include: {
        user: true,
      }
    })
    if (data.licenseUuid) {
      const updateLicense = await fetch(`${salableApiBaseUrl}/licenses/${data.licenseUuid}`, {
        method: "PUT",
        headers: {
          'x-api-key': env.SALABLE_API_KEY,
          version: 'v2',
        },
        body: JSON.stringify({
          granteeId: createToken.user.uuid
        })
      })
      if (!updateLicense.ok) {
        const error = getErrorMessage(updateLicense)
        console.log(error)
        return {
          data: null,
          error: 'Failed to invite user'
        }
      }
    }
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to invite user'
    }
  }
  revalidatePath(revalidatePage)
  redirect(revalidatePage)
}