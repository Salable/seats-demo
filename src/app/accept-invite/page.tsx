import {AcceptInviteForm} from "@/components/forms/accept-invite-form";
import {Result} from "@/app/actions/checkout-link";
import {Organisation} from "@prisma/client";
import {prismaClient} from "../../../prisma";
import {FetchError} from "@/components/fetch-error";

export const metadata = {
  title: 'Accept Invite',
}

export default async function AcceptInvite({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const { token } = await searchParams
  const organisation = await getOrganisation(token)
  return (
    <>
      <main>
        <div className="w-full font-sans text-sm">
          <div className='max-w-[500px] m-auto'>
            {organisation.data ? (
              <AcceptInviteForm organisationName={organisation.data.name}/>
            ) : organisation.error ? (
              <FetchError error={organisation.error}/>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

async function getOrganisation(token: string): Promise<Result<Organisation>> {
  try {
    const getToken = await prismaClient.token.findFirst({
      where: {value: token},
      include: {organisation: true}
    });
    if (!getToken) {
      return {
        data: null,
        error: 'Organisation not found'
      }
    }
    if (!getToken.organisation) {
      return {
        data: null,
        error: 'Failed to fetch organisation'
      }
    }
    return {
      data: getToken.organisation,
      error: null
    }
  } catch (e) {
    console.log(e)
    return {
      data: null,
      error: 'Failed to fetch organisation',
    }
  }
}