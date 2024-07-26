import { DataConnection } from "peerjs";
import { Link } from "react-router-dom";
import { KEY_CHAT } from "./Chat/Chat";
import { State } from "../App";


export type Game = {
  title: string; 
  description: string; 
  path: string;
}
const games = [
  {
    title: "Tic Tac Toe",
    description: "Classic game of Tic Tac Toe",
    path: "TicTacToe",
  },
  {
    title: "Ultimate Tic Tac Toe",
    description: "Complex version of Tic Tac Toe",
    path: "UltimateTicTacToe",
  },
];

export function GameChooser({name, connections, setState} : {name: string | null, connections: DataConnection[], setState: React.Dispatch<React.SetStateAction<State>>}) {
  return (
    <div className="GameChooserWrapper">
      <h1>Choose a game</h1>
      <div className="GameChooser">
        {games.map((game, index) => (
          <GameCard key={index} name={name} game={game} connections={connections} setState={setState} />
        ))}
      </div>
    </div>
  );
}

function GameCard({name,  game, connections, setState }: {name: string | null, game: Game, connections: DataConnection[], setState: React.Dispatch<React.SetStateAction<State>>}) {
  const displayName = name || "Host";
  return (
    <Link to={game.path} className="GameCard" onClick={() => {
      setState(currentState => ({...currentState, game}))
      connections.forEach(connection => {
        console.log("sending game choice to ", connection);
        connection.send({
          type: "update",
          state: {
            game
          }
        });
        connection.send({
          type: KEY_CHAT,
          name: "System",
          color: "red",
          text: `${displayName} moved to ${game.title}`
        });
      })
    }}>
      <h2>{game.title}</h2>
      <p>{game.description}</p>
    </Link>
  );
}
