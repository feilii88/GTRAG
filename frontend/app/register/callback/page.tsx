"use client"
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from 'react';  
import axios from 'axios';  

import { BACKEND_URL } from "@/utils/constants";

const spinnerStyle = {  
  width: '4rem', // w-16  
  height: '4rem', // h-16  
  borderWidth: '4px', // border-4  
  borderStyle: 'dashed', // border-dashed  
  borderTopColor: '#3b82f6', // border-t-blue-500  
  borderRightColor: '#ec4899', // border-r-pink-600  
  borderBottomColor: '#10b981', // border-b-green-400  
  borderLeftColor: '#f59e0b', // border-l-yellow-500  
  borderRadius: '50%', // rounded-full  
  animation: 'spin 1s linear infinite', // animate-spin  
};  

// Adding custom keyframes for animate-spin inside a CSS stylesheet  
const globalStylesheet = `  
@keyframes spin {  
  from { transform: rotate(0deg); }  
  to { transform: rotate(360deg); }  
}  
`;  

const Spinner = () => (
  <div style={{display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#f3f4f6"}}>
    <div style={{position: "relative"}}>  
      <style>{globalStylesheet}</style>  
      <div style={spinnerStyle}></div>  
    </div>
  </div>
);  

const Callback = () => {  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {  

    const verifyEmail = async (email: string, token: string) => {  
      try {  
        const response = await axios.post(`${BACKEND_URL}user/verifyEmail`, {  
          params: { email, token }  
        });  

        if (response.data === "verified")
            router.push("/login")
        else
            router.push("/register")
        
      } catch (error) {  
        console.error('Authentication failed', error);  
      }  
    };  
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token && email) {
        verifyEmail(email, token)
    }
    else
      router.push("/register")
  }); // Depend only on router.query  

  return (
    <Spinner/>
  )

}  

export default Callback  