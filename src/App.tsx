import { DataConnection, Peer } from "peerjs";
import React, { useEffect, useRef, useState } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Routes, Route, useNavigate } from "react-router-dom";
import { StartPage } from "./Menu/StartPage";
import { Chat, KEY_CHAT, Text } from "./Menu/Chat/Chat";
import { CreateLobby } from "./Menu/CreateLobby";

export type State = {
	playerNumber: number;
	totalPlayers: number
};

export type DataMessage = {
  type: string;
  state: any;
  peers?: string[];
};

export default function App() {
  const navigate = useNavigate();

  const lobbyRegex = window.location.href.match(/lobby=([^&]*)/);
  const lobby =
    lobbyRegex !== null && lobbyRegex?.length > 1 ? lobbyRegex[1] : undefined;

  const gameRegex = window.location.href.match(/game=([^&]*)/);
  const game =
	  gameRegex !== null && gameRegex?.length > 1 ? gameRegex[1] : undefined;


const [texts, setTexts] = useState<Text[]>([
		{
		  type: KEY_CHAT,
		  name: "System",
		  text: "Welcome to the chat!",
		  color: "red",
		},
	  ]);

  const [peer, setPeer] = useState<Peer | null>(null);
  const [connections, setConnections] = useState<DataConnection[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [state, setState] = useState<State>({
	playerNumber: 0,
	totalPlayers: 3,
  });

  const stateRef = useRef(state);
  const connectionsRef = useRef(connections);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    connectionsRef.current = connections;
  }, [connections]);

  useEffect(() => {
    const peer = new Peer();
    peer.on("open", (id: string) => {
      setPeer(peer);
      if (lobby) {
        connectToPeer(lobby, peer);
      }
    });
    peer.on("connection", (newConnection: DataConnection) => {
      newConnection.on("data", (data: unknown) => {
		console.log("we got some data: ", data);
        const message = data as DataMessage;
        if (message.type === "update") {
          setState(message.state);
        }
      });
      newConnection.on("open", () => {
		setState(currentState => ({...currentState, playerNumber: currentState.playerNumber + 1}));
        setConnections((connections) => [...connections, newConnection]);
        //send this new connection the current state, and the other peers
        newConnection.send({
          type: "update",
          state: stateRef.current,
          peers: connectionsRef.current
            .filter((c) => c.connectionId !== newConnection.connectionId)
            .map((c) => c.peer),
        });
		//go to the game you invited them to
		console.log("go to the game now: ", game);
		if (game) {
			navigate(`${game}`);
		}
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  function connectToPeer(id: string, peer: Peer) {
      const newConnection = peer.connect(id, {metadata: {
		name,
	  }});
      newConnection.on("open", () => {
        setConnections((connections) => [...connections, newConnection]);
        newConnection.on("data", (data: unknown) => {
			console.log("we got some data123: ", data);
          const message = data as DataMessage;
          setState(message.state);
          if (message.peers) {
            message.peers.forEach((peerId) => {
              const newConn = peer?.connect(peerId);
              newConn?.on("open", () => {
                setConnections((prev) => [...prev, newConn!]);
                newConn?.on("data", (newData: unknown) => {
                  const newMessage = newData as DataMessage;
                  if (newMessage.type === "update") {
                    setState(newMessage.state);
                  }
                });
              });
            });
          }
        });
      });
      newConnection.on("close", () => {
        setConnections((prev) => prev.filter((c) => c !== newConnection));
      });
  }

  const updateState = (newState: State) => {
    setState(newState);
    connections.forEach((connection) =>
      connection.send({ type: "update", state: newState }),
    );
  };

  console.log("peer: ", peer);
  console.log("connections: ", connections);
  console.log("state", state);
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<StartPage />} />
      
        {peer && <>
			<Route path="/create" element={<CreateLobby peer={peer} />} />
			<Route
          path="/TicTacToe"
          element={
            <TicTacToe peer={peer} connections={connections} ultimate={false} setTexts={setTexts}/>
          }
        />
        <Route
          path="/UltimateTicTacToe"
          element={
            <TicTacToe peer={peer} connections={connections} ultimate={true} setTexts={setTexts}/>
          }
        /></>}
      </Routes>
      <Chat name={name} connections={connections} texts={texts} setTexts={setTexts} />
    </div>
  );
}
