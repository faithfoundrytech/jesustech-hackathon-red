import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-cream-white dark:bg-deep-blue-grey">
      <div className="w-full max-w-md p-8">
        <SignUp signInUrl="/sign-in" redirectUrl="/home" />
      </div>
    </div>
  );
} 