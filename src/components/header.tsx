'use server'
import Link from "next/link";
import {SalableLogo} from "@/components/salable-logo";
import {Dropdown} from "@/components/dropdown";
import {getSession} from "@/fetch/session";
import {getOneUser} from "@/fetch/users";

export const Header = async () => {
  const session = await getSession();
  if (!session?.uuid) {
    return (
      <Link className='p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-800 transition w-full text-center text-sm' href="/sign-in">Sign in</Link>
    )
  }
  const user = await getOneUser(session.uuid, session.organisationUuid);

  return (
    <header className='bg-white px-6'>
      <div className='max-w-[1500px] m-auto py-4 flex justify-between items-center'>
        <Link className='flex items-center' href='/'>
          <div className='w-[30px] mr-2'><SalableLogo/></div>
          <span>Salable Per Seat Demo</span>
        </Link>
        <div>
          <div className="flex justify-between items-center">
            {user.data ? (
              <Dropdown user={user.data} />
            ) : user.error ? (
              <span className='text-red-600 text-sm'>{user.error}</span>
            ) : (
              <Link className='p-3 text-white rounded-md leading-none bg-blue-700 hover:bg-blue-800 transition w-full text-center text-sm' href="/sign-in">Sign in</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}