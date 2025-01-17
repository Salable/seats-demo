'use server'
import {z} from "zod";
import {revalidatePath} from "next/cache";
import {salable} from "@/app/salable";

const zodUpdateLicenseRequestBody = z.object({
  uuid: z.string().uuid(),
  granteeId: z.string().nullable(),
});
type UpdateLicenseRequestBody = z.infer<typeof zodUpdateLicenseRequestBody>

export async function updateLicense(formData: UpdateLicenseRequestBody, revalidatePage: string) {
  try {
    const data = zodUpdateLicenseRequestBody.parse(formData)
    await salable.licenses.update(formData.uuid, {
      granteeId: data.granteeId,
    })
  } catch (error) {
    // handle salable error
    console.log(error)
    return {
      data: null,
      error: 'Failed to update license'
    };
  }
  revalidatePath(revalidatePage)
}