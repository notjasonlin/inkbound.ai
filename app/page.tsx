"use client";
import LoginButton from "@/components/LoginLogoutButton";
import Link from "next/link";
import Image from "next/image";
import { useUser } from '@/components/UserContext';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-between p-24">
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            {user ? `Welcome, ${user.user_metadata?.full_name || user.email || 'Athlete'}!` : 'Elevate Your Game: Your Journey to College Athletics Starts Here'}
          </p>
          <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
            <LoginButton />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center my-12">
          <Image
            src="/inkbound.png"
            alt="Inkbound Logo"
            width={300}
            height={300}
            className="mb-4"
          />
        </div>

        <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-2 lg:text-left gap-6">
          <Link
            href="/dashboard"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Dashboard{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              View your personalized athlete dashboard.
            </p>
          </Link>

          <Link
            href="/policy/privacy"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Privacy Policy{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Learn more about our privacy policy.
            </p>
          </Link>

          <Link
            href="/policy/terms-and-conditions"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              Terms and Conditions{" "}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              Learn more about our terms and conditions.
            </p>
          </Link>
        </div>
      </main>

      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 text-center">Your Path to College Athletics</h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Inkbound is the all-in-one platform designed for aspiring collegiate athletes. We simplify the recruitment process with a personalized, step-by-step approach tailored to each athlete's needs. From creating highlight reels to recommending potential schools, drafting customized emails and streamlining the entire outreach process, to monitoring replies, we use proprietary insights to ensure every athlete is supported throughout the complex process. Inkbound eliminates the uncertainty and anxiety from the recruitment process by offering easy-to-use, affordable features that help athletes seamlessly connect with their perfect-fit programs.
          </p>
        </div>
      </section>
    </div>
  );
}
