'use server'
import {randomBytes} from "crypto";
import { z } from "zod";
import {prismaClient} from "../../../../prisma";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {salable} from "@/app/salable";

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
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: formData.email,
      },
      include: {
        organisations: {
          where: {
            organisationUuid: formData.organisationUuid
          }
        }
      }
    })
    if (!existingOrganisation) {
      return {
        data: null,
        error: 'Invite user failed'
      }
    }
    if (existingUser?.organisations.length) {
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
      await salable.licenses.update(data.licenseUuid, {
        granteeId: createToken.user.uuid
      })
    }
  } catch (error) {
    // handle salable error
    console.log(error)
    return {
      data: null,
      error: 'Failed to invite user'
    }
  }
  revalidatePath(revalidatePage)
  redirect(revalidatePage)
}