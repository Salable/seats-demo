import {
  SalableParseError,
  SalableRequestError,
  SalableResponseError,
  SalableUnknownError,
  SalableValidationError
} from "@salable/node-sdk";

export const handleSalableError = (e: unknown) => {
  const err = e as Error;
  console.log(e)
  if (err instanceof SalableValidationError) {
    console.log({
      code: err.code,
      message: err.data
    })
  }
  if (err instanceof SalableResponseError) {
    console.log({
      code: err.code,
      message: err.data,
    })
  }
  if (err instanceof SalableRequestError) {
    console.log({
      code: err.code,
      message: err.error,
    })
  }
  if (err instanceof SalableParseError) {
    console.log({
      code: err.code,
      message: err.error,
    })
  }
  if (err instanceof SalableUnknownError) {
    console.log({
      code: err.code,
      message: err.error,
    })
  }
}