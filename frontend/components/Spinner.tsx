// components/Spinner.js  
export default function Spinner() {  
    return (  
      <div className="flex items-center justify-center min-h-screen bg-gray-100">  
        <div className="relative">  
          <div className="w-16 h-16 border-4 border-dashed border-t-blue-500 border-r-pink-600 border-b-green-400 border-l-yellow-500 rounded-full animate-spin"></div>  
        </div>  
      </div>  
    )  
  }