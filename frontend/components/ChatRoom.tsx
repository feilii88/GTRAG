"use client"
import React, { useState, useRef, useEffect } from "react";
import { FileUpload, FileUploadUploadEvent } from "primereact/fileupload";
import { Button } from "primereact/button";
import { Panel, PanelFooterTemplateOptions, PanelHeaderTemplateOptions } from 'primereact/panel';
import { InputText } from "primereact/inputtext";
import { ScrollPanel } from "primereact/scrollpanel";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import toast from "react-hot-toast";
import axios from "axios";

import { BACKEND_URL, WS_BACKEND_URL } from "@/utils/constants";
import MessageBox from "@/components/MessageBox";

import 'primeicons/primeicons.css';

import './style.css';

interface Message {
    content: string;
    role: number; // true for user, false for bot
    citation: string;
}

interface Question {
    content: string;
    read: boolean;
}

const ChatRoom = () => {
    const [uploaded, setUploaded] = useState(false)
    const [processed, setProcessed] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [startingNewSession, setStartingNewSession] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)

    const [currentMessage, setCurrentMessage] = useState("")
    const [currentCitation, setCurrentCitation] = useState("")
    const [assistantId, setAssistantId] = useState("")
    const [sessionId, setSessionId] = useState("")
    const [threadId, setThreadId] = useState("")

    const [messages, setMessages] = useState<Message[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentHeader, setCurrentHeader] = useState("")
    const [currentPageNumber, setCurrentPageNumber] = useState("")

    const [socket, setSocket] = useState<WebSocket|null>(null)
    const [connected, setConnected] = useState(false)

    const fileUploadRef = useRef<FileUpload|null>(null)
    const acceptRef = useRef<((thread_id:string)=>void)|undefined>()

    useEffect(() => {
        const ws = initWebSocket()
    
        // Cleanup function
        return () => {
          ws.close();
        };
    }, []);

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const accept = (thread_id: string) => {
            const promise = axios.post(`${BACKEND_URL}chat/generate-questions`, {
                assistant_id: assistantId,
                session_id: sessionId,
                thread_id: thread_id.length?thread_id:threadId,
            }).then(res => {
                setQuestions(res.data.map((question:string) => ({ "content": question, "read": false})))
            })
            toast.promise(promise, {
                loading: 'Generating Questions',
                success: (data) => 'Generating questions complete',
                error: (error) => 'Error occured'
            })
        }
        acceptRef.current = accept
    }, [assistantId, sessionId, threadId])

    const initWebSocket = () => {
        const ws = new WebSocket(`${WS_BACKEND_URL}chat/msg`);
    
        ws.onopen = () => {
          setSocket(ws)
          setConnected(true)
        };
    
        ws.onmessage = (event) => {
            const res = JSON.parse(event.data)
            if (res.type === "answer") {
                setMessages(prevMessages => [
                    ...prevMessages.slice(0, prevMessages.length-1),
                    {
                        content: prevMessages[prevMessages.length-1].content + res.content,
                        role: -2,
                        citation: ""
                    }
                ])
            }
            if (res.type === "citation") {
                setMessages(prevMessages => [
                    ...prevMessages.slice(0, prevMessages.length-1),
                    {
                        content: prevMessages[prevMessages.length-1].content,
                        role: -2,
                        citation: prevMessages[prevMessages.length-1].citation + res.content
                    }
                ])
            }
            if (res.type === "end") {
                setMessages(prevMessages => [
                    ...prevMessages.slice(0, prevMessages.length-1),
                    {
                        content: prevMessages[prevMessages.length-1].content,
                        role: 0,
                        citation: prevMessages[prevMessages.length-1].citation
                    }
                ])
                setQuestions(prevQuestions => {
                    if (prevQuestions[0]?.read && prevQuestions[1]?.read && prevQuestions[2]?.read)
                        confirmContinue()
                    return prevQuestions
                })
            }
        };
    
        ws.onclose = () => {
          setConnected(false)
        };

        return ws;
    }

    const handleUpload = (event: FileUploadUploadEvent) => {
        toast.success("Upload completed");

        const response = JSON.parse(event.xhr.response)

        setAssistantId(response.assistant_id)
        setSessionId(response.session_id)

        setUploaded(true);
    }

    const handleProcess = () => {
        setProcessing(true)
        try {
            axios.post(`${BACKEND_URL}chat/process`,
                {
                    assistant_id: assistantId,
                    session_id: sessionId,
                }
            )
            .then(res => {
              if (res.status === 200) {
                setThreadId(String(res.data.thread_id))

                setProcessed(true);

                if (acceptRef && acceptRef.current)
                    acceptRef.current(res.data.thread_id)
              }
              setProcessing(false)
            })
        } catch (error) {
            toast.error("Error, try again")
            console.log(error);
            setProcessing(false)
        }
    }

    const handleSend = (event: React.KeyboardEvent<HTMLInputElement> | null) => {
        if (currentMessage === "")
            return;

        if (event === null || (event && 'keyCode' in event && event.key === 'Enter')) {
            sendMessage(currentMessage, -1)

            setCurrentMessage("")
        }
    }

    const handleClickCitation = (citation: string) => {
        extractCitation(citation)
        setModalVisible(true)
    }

    const handleQuestionClick = (index: number) => {
        sendMessage(questions[index].content, index)
    }

    const scrollToBottom = () => {
        document.getElementsByClassName("p-scrollpanel-content")[0].scrollTop = document.getElementsByClassName("p-scrollpanel-content")[0].scrollHeight
    }
    
    const sendMessage = (message: string, index: number) => {
        if (!connected) {
            initWebSocket()
            toast.error("WebSocket Connection Failed")
            return;
        }

        if (messages.length && messages[messages.length-1].role < 0) {
            toast.success("Loading... Please wait")
            return;
        }

        if (index >= 0) {
            questions[index].read = true
            setQuestions(questions)
        }

        setMessages(prevMessages => [
            ...prevMessages,
            {
                content: message,
                role: 1,
                citation: ""
            },
            {
                content: "",
                role: -1,
                citation: ""
            }
        ])

        try {
            const params = {
                assistant_id: assistantId,
                session_id: sessionId,
                thread_id: threadId,
                content: `${message}
                -------------
                Don't produce file citations.
                If your answer is really based on the real quote of pdf content, include references like below.
                The reference content should have more than 5 sentences.
                Include references after the answer with 5 stars at the beginning in this format:
                *****
                # File name
                ## Page Number (ex. Page 3)
                ### Exact contents of the references that is a direct quote from the uploaded file`
            }
            if (connected)
                socket?.send(JSON.stringify(params))
        } catch (error) {
            toast.error("Network Error")
            console.log(error);
        }
    }

    const startNewSession = () => {
        setStartingNewSession(true)

        axios.post(`${BACKEND_URL}chat/new-session`, {
            assistant_id: assistantId,
            session_id: sessionId,
            thread_id: threadId,
        })
        .then(res => {
            if (res.status === 400) {
                toast.error("Unable to initialize")
            }
            if (res.status === 200) {
                toast.success("Initialize successfully");

                setUploaded(false)
                setProcessed(false)

                setAssistantId("")
                setSessionId("")
                setThreadId("")
                setMessages([])
                setQuestions([])

                fileUploadRef.current?.clear()
            }
            setStartingNewSession(false)
        })
    }

    const clearChatHistory = () => {
        setClearing(true)
        axios.post(`${BACKEND_URL}chat/clear-history/${threadId}`)
        .then(res => {
            if (res.status === 400) {
                toast.error("Unable to clear history")
            }
            if (res.status === 200) {
                toast.success("Clear history successfully");

                setThreadId(String(res.data))
                setMessages([])
            }
            setClearing(false)
        })
    }

    const extractCitation = (citation: string) => {
        setCurrentHeader(citation.slice(citation.indexOf("#")+1, citation.indexOf("##")))
        setCurrentPageNumber(citation.slice(citation.indexOf("##")+2, citation.indexOf("###")))
        setCurrentCitation(citation.slice(citation.indexOf("###")+3))
    }

    const headerTemplate = (options: PanelHeaderTemplateOptions) => {
        const className = options.className;

        return (
            <div className={className} style={{ width: "100%" }}>
                <div>
                    <h1 style={{margin:"0"}}>Welcome to GTRAG Chatbot 🤖</h1>
                    <h3 style={{margin:"0"}}>Upload any document file types</h3>
                </div>
            </div>
        );
    };

    const footerTemplate = (options: PanelFooterTemplateOptions) => {
        const className = `${options.className} flex flex-wrap align-items-center justify-content-between`;

        return (<div className={className} style={{display:"flex", flexDirection:"column"}}>
            <div style={{display:"flex", flexDirection:"row", justifyContent:"space-between", marginBottom:"10px", width: "100%"}}>
                {questions.map((question, index) => (
                    <Button key={index} disabled={questions[index].read} severity="info" text raised style={{width:"30%",fontSize:"20px"}} onClick={() => handleQuestionClick(index)} >{question.content}</Button>
                ))}
            </div>
            <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
                <div className="p-inputgroup flex-1">
                    <InputText placeholder="Your questions here" disabled={!processed} value={currentMessage} onKeyDown={handleSend} onChange={e => setCurrentMessage(e.currentTarget.value)} />
                    <Button icon="pi pi-send" className="p-button-success" disabled={!processed} onClick={() => handleSend(null)} />
                </div>
            </div>
        </div>
        );
    };

    const confirmContinue = () => {
        confirmDialog({
            message: 'Do you want to continue asking questions?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'accept',
            accept: () => {if(acceptRef && acceptRef.current) acceptRef.current("")},
            reject: () => {}
        });
    };

    return (
        <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
            <ConfirmDialog />
            <Dialog header={currentHeader} visible={modalVisible} style={{ width: '50vw' }} onHide={() => {if (!modalVisible) return; setModalVisible(false); }}>
                <p className="m-0" style={{lineHeight:"1.5"}}>
                    {currentCitation}
                </p>
                <div style={{width:"100%",alignContent:"center"}}>
                    {currentPageNumber}
                </div>
            </Dialog>
            <div style={{ display: 'flex', flexDirection: 'row', flex: "1" }}>
                <div style={{ flex: "2", padding: "5px" }}>
                    <FileUpload ref={fileUploadRef} style={{ margin: "5px" }} name="files" url={`${BACKEND_URL}chat/upload`} disabled={uploaded} multiple accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/x-python,application/x-python-code,application/javascript,text/html,text/css,application/json,text/plain" onUpload={handleUpload} maxFileSize={1000000000} emptyTemplate={<>
                        <p className="m-0">- Text files (e.g. TXT, RTF)</p>
                        <p className="m-0">- Documents (e.g. PDF, DOC, DOCX)</p>
                        <p className="m-0">- Presentations (e.g. PPT, PPTX)</p>
                        <p className="m-0">- Code files (e.g. PY, JS, HTML, CSS)</p>
                        <p className="m-0">- Data files (e.g. JSON)</p>
                    </>} />
                    <Button label="Process" severity="help" onClick={handleProcess} loading={processing} style={{ margin: "5px", width: "98%", display: `${uploaded&&!processed?"initial":"none"}` }}/>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                        <Button label="Start New Session" onClick={startNewSession} loading={startingNewSession} severity="danger" style={{ flex: "1", margin: "5px", display: `${processed?"initial":"none"}` }}/>
                        <Button label="Clear Chat History" onClick={clearChatHistory} loading={clearing} severity="warning" style={{ flex: "1", margin: "5px", display: `${processed?"initial":"none"}` }}/>
                    </div>
                </div>
                <div style={{ flex: "5", display: "flex", paddingTop: "10px"}}>
                    <div style={{ flex: "1", display: "none" }}>
                        Column 2
                    </div>
                    <div style={{ flex: "1", height: "100%" }}>
                        <Panel headerTemplate={headerTemplate} footerTemplate={footerTemplate} style={{ height: "100%" }}>
                            <ScrollPanel style={{ width: '100%', height: '100%' }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxHeight: "100px" }}>
                                    {processed?(<MessageBox content={"Hello! How can I help you today?"} role={0} citation="" onClickCitation={handleClickCitation}/>):(<></>)}
                                    {messages.map((msg, index) => (
                                        <MessageBox key={index} content={msg.content} role={msg.role} citation={msg.citation} onClickCitation={handleClickCitation} />
                                    ))}
                                    <div style={{ visibility: "hidden" }}>a</div>
                                </div>
                            </ScrollPanel>
                        </Panel>
                    </div>
                </div>  
            </div>
        </div>
    );
};

export default ChatRoom;
