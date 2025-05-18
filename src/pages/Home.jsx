import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import {toast} from 'react-hot-toast'
import { v4 as uuidV4 } from 'uuid'; // for generating id

function Home() {

  const navigate = useNavigate();

  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  
  const createNewRoom = (e) => {
      e.preventDefault();
      const id = uuidV4();
      setRoomId(id);
      toast.success('Created a new room');
  };

  const joinRoom = () => {
      if (!roomId || !username) {
          toast.error('ROOM ID & username is required');
          return;
      }

      // Redirect
      navigate(`/editor/${roomId}`, {
          state: {
              username,   // passing username to editor page 
          },
      });
  };

  const handleInputEnter = (e) => {
      if (e.code === 'Enter') {
          joinRoom();
      }
  };

  return (
    <div className="homePageWrapper">
            <div className="formWrapper">
                <h2 className='title'>Welcome To CodeTogether</h2>
                <h4 className="mainLabel">Paste invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox text-green-600"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox text-green-600"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                    <span className="createInfo">
                        If you don't have an invite then create &nbsp;
                        <a
                            onClick={createNewRoom}
                            href=""
                            className="createNewBtn"
                        >
                            new room
                        </a>
                    </span>
                </div>
            </div>
            <footer>
                <h4 className='mb-2'>
                    Built with 💛 &nbsp; by &nbsp;
                    <a href="https://github.com/MdMassum/CodeTogether">M.Emamudin</a>
                </h4>
            </footer>
        </div>
  )
}

export default Home