import type { Metadata } from "next";
import SettingsForm from "./settings-form";

export const metadata: Metadata = {
  title: "Account Settings | Profile Update",
  description: "Update your profile details, including name, email, website, and bio.",
};

export default function SettingsPage() {
  return <SettingsForm />;
}
