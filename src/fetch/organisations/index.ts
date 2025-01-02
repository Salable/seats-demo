import {prismaClient} from "../../../prisma";
import {Result} from "@/app/actions/checkout-link";
import {Organisation} from "@prisma/client";

export const getOneOrganisation = async (uuid: string): Promise<Result<Organisation | null>> => {
  try {
    const organisation = await prismaClient.organisation.findUnique({
      where: {uuid},
    })
    return {
      data: organisation,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch organisation'
    }
  }
}