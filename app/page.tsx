"use client";
import HomeComponent from "@/components/Home";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
  const searchParams = useSearchParams();
  const allParams = Object.fromEntries(searchParams.entries());

  return <HomeComponent allParams={allParams} />;
}
