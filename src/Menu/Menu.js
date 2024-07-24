import { CreateLobby } from "./CreateLobby";
import { JoinLobby } from "./JoinLobby";
import { CreateName } from "./CreateName";

export function Menu({ createPeer, peer, name, setName, connection }) {
  return (
    <div className="menu">
      <h1 className="title">Kristian Glendrange</h1>
      {!name ? (
        <CreateName name={name} setName={setName} />
      ) : (
        <>
          {!connection && (
            <div className="lobby">
              <CreateLobby createPeer={createPeer} peer={peer} />
              {!peer && <JoinLobby name={name} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
