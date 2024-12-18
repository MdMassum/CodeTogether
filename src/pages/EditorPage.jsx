import React, { useEffect, useRef, useState } from "react";
import Client from "../components/client";
import Editor from "../components/Editor";
import {toast} from 'react-hot-toast'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Action";

// useRef hook --> The useRef Hook allows us to persist values between renders.
// It can be used to store a mutable value that does not cause a re-render when updated.

function EditorPage() {

    const location = useLocation();
    const { roomId } = useParams();
    const navigate = useNavigate();

    const socketRef = useRef(null);

    useEffect(()=>{
      const init = async () =>{
        socketRef.current = await initSocket();  // for establishing connection

        socketRef.current.on('connect_error',(err)=> handleError(err));   // handling socket errors
        socketRef.current.on('connect_failed',(err)=> handleError(err));

        function handleError(err){  
          console.log("Socket_Err", err);
          toast.error("Socket Connection Failed, Try Again later");
          navigate('/');
        }

        socketRef.current.emit(ACTIONS.JOIN,{    // sending message on joining
          roomId,
          username: location.state?.username,
        })
      }
      init();
    },[])

    const [clients, setClient] = useState([
        {socketId:1,username:"masum"},
        {socketId:2,username:"john"},
    ]);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }
    const leaveRoom = () =>{
        navigate('/');
    }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
          <h2 className='title'>CodeTogether</h2>
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>
      <div className="editorWrap">
        <Editor
        //   socketRef={socketRef}
        //   roomId={roomId}
        //   onCodeChange={(code) => {
        //     codeRef.current = code;
        //   }}
        />
      </div>
    </div>
  );
}

export default EditorPage;
