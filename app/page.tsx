"use client";
import HomeComponent from "@/components/Home";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const allParams = Object.fromEntries(searchParams.entries());
  return <HomeComponent allParams={allParams} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsHandler />
    </Suspense>
  );
}
