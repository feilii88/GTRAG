"use client";
import React, { useEffect, useState, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import ReCAPTCHA from "react-google-recaptcha"
import toast from "react-hot-toast";
import axios from "axios";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import Spinner from "@/components/Spinner";
import { cilLockLocked, cilEnvelopeClosed } from '@coreui/icons'

// import '@coreui/coreui-pro/dist/css/coreui.min.css'
// import "../globals.css";

import { BACKEND_URL } from "@/utils/constants"


const NextLoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  // const session = useSession();
  const { data: session, status: sessionStatus } = useSession();

  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const [isVerified, setIsverified] = useState<boolean>(false)

  async function handleCaptchaSubmission(token: string | null) {
    // Server function to verify captcha
    await axios.post("/api/verifyCaptcha", {token})
      .then(() => {setIsverified(true);})
      .catch(() => {setIsverified(false);})
  }

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    const loadCSS = (href: string): void => {  
      const link = document.createElement('link');  
      link.rel = 'stylesheet';  
      link.href = href;  
      link.id = 'coreui-css'; // Set an ID for easy removal later  
      document.head.appendChild(link);  
    };  

    // Load the CoreUI CSS  
    // loadCSS('@coreui/coreui-pro/dist/css/coreui.min.css');  

    // Cleanup function to remove the CSS when the component unmounts  
    return () => {  
      const link = document.getElementById('coreui-css');  
      if (link) {  
        document.head.removeChild(link);  
      }  
    }; 
  })

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
      if (res?.url) router.replace("/dashboard");
    } else {
      setError("");
      toast.success("Successful login");
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {  
    try {  
      const response = await axios.get(`${BACKEND_URL}user/google/login`)  
      const authUrl = response.data.auth_url  
      window.location.href = authUrl  
    } catch (error) {  
      console.error("Login failed", error)  
    }  
  }  


  if (sessionStatus === "loading") {
    return <Spinner />;
  }
  return (
    sessionStatus !== "authenticated" && isVerified && (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput placeholder="Email" autoComplete="email" required/>
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        required
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="success" style={{ width: '100%' }} type="submit" variant="outline">
                          Sign in
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="primary" style={{ width: '100%' }} variant="outline" onClick={() => router.push("/register")}>
                          Go to Sign up
                        </CButton>
                      </CCol>
                    </CRow>
                    <CRow className="mt-3">
                      <CCol>
                        <CButton
                          color="info"
                          style={{ width: '100%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
                          variant="outline"
                          onClick={handleGoogleSignIn}
                        >
                          <FcGoogle className="max-w-fit-content mr-2"/>
                          <div className="max-w-fit-content">Sign in with Google</div>
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h1>GTRAG</h1>
                    <p>
                      Advanced PDF chatbot designed to provide precise answers to questions about uploaded PDF documents. A powerful tool for users who need quick access to specific information within PDFs
                    </p>
                    {/* <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link> */}
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
    )
    ||
    sessionStatus !== "authenticated" && !isVerified && (
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center justify-content-center">
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          ref={recaptchaRef}
          onChange={handleCaptchaSubmission}
        />
      </div>
    )
  );
};

export default NextLoginPage;
