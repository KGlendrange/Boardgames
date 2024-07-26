import { DataConnection, Peer } from "peerjs";
import { useEffect, useRef, useState } from "react";
import { TicTacToe } from "./TicTacToe/TicTacToe";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { StartPage } from "./Menu/StartPage";
import { Chat, KEY_CHAT, Text } from "./Menu/Chat/Chat";
import { CreateLobby } from "./Menu/CreateLobby";
import { Game } from "./Menu/GameChooser";

export type State = {
	playerNumber: number;
	totalPlayers: number;
  game: Game | null;
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
  const [name, setName] = useState<string | null>(localStorage.getItem("name"));
  const [state, setState] = useState<State>({
	playerNumber: 0,
	totalPlayers: 3,
  game: null
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
    //path changed, we should be redirected there as well
    if (state.game) {
      navigate(`${state.game.path}`)
    }
  },[state.game?.path])

  useEffect(() => {
    const peer = new Peer();
    peer.on("open", () => {
      setPeer(peer);
      if (lobby) {
        connectToPeer(lobby, peer);
      }
    });
    peer.on("connection", (newConnection: DataConnection) => {
      newConnection.on("data", (data: unknown) => {
        const message = data as DataMessage;
        if (message.type === "update") {
          setState({...state, ...message.state});
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
          const message = data as DataMessage;
          if (message.type === "update") {
            const newState = {...state, ...message.state};
            setState(newState);
          }
          if (message.peers) {
            message.peers.forEach((peerId) => {
              const newConn = peer?.connect(peerId);
              newConn?.on("open", () => {
                setConnections((prev) => [...prev, newConn!]);
                newConn?.on("data", (newData: unknown) => {
                  const newMessage = newData as DataMessage;
                  if (newMessage.type === "update") {
                    setState({...state, ...newMessage.state});
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

  return (
    <div className="App">
      <NavBar/>
      {state?.game?.title}
      {peer && state.game && connections.length === 0 && <CreateLobby peer={peer} />}
      <Routes>
        <Route path="/" element={<StartPage name={name} connections={connections} setState={setState}/>} />
      
        {peer && <>
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
      <Chat name={name} setName={setName} connections={connections} texts={texts} setTexts={setTexts} />
    </div>
  );
}

const NavBar = () => {
  return (
    <nav className="nav-bar">
      <Link to="/">Home</Link>
    </nav>
  )
}
