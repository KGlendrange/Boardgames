import { CreateLobby } from "./CreateLobby";
import { JoinLobby } from "./JoinLobby";
import { CreateName } from "./CreateName";

export function Menu({ createPeer, name, setName }) {
  return (
    <div className="menu">
      <h1>Menu</h1>
      <CreateName name={name} setName={setName} />
      <CreateLobby createPeer={createPeer} />
      <JoinLobby />
    </div>
  );
}
