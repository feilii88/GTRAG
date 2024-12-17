"use client"
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'

import { BACKEND_URL } from "@/utils/constants";
import Spinner from "@/components/Spinner";

const RegisterPage = () => {
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace("/dashboard");
    }
  }, [sessionStatus, router]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const confirmPassword = e.target[2].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Weak Password");
      return;
    }

    if (confirmPassword !== password) {
      setError("Passwords are not equal");
      toast.error("Passwords are not equal")
      return;
    }

    try {
      axios.post("/api/register", { email, password })
      .then(res => {
        toast.success("Visit the link in the email to confirm your account");
        router.push("/login");
      })
      .catch(error => {
        toast.error("Email already exists");
        setError("Email already exists");
      });
    } catch (error) {
      toast.error("Error, try again")
      setError("Error, try again");
      console.log(error);
    }
  };

  if (sessionStatus === "loading") {
    return <Spinner />;
  }
  return (
    sessionStatus !== "authenticated" && (
      // <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      //   <div className="flex justify-center flex-col items-center">
      //     <h2 className="mt-6 text-center text-3xl leading-9 tracking-tight text-gray-900">
      //       Sign up on our website
      //     </h2>
      //   </div>

      //   <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
      //     <div className="bg-white px-6 py-12 border border-gray-300 sm:rounded-lg sm:px-12">
      //       <form className="space-y-6" onSubmit={handleSubmit}>
      //         <div>
      //           <label
      //             htmlFor="email"
      //             className="block text-sm font-medium leading-6 text-gray-900"
      //           >
      //             Email address
      //           </label>
      //           <div className="mt-2">
      //             <input
      //               id="email"
      //               name="email"
      //               type="email"
      //               autoComplete="email"
      //               required
      //               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      //             />
      //           </div>
      //         </div>

      //         <div>
      //           <label
      //             htmlFor="password"
      //             className="block text-sm font-medium leading-6 text-gray-900"
      //           >
      //             Password
      //           </label>
      //           <div className="mt-2">
      //             <input
      //               id="password"
      //               name="password"
      //               type="password"
      //               autoComplete="current-password"
      //               required
      //               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      //             />
      //           </div>
      //         </div>

      //         <div>
      //           <label
      //             htmlFor="confirmpassword"
      //             className="block text-sm font-medium leading-6 text-gray-900"
      //           >
      //             Confirm password
      //           </label>
      //           <div className="mt-2">
      //             <input
      //               id="confirmpassword"
      //               name="confirmpassword"
      //               type="password"
      //               autoComplete="current-password"
      //               required
      //               className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
      //             />
      //           </div>
      //         </div>

      //         <div>
      //           <button
      //             type="submit"
      //             className="flex w-full border border-black justify-center rounded-md bg-black mt-10 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-white transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      //           >
      //             Sign up
      //           </button>
      //           <p className="text-red-600 text-center text-[16px] my-4">
      //             {error && error}
      //           </p>
      //         </div>
      //       </form>
      //     </div>
      //   </div>
      // </div>
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={9} lg={7} xl={6}>
              <CCard className="mx-4">
                <CCardBody className="p-4">
                  <CForm onSubmit={handleSubmit}>
                    <h1>Register</h1>
                    <p className="text-body-secondary">Create your account</p>
                    {/* <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput placeholder="Username" autoComplete="username" />
                    </CInputGroup> */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>@</CInputGroupText>
                      <CFormInput placeholder="Email" floatingLabel="Email" autoComplete="email" />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        floatingLabel="Password"
                        autoComplete="new-password"
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Repeat password"
                        floatingLabel="Repeat password"
                        autoComplete="new-password"
                      />
                    </CInputGroup>
                    <div className="d-grid">
                      <CButton color="success" variant="outline" type="submit">Create Account</CButton>
                    </div>
                    <div className="d-grid mt-3">
                      <CButton color="info" variant="outline" onClick={() => router.push("/login")}>Go to Sign In</CButton>
                    </div>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    )
  );
};

export default RegisterPage;
