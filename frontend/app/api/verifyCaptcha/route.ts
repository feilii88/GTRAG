"use server"

import { NextRequest, NextResponse } from 'next/server';
import axios from "axios"
import https from 'https';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { token } = data
    console.log(token)
    await verifyCaptcha(String(token))
    return NextResponse.json({ message: "success" }, { status: 200 })
  } catch(error) {
    console.log(error)
    return NextResponse.json({ message: "fail" }, { status: 401 })
  }
}

async function verifyCaptcha(token: string | null) {
  const httpsAgent = new https.Agent({ keepAlive: true });
  const axiosInstance = axios.create({  
    httpsAgent,  
    timeout: 10000,  // Optional, you can set the timeout as per your need  
  });
  const options = {
    host: 'www.google.com'
  }
  const res = await axiosInstance.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    options
  )
  console.log(res)
  if (res.data.success) {
    return "success!"
  } else {
    throw new Error("Failed Captcha")
  }
}