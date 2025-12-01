/* 
 * Author: Janna Dungao
 * Date: 11/02/25
 * Description: Frontend for update password page (reset password).
 * Sources:
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */

"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { databaseClient } from "@/app/utils/client";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function handlePasswordRecovery() {
            try {
                const code = searchParams.get("code"); // broken link
                if (!code) {
                    toast.error("Missing exchange code.");
                    setIsLoading(false);
                    return;
                }
                const { data, error } = await databaseClient.auth.exchangeCodeForSession(code); // make sure reset link not expired
                if (error) {
                    toast.error("Failed to verify reset link: ", error);
                    setIsLoading(false);
                    return;
                }
                if (data.session) {
                    toast.success("Ready to reset password.");
                    setIsReady(true);
                } else {
                    toast.error("Failed to establish session");
                }
            } catch (err) {
                toast.error("Unexpected error occurred");
            } finally {
                setIsLoading(false);
            }            
        }
        handlePasswordRecovery();
    }, [searchParams]);

    async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);
        // Check new inputted password & confirm
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long");
            setIsSubmitting(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            setIsSubmitting(false);
            return;
        }
        // error handling
        try {
            const { error } = await databaseClient.auth.updateUser({ 
                password: newPassword
            });
            if (error) {
                toast.error(error.message);
            } else {
                toast.success("Password updated.");
                await databaseClient.auth.signOut();
                router.push("/auth/signin"); // reroute to login page on successful password update
            }
        } catch (error) {
            console.error("Error updating password: ", error);
            toast.error("Unexpected error occured.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return(
        <div className="bg-yellow-50">
            <div className="flex h-screen flex-col justify-center items-center m-auto max-w-sm p-8">
                <form onSubmit={handleUpdatePassword} className="flex flex-col items-center justify-center gap-4 border-gray-300 bg-white rounded-xl shadow-lg text-black px-20 py-10">
                    <h2 className="font-semibold">Reset Password</h2>
                    {/* New password form */}
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="border border-gray-300 bg-sky-100 rounded p-2"
                        required
                    />
                    {/* confirmation form to assure passwords match */}
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="border border-gray-300 bg-sky-100 rounded p-2"
                        required
                    />
                    <button className="text-white bg-blue-600 rounded shadow-lg hover:bg-blue-700 p-2" type="submit">Submit</button>
                </form>
            </div>       
        </div>

    );
}