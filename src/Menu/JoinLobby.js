import React, { useState } from "react";
import { lobbyLink } from "./CreateLobby";

export function JoinLobby() {
  const [input, setInput] = useState(null);

  function handleJoin() {
    if (input !== "") {
      //navigate to the url
      window.location.href = lobbyLink(input);
    }
  }

  return (
    <div className="join-lobby">
      <input
        value={input}
        placeholder="Name of lobby"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleJoin();
          }
        }}
      />
      <button onClick={() => handleJoin()}>Join lobby</button>
    </div>
  );
}