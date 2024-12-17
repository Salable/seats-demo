'use server'
import {z} from "zod";
import {salableApiBaseUrl} from "@/app/constants";
import {env} from "@/app/environment";
import {getErrorMessage} from "@/app/actions/get-error-message";
import {revalidatePath} from "next/cache";

const zodUpdateLicenseRequestBody = z.object({
  uuid: z.string().uuid(),
  granteeId: z.string().nullable(),
});
type UpdateLicenseRequestBody = z.infer<typeof zodUpdateLicenseRequestBody>

export async function updateLicense(formData: UpdateLicenseRequestBody, revalidatePage: string) {
  try {
    const data = zodUpdateLicenseRequestBody.parse(formData)
    const res = await fetch(`${salableApiBaseUrl}/licenses/${data.uuid}`, {
      method: 'PUT',
      headers: {
        'x-api-key': env.SALABLE_API_KEY,
        version: 'v2',
      },
      cache: "no-store",
      body: JSON.stringify({
        granteeId: data.granteeId,
      })
    })
    if (!res.ok) {
      const error = await getErrorMessage(res)
      console.log(error)
      return {
        data: null,
        error: 'Failed to update license'
      }
    }
  } catch (error) {
    console.log(error)
    return {
      data: null,
      error: 'Failed to update license'
    };
  }
  revalidatePath(revalidatePage)
}