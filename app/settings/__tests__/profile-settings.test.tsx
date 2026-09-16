import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProfileForm from "../ProfileForm";
import { validateProfileData, ProfileFormData } from "../validation";

describe("User Profile Settings Validation & Action Unit Tests", () => {
  it("1. Valid submission succeeds", () => {
    const validData: ProfileFormData = {
      name: "John Doe",
      email: "john.doe@example.com",
      website: "https://example.com",
      bio: "Hello, world! I am a web developer.",
    };

    const result = validateProfileData(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("2. Empty Full Name fails", () => {
    const dataWithEmptyName: ProfileFormData = {
      name: "",
      email: "john.doe@example.com",
      website: "https://example.com",
      bio: "Some bio",
    };

    const result = validateProfileData(dataWithEmptyName);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.name).toContain("required");
  });

  it("3. Whitespace-only Full Name fails", () => {
    const dataWithWhitespaceName: ProfileFormData = {
      name: "   ",
      email: "john.doe@example.com",
      website: "https://example.com",
      bio: "Some bio",
    };

    const result = validateProfileData(dataWithWhitespaceName);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.name).toContain("whitespace");
  });

  it("3b. Full Name over 50 characters fails", () => {
    const longName = "a".repeat(51);
    const dataWithLongName: ProfileFormData = {
      name: longName,
      email: "john.doe@example.com",
      website: "https://example.com",
      bio: "Some bio",
    };

    const result = validateProfileData(dataWithLongName);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.name).toContain("50 characters");
  });

  it("4. Invalid email format fails", () => {
    const dataWithInvalidEmail: ProfileFormData = {
      name: "Jane Doe",
      email: "invalid-email-address",
      website: "https://example.com",
      bio: "Some bio",
    };

    const result = validateProfileData(dataWithInvalidEmail);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toBeDefined();
    expect(result.errors.email).toContain("valid email");
  });

  it("5. Invalid website URL fails", () => {
    const dataWithInvalidWebsite: ProfileFormData = {
      name: "Jane Doe",
      email: "jane@example.com",
      website: "not-a-valid-url",
      bio: "Some bio",
    };

    const result = validateProfileData(dataWithInvalidWebsite);
    expect(result.isValid).toBe(false);
    expect(result.errors.website).toBeDefined();
    expect(result.errors.website).toContain("valid URL");
  });

  it("6. Bio over 300 characters fails", () => {
    const longBio = "a".repeat(301);
    const dataWithLongBio: ProfileFormData = {
      name: "Jane Doe",
      email: "jane@example.com",
      website: "https://example.com",
      bio: longBio,
    };

    const result = validateProfileData(dataWithLongBio);
    expect(result.isValid).toBe(false);
    expect(result.errors.bio).toBeDefined();
    expect(result.errors.bio).toContain("300 characters");
  });
});

describe("ProfileForm Component UI & Accessibility Tests", () => {
  it("renders form inputs with associated labels and live character counter", () => {
    render(<ProfileForm />);

    // Labels linked via htmlFor / id
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const websiteInput = screen.getByLabelText(/Website/i);
    const bioTextarea = screen.getByLabelText(/Bio/i);

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(websiteInput).toBeInTheDocument();
    expect(bioTextarea).toBeInTheDocument();

    // Check live character counter
    expect(screen.getByText("0 / 300")).toBeInTheDocument();

    fireEvent.change(bioTextarea, { target: { value: "Hello world!" } });
    expect(screen.getByText("12 / 300")).toBeInTheDocument();
  });

  it("(1) submitting with an empty name shows the required error", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "",
          email: "jane@example.com",
          website: "https://example.com",
          bio: "Developer",
        }}
      />
    );

    const nameInput = screen.getByRole("textbox", { name: /Full Name/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Full Name is required and cannot be empty or only whitespace.")
      ).toBeInTheDocument();
    });

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
  });

  it("(2) a name under 2 characters shows the min-length error", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "J",
          email: "jane@example.com",
          website: "https://example.com",
          bio: "Developer",
        }}
      />
    );

    const nameInput = screen.getByRole("textbox", { name: /Full Name/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Full Name must be at least 2 characters.")
      ).toBeInTheDocument();
    });

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
  });

  it("(3) an invalid email format shows the email error", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "Jane Doe",
          email: "not-a-valid-email",
          website: "https://example.com",
          bio: "Developer",
        }}
      />
    );

    const emailInput = screen.getByRole("textbox", { name: /Email Address/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Please enter a valid email address.")
      ).toBeInTheDocument();
    });

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", "email-error");
  });

  it("(4) an invalid website URL (missing http/https) shows the URL error", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "Jane Doe",
          email: "jane@example.com",
          website: "ftp://example.com",
          bio: "Developer",
        }}
      />
    );

    const websiteInput = screen.getByRole("textbox", { name: /Website/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Website URL must start with http:// or https://.")
      ).toBeInTheDocument();
    });

    expect(websiteInput).toHaveAttribute("aria-invalid", "true");
    expect(websiteInput).toHaveAttribute("aria-describedby", "website-error");
  });

  it("(5) typing over 300 characters in bio shows the character-limit error and warning styling", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "Jane Doe",
          email: "jane@example.com",
          website: "https://example.com",
        }}
      />
    );

    const bioTextarea = screen.getByRole("textbox", { name: /Bio/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    // Type 305 characters
    const overLimitBio = "A".repeat(305);
    fireEvent.change(bioTextarea, { target: { value: overLimitBio } });

    // Check warning counter and aria-invalid on input before submit
    const counter = screen.getByText("305 / 300");
    expect(counter).toBeInTheDocument();
    // Verify warning styling is applied (contains text-rose-600)
    expect(counter.className).toContain("text-rose-600");
    expect(bioTextarea).toHaveAttribute("aria-invalid", "true");

    // Submit the form
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("Bio must not exceed 300 characters.")
      ).toBeInTheDocument();
    });

    expect(bioTextarea).toHaveAttribute("aria-invalid", "true");
    expect(bioTextarea.getAttribute("aria-describedby")).toContain("bio-error");
  });

  it("(6) a fully valid submission does NOT show any error messages", async () => {
    render(
      <ProfileForm
        initialValues={{
          name: "Jane Doe",
          email: "jane@example.com",
          website: "https://example.com",
          bio: "Full stack developer passionate about clean UI.",
        }}
      />
    );

    const nameInput = screen.getByRole("textbox", { name: /Full Name/i });
    const emailInput = screen.getByRole("textbox", { name: /Email Address/i });
    const websiteInput = screen.getByRole("textbox", { name: /Website/i });
    const bioTextarea = screen.getByRole("textbox", { name: /Bio/i });
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    fireEvent.click(submitButton);

    // Verify success banner appears
    await waitFor(() => {
      expect(
        screen.getByText("Profile updated successfully!")
      ).toBeInTheDocument();
    });

    // Check that none of the inputs have aria-invalid="true"
    expect(nameInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(websiteInput).toHaveAttribute("aria-invalid", "false");
    expect(bioTextarea).toHaveAttribute("aria-invalid", "false");

    // Verify no error message texts exist
    expect(screen.queryByText(/Full Name is required/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Full Name must be at least/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Please enter a valid email address/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Website URL must start with/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bio must not exceed/i)).not.toBeInTheDocument();
  });
});
