import ProfileForm from "./ProfileForm";

export const metadata = {
  title: "Profile Settings",
  description: "Update your profile information",
};

export default function SettingsPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
      <ProfileForm />
    </main>
  );
}
