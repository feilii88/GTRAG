"use client"
import React from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "primereact/button";

import CopyButton from "./CopyButton";

interface MessageBoxProps {
    content: string,
    role: number,
    citation: string,
    onClickCitation: (citation: string) => void,
}

const LoadingDots = () => {
    return (
        <div style={{display: "flex", justifyContent: "center", alignItems: "center" }} >
            <div style={{width: "10px", height: "10px", margin: "0 4px", borderRadius: "50%", backgroundColor: "#0070f3", animation: "bounce 0.5s infinite alternate" }}></div>
            <div style={{width: "10px", height: "10px", margin: "0 4px", borderRadius: "50%", backgroundColor: "#0070f3", animation: "bounce 0.5s infinite alternate", animationDelay: "0.2s" }}></div>
            <div style={{width: "10px", height: "10px", margin: "0 4px", borderRadius: "50%", backgroundColor: "#0070f3", animation: "bounce 0.5s infinite alternate", animationDelay: "0.4s" }}></div>
        </div>
    );
};


const MessageBox: React.FC<MessageBoxProps> = ({content, role, citation, onClickCitation}) => {
    if (role === 1)
        return <div className="messageBox" style={{ width: "100%", display: "flex", justifyContent: "end" }}>
            <div style={{ display: "flex", flexDirection: "row-reverse", width: "60%", marginTop: "5px", marginBottom: "5px" }}>
                <img src="/user.jpeg" width={40} height={40} style={{ marginTop: "8px" }}/>
                <div className="messageBoxWrapper" style={{ marginRight: "10px", backgroundColor: '#ccf7ff' }}>
                    <p style={{ margin: "5px", lineHeight: "1.5" }}>
                        {content}
                    </p>
                </div>
            </div>
        </div>;
    else if (role === 0 || role === -2)
        return <div className="messageBox" style={{ display: "flex", width: "60%", marginTop: "5px", marginBottom: "5px" }}>
            <img src="/chatbot.jpg" width={40} height={45} style={{ marginTop: "10px" }}/>
            <div className="messageBoxWrapper" style={{ marginLeft: "10px", backgroundColor: '#f1f1f1' }}>
                <ReactMarkdown>
                    {content}
                </ReactMarkdown>
                {citation?.length?(<div style={{display:"flex",flexDirection:"row",justifyContent:"space-between",alignItems:"center",width:"100%"}}>
                    {role===-2?(<p>Loading Citation...</p>):(<Button link onClick={() => {onClickCitation(citation)}}>【{citation.slice(citation.indexOf("##")+7, citation.indexOf("###")-1)}:0†{citation.slice(citation.indexOf("#")+1, citation.indexOf("##"))}】</Button>)}
                    <CopyButton text={content} />
                </div>):(<></>)}
            </div>
        </div>;
    else
        return <div className="messageBox" style={{ display: "flex", width: "60%", marginTop: "5px", marginBottom: "5px" }}>
        <img src="/chatbot.jpg" width={40} height={45} style={{ marginTop: "8px" }}/>
        <div className="messageBoxWrapper" style={{ marginLeft: "10px", backgroundColor: '#f1f1f1', alignItems: "center" }}>
            <LoadingDots />
        </div>
    </div>;
}

export default MessageBox