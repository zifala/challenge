import { NextResponse } from "next/server";
import countries from "../../../data/countries.json";

export async function GET() {
  return NextResponse.json(countries);
}


