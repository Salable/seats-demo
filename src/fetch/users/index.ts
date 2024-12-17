import {prismaClient} from "../../../prisma";
import {Result} from "@/app/actions/checkout-link";
import {Prisma} from "@prisma/client";

export async function getOneUser(uuid: string, organisationUuid: string): Promise<Result<Prisma.UserGetPayload<{
  include: {organisations: true}
}> | null>> {
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        uuid
      },
      include: {
        organisations: {
          where: {
            organisationUuid
          }
        },
      }
    })
    return {
      data: user,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch users'
    }
  }
}

export async function getAllUsers(organisationUuid: string): Promise<Result<Prisma.UserGetPayload<{
  include: {
    tokens: true,
    organisations: true
  }
}>[]>> {
  try {
    const users = await prismaClient.user.findMany({
      where: {
        organisations: {
          every: {
            organisationUuid
          }
        }
      },
      include: {
        organisations: {
          where: {
            organisationUuid
          }
        },
        tokens: {
          where: {
            organisationUuid
          }
        }
      }
    })
    return {
      data: users,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch users'
    }
  }
}