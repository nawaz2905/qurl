import { Suspense } from "react";
import { AuthScreen } from "../login/page";

export default function SigninPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#fff8f2]" />}>
      <AuthScreen initialMode="signin" />
    </Suspense>
  );
}
