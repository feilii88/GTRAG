"use client"
import Spinner from "@/components/Spinner";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  router.push("/login");

  return (
    <Spinner/>
  );
}
