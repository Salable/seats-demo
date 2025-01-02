'use client'
import {Resolver, useForm} from "react-hook-form";
import {useSearchParams} from "next/navigation";
import LoadingSpinner from "@/components/loading-spinner";
import React from "react";
import {acceptInvite} from "@/app/actions/accept-invite";
import {FetchError} from "@/components/fetch-error";

type FormValues = {
  username: string;
  email: string;
  password: string;
};

const resolver: Resolver<FormValues> = async (values) => {
  const errors = () => {
    const obj: Record<string, {
      type: string;
      message: string;
    }> = {}
    if (!values.username) {
      obj.firstName = {
        type: 'required',
        message: 'Username is required.',
      }
    }
    if (!values.password) {
      obj.password = {
        type: 'required',
        message: 'Password is required.',
      }
    }
    return obj
  }
  return {
    values: values ?? {},
    errors: errors(),
  };
};

export const AcceptInviteForm = ({organisationName}: {organisationName: string}) => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const licenseUuid = searchParams.get('licenseUuid')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting,  } } = useForm<FormValues>({ resolver });
  if (!token) {
    return (
      <FetchError error='Token is required' />
    )
  }
  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await acceptInvite({
        ...data,
        token,
        ...(licenseUuid && {licenseUuid})
      })
      if (res.error) {
        setError("root.serverError", {
          type: "400",
          message: res.error
        })
        return
      }
    } catch (e) {
      console.log(e)
    }
  });
  return (
    <div className='max-w-[500px] m-auto'>
      <div>
        <h1 className='text-3xl mb-4'>Join {organisationName}</h1>
        <form onSubmit={onSubmit} className='grid gap-3'>
          <fieldset>
            <input className='p-3 w-full' {...register("username")} placeholder="Username"/>
            {errors.username && <p className='text-red-600'>{errors.username.message}</p>}
          </fieldset>

          <fieldset>
            <input type="password" className='p-3 w-full' {...register("password")} placeholder="Password"/>
            {errors.password && <p className='text-red-600'>{errors.password.message}</p>}
          </fieldset>

          <div>
            <button
              className={`p-4 text-white rounded-md leading-none font-bold bg-blue-700`}
            >
              {!isSubmitting ? "Sign up" : <div className='w-[15px]'><LoadingSpinner fill="white"/></div>}
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
  )
}