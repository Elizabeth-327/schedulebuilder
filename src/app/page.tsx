"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-screen p-4 bg-yellow-50">
      <div className="relative w-64 h-64">
        <img
          src="/imgs/jaydoc.png"
          alt="JayDoc"
          className="fixed top-10 left-16 w-44 h-auto"
        />

        <img
          src="/imgs/dorothy.png"
          alt="Dorothy"
          className="fixed bottom-10 left-16 w-64 h-auto"
        />
        <img
          src="/imgs/naismith.png"
          alt="Naismith"
          className="fixed bottom-40 left-75 w-64 h-auto"
        />
        <img
          src="imgs/sunflowers.png"
          alt="Sunflowers"
          className="fixed bottom-0 left-0 w-164 h-auto"
        />

      </div>
      <div className="flex flex-col items-start space-y-8 pl-200 pr-64">
        <h1 className="text-8xl font-bold font-sans drop-shadow-lg mb-6">
          KU Schedule Planner
        </h1>
        Yo gaba gaba 
        scooby doo
        <button
          className="px-6 py-3 bg-cyan-400 text-white font-sans rounded hover:bg-cyan-500"
          onClick={() => router.push("/schedule")}
        >
          Build Schedule
        </button>
      </div>
    </div>
  )
}