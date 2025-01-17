import {licenseCheck} from "@/fetch/licenses/check";
import React, {Suspense} from "react";
import {LicenseCheckResponse, StringGeneratorForm} from "@/components/forms/string-generator-form";
import {getSession} from "@/fetch/session";
import {bytes} from "@/app/constants";
import { Result } from "./actions/checkout-link";
import {FetchError} from "@/components/fetch-error";
import Link from "next/link";
import {LockIcon} from "@/components/icons/lock-icon";
import LoadingSpinner from "@/components/loading-spinner";
import {isUserAdmin} from "@/fetch/users";
import {getAllLicenses} from "@/fetch/licenses/get-all";

export const metadata = {
  title: 'Salable Per Seat Demo',
}

export default async function Home({searchParams}: {
  searchParams: Promise<Record<string, string>>
}) {
  return (
    <main>
      <div className='max-w-[1200px] m-auto text-sm'>
        <div className='mb-6'>
          <h1 className='text-4xl font-bold text-gray-900 mr-4 text-center'>
            Random String Generator
          </h1>
          <div className='mt-6'>
            <Suspense fallback={<Loading/>}>
              <StringGenerator search={await searchParams}/>
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

const StringGenerator = async ({search}: { search: Record<string, string> }) => {
  let isAdmin = false
  let check: Result<LicenseCheckResponse | null> = {
    data: null, error: null
  }
  const session = await getSession();
  if (search.planUuid && session?.uuid) {
    await new Promise<void>(async (resolve) => {
      while (true) {
        try {
          const licenses = await getAllLicenses({
            planUuid: search.planUuid,
            granteeId: session.uuid,
            status: 'ACTIVE'
          });
          if (licenses.error) break
          if (licenses.data?.data.find((l) => l.planUuid === search.planUuid)) {
            resolve()
            break
          }
          await new Promise(r => setTimeout(r, 500));
        } catch (e) {
          console.log(e)
          break
        }
      }
    })
  }
  if (session?.uuid) {
    isAdmin = await isUserAdmin(session.uuid, session.organisationUuid)
    check = await licenseCheck(session.uuid)
  }
  return (
    <>
      {!check.error ? (
        <>
          <StringGeneratorForm check={check.data} />
          {check.data && !check.data.capabilities.find((c) => c.capability === '128') ? (
            <div className='flex justify-center'>
              <div className='max-w-[400px] rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>
                  {isAdmin ? "Upgrade to Pro ": "Contact your organisation's admin to upgrade to Pro "}
                  to unlock <span className='font-bold'>128 Byte strings</span>
                </p>
                <div className='flex mt-2'>
                  {isAdmin ? (
                    <Link
                      href={'/dashboard/subscriptions'}
                      className='p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition'
                    >
                      Upgrade now
                    </Link>
                  ) : (
                    <Link
                      href='/dashboard/organisations'
                      className='inline-block p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition'
                    >
                      Organisation
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ) : null}
          {!session?.uuid || !check.data && isAdmin ? (
            <div className='flex justify-center max-w-[400px] mx-auto'>
              <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>To start creating secure strings subscribe to a plan from our pricing table and get started!</p>
                <div className='mt-3'>
                  <Link
                    href='/pricing'
                    className='inline-block p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition'
                  >
                    Pricing
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
          {session?.uuid && !check.data && !isAdmin ? (
            <div className='flex justify-center max-w-[400px] mx-auto'>
              <div className='rounded-md inline-flex flex-col mx-auto mt-6 p-3 border-2'>
                <p>Contact your organisation admin to get access</p>
                <div className='mt-3'>
                  <Link
                    href='/dashboard/organisations'
                    className='inline-block p-3 text-white rounded-md leading-none font-bold bg-blue-700 hover:bg-blue-800 transition'
                  >
                    Organisation
                  </Link>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <FetchError error={check.error}/>
      )}
    </>
  )
}

const Loading = () => {
  return (
    <div className='flex justify-center items-center'>
      <h2 className='text-center mr-2'>Bytes</h2>
      {bytes.map((size, i) => (
        <div
          className={`p-3 inline-flex items-center leading-none border-2 mr-2 rounded-md bg-gray-200`}
          key={`loading-${i}`}
        >
          {size}
          <div className='ml-1'><LockIcon height={14} width={14} fill='black'/></div>
        </div>
      ))}
      <div>
      <div className='h-[20px] w-[20px]'>
          <LoadingSpinner fill={'#000'} />
        </div>
      </div>
    </div>
  )
}