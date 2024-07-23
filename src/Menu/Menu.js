import { CreateLobby } from "./CreateLobby";
import { JoinLobby } from "./JoinLobby";
import { CreateName } from "./CreateName";
import { Chat } from "./Chat/Chat";

export function Menu({ createPeer, peer, name, setName, connection }) {
  return (
    <div className="menu">
      {!name ? (
        <CreateName name={name} setName={setName} />
      ) : (
        <>
          {!connection ? (
            <>
              <CreateLobby createPeer={createPeer} peer={peer} />
              <JoinLobby name={name} />
            </>
          ) : (
            <Chat connection={connection} name={name} />
          )}
        </>
      )}
    </div>
  );
}
