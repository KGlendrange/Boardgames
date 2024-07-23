import "./App.css";
import { Peer } from "peerjs";
import { Menu } from "./Menu/Menu";
import React, { useEffect, useState } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";

function App() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const [name, setName] = useState(localStorage.getItem("name"));

  const [peer, setPeer] = useState(null);
  const [connection, setConnection] = useState(null);

  //create a peer
  useEffect(() => {
    if (params.id) {
      createPeer();
    }
  }, []);

  function createPeer(input) {
    const peer = input ? new Peer(input) : new Peer();
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
    return peer;
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
        //console.log("Received", data);
        //listen in each of the games instead?
      });
    }
  }, [connection]);

  return (
    <div className="App">
      <div className="App2">
        <Menu
          createPeer={createPeer}
          peer={peer}
          name={name}
          setName={setName}
          connection={connection}
        />
        <TicTacToe peer={peer} connection={connection} ultimate={false} />
      </div>
    </div>
  );
}

export const BASE_KEY = "-tic-tac-toe";
export default App;
