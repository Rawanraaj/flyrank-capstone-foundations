"use server";

import { validateProfileData, ProfileFormData, ProfileFormState } from "./validation";

export async function updateProfileAction(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const name = (formData.get("name") as string) ?? "";
  const email = (formData.get("email") as string) ?? "";
  const website = (formData.get("website") as string) ?? "";
  const bio = (formData.get("bio") as string) ?? "";

  const values: ProfileFormData = { name, email, website, bio };
  const { isValid, errors } = validateProfileData(values);

  if (!isValid) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors,
      values,
    };
  }

  return {
    success: true,
    message: "Profile updated successfully!",
    errors: {},
    values,
  };
}
