"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    async function handleReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                mode: "resetpassword",
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Reset password email sent.");
                router.push("/auth/signIn");
            }
        } catch (err) {
            console.error("Error during password reset: ", err);
            toast.error("An unexpected error occured");
        } finally {
            setIsSubmitting(false);
        }
    }
}