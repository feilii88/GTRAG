// components/CopyButton.js
import { useState } from 'react';

import toast from "react-hot-toast";

import './style.css'; // Assuming you create this CSS module

interface CopyButtonProps {
    text: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Copied to Clipboard")
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button className="copyButton" onClick={handleCopy}>
      {isCopied ? '✔ Copied!' : '📋 Copy'}
    </button>
  );
};

export default CopyButton;
