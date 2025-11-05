/*
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-password-reset-recovery-part-3-of-3-0859f89a9ad1
 */

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash;
            const params = new URLSearchParams(hash.substring(1));
            const token = params.get("access_token");
            const rToken = params.get("refresh_token");

            if (token && rToken) {
                setAccessToken(token);
                setRefreshToken(rToken);
            } else {
                toast.error("Missing tokens in URL.");
            }
        }
    }, []);

    async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        // Validate new password
        if (newPassword.length < 8) {
            toast.error("Password must be at least 6 characters long.");
            setIsSubmitting(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch("/api/auth/update-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    password: newPassword,
                    access_token: accessToken,
                    refresh_token: refreshToken,
                }),
            });
            const result = await res.json();
            if(result.error) {
                toast.error(result.error);
            } else {
                toast.success("Password updated successfully.");
                router.push("/auth/signin");
            }
        } catch (error) {
            console.error("Error updating password: ", error);
            toast.error("Unexpected error occured.");
        } finally {
            setIsSubmitting(false);
        }
    }
}