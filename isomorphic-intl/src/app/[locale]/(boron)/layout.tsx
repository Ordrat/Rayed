"use client";
import BoronLayout from "@/layouts/boron/boron-layout";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  return <BoronLayout>{children}</BoronLayout>;
}
