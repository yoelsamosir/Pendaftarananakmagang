import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const divisions = await prisma.division.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ divisions });
}
