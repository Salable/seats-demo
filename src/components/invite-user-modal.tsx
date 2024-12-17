'use client'
import LoadingSpinner from "@/components/loading-spinner";
import React, {useRef} from "react";
import {useForm} from "react-hook-form";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {useOnClickOutside} from "usehooks-ts";
import {Session} from "@/app/actions/sign-in";
import {createToken} from "@/app/actions/invite-user";
import {appBaseUrl} from "@/app/constants";

type ModalFormValues = {
  email: string;
};

export const InviteUserModal = ({session}: {
  session: Session,
}) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const licenseUuid = searchParams.get("licenseUuid")
  const { register, reset, setError, handleSubmit, formState: { errors, isSubmitting } } = useForm<ModalFormValues>();
  const ref = useRef(null)

  const removeQueryParams = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("modalOpen")
    params.delete("licenseUuid")
    params.delete("subscriptionUuid")
    router.push(pathname + '?' + params.toString())
  }
  const clickOutside = () => {
    removeQueryParams()
    reset()
  }
  useOnClickOutside(ref, clickOutside)

  const onSubmit = handleSubmit(async (values) => {
    try {
      const inviteUser = await createToken({
        organisationUuid: session.organisationUuid,
        email: values.email,
        ...(licenseUuid && {licenseUuid})
      })
      if (!inviteUser.data) {
        setError("root.serverError", {
          type: "400",
          message: inviteUser.error ?? 'Invite user failed'
        })
        return
      }
      const link = `${appBaseUrl}/accept-invite?token=${inviteUser.data.token}`
      await navigator.clipboard.writeText(link);
      removeQueryParams()
    } catch (e) {
      console.log(e)
    }
  })

  return (
    <>
      {searchParams.get('modalOpen') ? (
        <div className='bg-gray-500/[.6] p-10 fixed top-0 left-0 w-full h-full flex justify-center items-center'>
          <div className='w-[500px] bg-white m-auto shadow p-6 rounded-lg' ref={ref}>
            <div className='mb-4'>
              <p>Submit the email of the user you want to invite to the seat.</p>
            </div>
            <form onSubmit={onSubmit} className='grid gap-3'>
              <fieldset>
                <input
                  type="email"
                  className='p-3 w-full border-2'
                  {...register("email", {
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email address",
                    },
                    required: {
                      value: true,
                      message: 'Email is required'
                    },
                  })}
                  placeholder="Email"
                />
                {errors.email && <p className='text-red-600'>{errors.email.message}</p>}
              </fieldset>

              <div>
                <button className={`p-4 text-white rounded-md leading-none bg-blue-700 flex items-center`}>
                  {isSubmitting ? <div className='w-[15px] mr-2'><LoadingSpinner fill="white"/></div> : ''} Send invite
                </button>
              </div>
              {errors.root?.serverError ? (
                <div className='bg-red-500 text-white p-2 rounded-sm'>
                  {errors.root?.serverError.message}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}