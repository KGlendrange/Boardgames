import { Peer } from "peerjs";
import React, { useEffect, useState, useCallback } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Routes, Route, useNavigate } from "react-router-dom";
import { JoinLobby } from "./Menu/JoinLobby";
import { StartPage } from "./Menu/StartPage";
import { Chat } from "./Menu/Chat/Chat";
import { CreateLobby } from "./Menu/CreateLobby";

function App() {
  const navigate = useNavigate();

  const lobbyRegex = window.location.href.match(/lobby=([^&]*)/);
  const lobby = lobbyRegex?.length > 1 ? lobbyRegex[1] : undefined;

  const [name, setName] = useState(localStorage.getItem("name"));

  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);

  const createPeer = useCallback(
    (input) => {
      const peer = input ? new Peer(input) : new Peer();
      peer.on("open", (id) => {
        setPeer(peer);

        //create connection
        if (lobby) {
          const conn = peer.connect(lobby);
          conn.on("open", () => {
            setConnection(conn);
          });
        }
      });
      return peer;
    },
    [lobby]
  );

  //create a peer
  useEffect(() => {
    if (lobby) {
      createPeer();
    }
  }, [lobby, createPeer]);

  //accept connection from someone else
  if (peer) {
    peer.on("connection", (conn) => {
      setConnection(conn);
      //go to the game from your own url where ?game=TicTacToe should make you path to /TicTacToe
      const gameRegex = window.location.href.match(/game=([^&]+)/);
      const gameMatch = gameRegex?.length > 1 ? gameRegex[1] : undefined;
      if (gameMatch) {
        navigate(`/${gameMatch}`);
      }
    });
  }

  //listen for data
  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        //console.log("Received", data);
        //listen in each of the games instead?
      });
      connection.on("close", () => {});
    }
  }, [connection]);

 /*  console.log("peer: ", peer);
  console.log("connection: ", connection); */
  return (
    <div className="App">
      <Routes>
        <Route exact path="/" element={<StartPage />} />
        <Route
          exact
          path="/create"
          element={<CreateLobby createPeer={createPeer} peer={peer} />}
        />
        <Route exact path="/join" element={<JoinLobby />} />
        <Route
          exact
          path="/TicTacToe"
          element={
            <TicTacToe peer={peer} connection={connection} ultimate={false} />
          }
        />
        <Route
          exact
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
