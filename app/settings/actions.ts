"use server";

export type ProfileState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: {
    name?: string;
    email?: string;
    bio?: string;
    website?: string;
  };
};

export async function updateProfile(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const bio = formData.get("bio") as string;
  const website = formData.get("website") as string;

  const errors: ProfileState["errors"] = {};

  // Validate required fields
  if (!name || name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (bio && bio.length > 300) {
    errors.bio = "Bio must be 300 characters or fewer.";
  }

  if (website && !/^https?:\/\/.+\..+/.test(website)) {
    errors.website = "Please enter a valid URL starting with http:// or https://";
  }

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Please fix the errors below.",
      errors,
    };
  }

  // Simulate a DB write
  await new Promise((resolve) => setTimeout(resolve, 800));

  console.log("Profile updated:", { name, email, bio, website });

  return {
    status: "success",
    message: "Your profile has been updated successfully!",
  };
}
