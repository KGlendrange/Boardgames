import logo from "./logo.svg";
import "./App.css";
import { Peer } from "peerjs";
import { Menu } from "./Menu/Menu";
import React, { useEffect, useState } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Chat } from "./Chat/Chat";

function App() {
  const [name, setName] = useState("Guest");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);

  const [input, setInput] = useState(null);

  //create a peer
  useEffect(() => {
    createPeer();
  }, []);

  function createPeer() {
    const peer = new Peer();
    peer.on("open", (id) => {
      setPeer(peer);

      //create connection
      if (params.id) {
        const conn = peer.connect(params.id);
        conn.on("open", () => {
          setConnection(conn);
        });
      }
    });
  }

  //accept connection from someone else
  if (peer) {
    peer.on("connection", (conn) => {
      setConnection(conn);
    });
  }

  //listen for data
  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        console.log("Received", data);
      });
    }
  }, [connection]);

  console.log("peer", peer);
  console.log("connection", connection);

  function handleClick() {
    if (connection) {
      console.log("sending poke");
      connection.send("poke");
    }
  }

  return (
    <div className="App">
      <div className="App2">
        <button onClick={handleClick}>poke</button>
        <div>
          <input
            style={{ width: "500px" }}
            readOnly
            value={
              window.location.origin +
              window.location.pathname +
              "?id=" +
              peer?.id
            }
          />
        </div>

        {/*    <Menu
          createPeer={createPeer}
          joinPeer={joinPeer}
          name={name}
          setName={setName}
        /> */}
        <TicTacToe connection={connection} />
        <Chat connection={connection} name={name} />
      </div>
    </div>
  );
}

export const BASE_KEY = "GLENDRANGE-PEER-";
export default App;
