import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL } from "@/utils/constants";

export const POST = async (request: NextRequest) => {
  const { email, password } = await request.json();

  try {
    const res = await axios.post(`${BACKEND_URL}user/add-user`, {
      email,
      password
    })
    if (res.status === 200)
      return NextResponse.json({ message: "success" }, { status: 200 })
    if (res.status === 400)
      return NextResponse.json({ message: "failed" }, { status: 400 })
  } catch {
    return NextResponse.json({ message: "failed" }, { status: 400 })
  }
};