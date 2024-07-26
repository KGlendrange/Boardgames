import Peer from "peerjs";
import { useState } from "react";

export function CreateLobby({ peer }: {peer: Peer}) {
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const link = lobbyLink(peer?.id) ?? "";

  return (
    <div className="create-lobby">
      {peer?.id && (
        <div>
          Give this link to your friend:
          <input
            style={{ width: "100%", minWidth: "280px" }}
            readOnly
            value={link}
          />
          <button
            onClick={() => {
              try {
                if (link) {
                  navigator.clipboard.writeText(link);
                  setCopiedToClipboard(true);
                }
               
              } catch (e) {
                console.error(e);
              }
            }}
          >
            {copiedToClipboard ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}

export function lobbyLink(input?: string) {
  if (!input) {
    return null;
  }
  const BASE = window.location.origin + window.location.pathname;

  if (input.includes(BASE) && input.includes("lobby=")) {
    return input;
  }

  const game = window.location.hash;
  const res = `${BASE}${game}?lobby=${input}`;
  return res;
}
