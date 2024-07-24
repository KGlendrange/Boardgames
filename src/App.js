import { Peer } from "peerjs";
import { Menu } from "./Menu/Menu";
import React, { useEffect, useState, useCallback } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Routes, Route, useNavigate } from "react-router-dom";
import { JoinLobby } from "./Menu/JoinLobby";
import { StartPage } from "./Menu/StartPage";
import { Chat } from "./Menu/Chat/Chat";
import { CreateLobby } from "./Menu/CreateLobby";

function App() {
  const navigate = useNavigate();
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const [name, setName] = useState(localStorage.getItem("name"));

  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);

  const createPeer = useCallback(
    (input) => {
      const peer = input ? new Peer(input) : new Peer();
      peer.on("open", (id) => {
        setPeer(peer);

        //create connection
        if (params.lobby) {
          const conn = peer.connect(params.lobby);
          conn.on("open", () => {
            setConnection(conn);
          });
        }
      });
      return peer;
    },
    [params.lobby]
  );

  //create a peer
  useEffect(() => {
    if (params.lobby) {
      createPeer();
    }
  }, [params.lobby, createPeer]);

  //accept connection from someone else
  if (peer) {
    peer.on("connection", (conn) => {
      setConnection(conn);
      //go to the game from your own url where ?game=TicTacToe should make you path to /TicTacToe
      navigate(`/${params.game}`);
    });
  }

  //listen for data
  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        //console.log("Received", data);
        //listen in each of the games instead?
      });
      connection.on("close", () => {
        
      })
    }
  }, [connection]);

  console.log("peer: ", peer);
  console.log("connection: ", connection);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route
          path="/create"
          element={<CreateLobby createPeer={createPeer} peer={peer} />}
        />
        <Route path="/join" element={<JoinLobby />} />
        <Route
          path="/TicTacToe"
          element={
            <TicTacToe peer={peer} connection={connection} ultimate={false} />
          }
        />
        <Route
          path="/UltimateTicTacToe"
          element={
            <TicTacToe peer={peer} connection={connection} ultimate={true} />
          }
        />
      </Routes>
      <Chat connection={connection} name={name} />
    </div>
  );
}

export default App;
