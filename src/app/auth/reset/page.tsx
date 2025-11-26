/* 
 * Author: Janna Dungao
 * Date: 11/02/25
 * Description: Front end for password reset requests
 * Sources:
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-js-part-1-of-3-76dc97d3a345 
 * https://medium.com/@sidharrthnix/next-js-authentication-with-supabase-and-nextauth-a-deep-dive-part-2-5fa43563989a
 */

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
                //redirect: false,
                email,
                mode: "resetpassword",
            });

            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Reset password email sent.");
                router.push("/auth/signin");
            }
        } catch (err) {
            console.error("Error during password reset: ", err);
            toast.error("An unexpected error occured");
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <div className="bg-yellow-50">
            <div className="flex h-screen flex-col justify-center items-center m-auto max-w-sm p-8">
                <form onSubmit={handleReset} className="flex flex-col justify-center items-center gap-4 border-gray-300 bg-white rounded-xl shadow-lg px-20 py-10">
                    <h2 className="font-semibold text-black">Enter email</h2>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border text-black border-gray-300 bg-sky-100 rounded p-2"
                        required
                    />
                    <button className="text-white bg-blue-600 rounded shadow-lg hover:bg-blue-700 p-2" type="submit">Submit</button>
                </form>
            </div>            
        </div>

    )
}