export type ProfileFormData = {
  name: string;
  email: string;
  website?: string;
  bio?: string;
};

export type ProfileFormErrors = {
  name?: string;
  email?: string;
  website?: string;
  bio?: string;
};

export type ProfileFormState = {
  success?: boolean;
  message?: string;
  errors?: ProfileFormErrors;
  values?: ProfileFormData;
};

export function validateProfileData(data: ProfileFormData): { isValid: boolean; errors: ProfileFormErrors } {
  const errors: ProfileFormErrors = {};

  // Full Name validation
  const rawName = data.name ?? "";
  const trimmedName = rawName.trim();

  if (!rawName || trimmedName.length === 0) {
    errors.name = "Full Name is required and cannot be empty or only whitespace.";
  } else if (trimmedName.length < 2) {
    errors.name = "Full Name must be at least 2 characters.";
  } else if (trimmedName.length > 50) {
    errors.name = "Full Name must be at most 50 characters.";
  }

  // Email validation
  const trimmedEmail = (data.email ?? "").trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmedEmail) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(trimmedEmail)) {
    errors.email = "Please enter a valid email address.";
  }

  // Website validation
  const trimmedWebsite = (data.website ?? "").trim();
  if (trimmedWebsite !== "") {
    try {
      const parsedUrl = new URL(trimmedWebsite);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        errors.website = "Website URL must start with http:// or https://.";
      }
    } catch {
      errors.website = "Please enter a valid URL (e.g. https://example.com).";
    }
  }

  // Bio validation
  const bioContent = data.bio ?? "";
  if (bioContent.length > 300) {
    errors.bio = "Bio must not exceed 300 characters.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
