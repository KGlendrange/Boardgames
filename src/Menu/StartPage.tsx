import { DataConnection } from "peerjs";
import { GameChooser } from "./GameChooser";
import { State } from "../App";

export function StartPage({name, connections, setState} : {name: string | null, connections: DataConnection[], setState: React.Dispatch<React.SetStateAction<State>> }) {
  return (
    <div>
      <GameChooser name={name} connections={connections} setState={setState}/>
    </div>
  );
}
