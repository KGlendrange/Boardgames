import React, { useState } from "react";
import { Peer } from "peerjs";

export function JoinLobby() {
  const [input, setInput] = useState(null);

  return (
    <div className="join-lobby">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            //navigate to the url
          }
        }}
      />
      <button onClick={() => {}}>Join lobby</button>
    </div>
  );
}
