import logo from "./logo.svg";
import "./App.css";
import { Peer } from "peerjs";
import { Menu } from "./Menu/Menu";
import React, { useEffect, useState } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Chat } from "./Chat/Chat";
import { usePeerState, useReceivePeerState } from "react-peer";

function App() {
  const [name, setName] = useState("Guest");

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const [state, setState, peerId, connections, error] = usePeerState({
    count: 0
  });
  console.log(state, peerId, connections, error);
  console.log("params.id", params.id);
  const [receiverState, isConnected, error2] = useReceivePeerState(params.id);
  console.log(receiverState, isConnected, error2);

  return (
    <div className="App">
      <div className="App2">
        Broker (open in new window):
        <input
          key={peerId}
          readOnly
          defaultValue={`${
            window.location.origin + window.location.pathname
          }?id=${peerId}`}
          style={{ width: 500 }}
        />
        {peerId}
        <button
          onClick={() =>
            setState({
              count: state.count + 1
            })
          }
        >
          increase number
        </button>
        {"We are connected: " + isConnected}
        <span>{isConnected ? receiverState.count : state.count}</span>
        {/* <Menu
          createPeer={createPeer}
          joinPeer={joinPeer}
          name={name}
          setName={setName}
        />
        <TicTacToe connection={connection} />
        <Chat connection={connection} name={name} /> */}
      </div>
    </div>
  );
}

export default App;
