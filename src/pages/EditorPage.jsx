import React, { useEffect, useRef, useState } from "react";
import Client from "../components/client";
import Editor from "../components/Editor";
import { toast } from "react-hot-toast";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { initSocket } from "../socket";
import ACTIONS from "../Action";

// useRef hook --> The useRef Hook allows us to persist values between renders.
// It can be used to store a mutable value that does not cause a re-render when updated.

function EditorPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {

    const initSocketConnection = async () => {

        try {

            if (socketRef.current) {
              console.log("Socket connection already initialized, skipping...");
              return;
            }
            console.log("started")
            socketRef.current = await initSocket(); // Establish socket connection

            // Error handling for socket connection
            socketRef.current.on("connect_error", (err) => handleError(err));
            socketRef.current.on("connect_failed", (err) => handleError(err));

            socketRef.current.emit(ACTIONS.JOIN, {  // sending message on joining
                roomId,
                username: location.state?.username,
            });

            // listining for joined event  i.e if anyone joins room
            socketRef.current.on(ACTIONS.JOINED, handleJoin);

            // listining for Disconnected i.e if anyone leaves the room
            socketRef.current.on(ACTIONS.DISCONNECTED, handleDisconnect);
        } catch (err) {
            handleError(err);
        }
    };

    const handleError = (err) => {
        console.log("Socket_Err", err);
        toast.error("Socket Connection Failed, Try Again later");
        navigate("/"); // Redirect to home if error occurs
    };

    const handleJoin = ({ clients, username, socketId }) => {
        if (username !== location.state?.username) {
            toast.success(`${username} joined`);
            console.log(`${username} joined`);
        }
        setClients(clients); // Update the client list

        // when new user joins then emit current code
        socketRef.current.emit(ACTIONS.SYNC_CODE,{
          code : codeRef.current,
          socketId
        })  
    };

    const handleDisconnect = ({ socketId, username }) => {
        toast.success(`${username} left the room`);
        // update client state after leaving
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
    };

    // Initialize socket connection when the component mounts
    initSocketConnection();

    // Cleanup when the component unmounts
     // If we don't remove these listeners, they could continue to listen to events even after the component is unmounted, leading to memory leaks.
    return () => {
      console.log("useEffect cleanup in");
      if (socketRef?.current) {
          console.log("useEffect cleanup");
          socketRef.current.off(ACTIONS.JOINED);
          socketRef.current.off(ACTIONS.DISCONNECTED);
          socketRef.current.disconnect();
          socketRef.current = null
          console.log("useEffect cleanup finished");

        }
    };

}, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }
  const leaveRoom = () => {
    navigate("/");
  };

  if (!location.state) {
    return <Navigate to="/" />;
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <h2 className="title">CodeTogether</h2>
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
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
}

export default EditorPage;
