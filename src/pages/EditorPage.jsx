import React, { useEffect, useRef, useState } from "react";
import Client from "../components/Client";
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

import {language, cmtheme} from '../atom';
import { useRecoilState } from "recoil";

// useRef hook --> The useRef Hook allows us to persist values between renders.
// It can be used to store a mutable value that does not cause a re-render when updated.

function EditorPage() {
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const [clients, setClients] = useState([]);

  const [lang, setLang] = useRecoilState(language);
  const [them, setThem] = useRecoilState(cmtheme);

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
    
        console.log("useEffect cleanup");
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.disconnect();
        // socketRef.current = null
        console.log("useEffect cleanup finished");
        
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
    navigate('/');
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
                    {clients && clients.map((client) => (
                        <Client
                            key={client.socketId}
                            username={client.username}
                        />
                    ))}
                </div>
            </div>

            <label>
                Select Language:
                <select value={lang} onChange={(e) => {setLang(e.target.value); window.location.reload();}} className="seLang">
                    <option value="clike">C / C++ / C# / Java</option>
                    <option value="css">CSS</option>
                    <option value="dart">Dart</option>
                    <option value="django">Django</option>
                    <option value="dockerfile">Dockerfile</option>
                    <option value="go">Go</option>
                    <option value="htmlmixed">HTML-mixed</option>
                    <option value="javascript">JavaScript</option>
                    <option value="jsx">JSX</option>
                    <option value="markdown">Markdown</option>
                    <option value="php">PHP</option>
                    <option value="python">Python</option>
                    <option value="r">R</option>
                    <option value="rust">Rust</option>
                    <option value="ruby">Ruby</option>
                    <option value="sass">Sass</option>
                    <option value="shell">Shell</option>
                    <option value="sql">SQL</option>
                    <option value="swift">Swift</option>
                    <option value="xml">XML</option>
                    <option value="yaml">yaml</option>
                </select>
            </label>

            <label>
                Select Theme:
                <select value={them} onChange={(e) => {setThem(e.target.value); window.location.reload();}} className="seLang">
                    <option value="default">default</option>
                    <option value="3024-day">3024-day</option>
                    <option value="3024-night">3024-night</option>
                    <option value="abbott">abbott</option>
                    <option value="abcdef">abcdef</option>
                    <option value="ambiance">ambiance</option>
                    <option value="ayu-dark">ayu-dark</option>
                    <option value="ayu-mirage">ayu-mirage</option>
                    <option value="base16-dark">base16-dark</option>
                    <option value="base16-light">base16-light</option>
                    <option value="bespin">bespin</option>
                    <option value="blackboard">blackboard</option>
                    <option value="cobalt">cobalt</option>
                    <option value="colorforth">colorforth</option>
                    <option value="darcula">darcula</option>
                    <option value="duotone-dark">duotone-dark</option>
                    <option value="duotone-light">duotone-light</option>
                    <option value="eclipse">eclipse</option>
                    <option value="elegant">elegant</option>
                    <option value="erlang-dark">erlang-dark</option>
                    <option value="gruvbox-dark">gruvbox-dark</option>
                    <option value="hopscotch">hopscotch</option>
                    <option value="icecoder">icecoder</option>
                    <option value="idea">idea</option>
                    <option value="isotope">isotope</option>
                    <option value="juejin">juejin</option>
                    <option value="lesser-dark">lesser-dark</option>
                    <option value="liquibyte">liquibyte</option>
                    <option value="lucario">lucario</option>
                    <option value="material">material</option>
                    <option value="material-darker">material-darker</option>
                    <option value="material-palenight">material-palenight</option>
                    <option value="material-ocean">material-ocean</option>
                    <option value="mbo">mbo</option>
                    <option value="mdn-like">mdn-like</option>
                    <option value="midnight">midnight</option>
                    <option value="monokai">monokai</option>
                    <option value="moxer">moxer</option>
                    <option value="neat">neat</option>
                    <option value="neo">neo</option>
                    <option value="night">night</option>
                    <option value="nord">nord</option>
                    <option value="oceanic-next">oceanic-next</option>
                    <option value="panda-syntax">panda-syntax</option>
                    <option value="paraiso-dark">paraiso-dark</option>
                    <option value="paraiso-light">paraiso-light</option>
                    <option value="pastel-on-dark">pastel-on-dark</option>
                    <option value="railscasts">railscasts</option>
                    <option value="rubyblue">rubyblue</option>
                    <option value="seti">seti</option>
                    <option value="shadowfox">shadowfox</option>
                    <option value="solarized">solarized</option>
                    <option value="the-matrix">the-matrix</option>
                    <option value="tomorrow-night-bright">tomorrow-night-bright</option>
                    <option value="tomorrow-night-eighties">tomorrow-night-eighties</option>
                    <option value="ttcn">ttcn</option>
                    <option value="twilight">twilight</option>
                    <option value="vibrant-ink">vibrant-ink</option>
                    <option value="xq-dark">xq-dark</option>
                    <option value="xq-light">xq-light</option>
                    <option value="yeti">yeti</option>
                    <option value="yonce">yonce</option>
                    <option value="zenburn">zenburn</option>
                </select>
            </label>

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
