import { Link } from "react-router-dom";

const games = [
  {
    title: "Tic Tac Toe",
    description: "Classic game of Tic Tac Toe",
    path: "TicTacToe"
  },
  {
    title: "Ultimate Tic Tac Toe",
    description: "Complex version of Tic Tac Toe",
    path: "UltimateTicTacToe"
  }
];

export function GameChooser() {
  return (
    <div className="GameChooserWrapper">
      <h1>Choose a game</h1>
      <div className="GameChooser">
        {games.map((game, index) => (
          <GameCard key={index} game={game} />
        ))}
      </div>
    </div>
  );
}

function GameCard({ game }) {
  return (
    <Link to={"/create?game=" + game.path} className="GameCard">
      <h2>{game.title}</h2>
      <p>{game.description}</p>
    </Link>
  );
}
