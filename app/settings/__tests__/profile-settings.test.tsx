import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
});
