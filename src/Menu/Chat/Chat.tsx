import { DataConnection } from "peerjs";
import React, { useState, useEffect } from "react";
import { keyDownWasEnter } from "../../utils/utils";

const colors = ["blue", "green", "purple", "orange", "teal", "maroon", "navy"];
export const KEY_CHAT = "chat";



export type Text = {
	type: typeof KEY_CHAT;
	name: string;
	text: string;
	color: string;
}
//a chat app with your connection
export function Chat({ name, setName, connections, texts, setTexts }: { name: string | null, setName: React.Dispatch<React.SetStateAction<string | null>>,connections: DataConnection[], texts: Text[], setTexts: React.Dispatch<React.SetStateAction<Text[]>> }) {
  const [minimize, setMinimize] = useState(false);
  const [isChangingName, setIsChangingName] = useState(false);
  const displayName = name || "Guest";

  const [input, setInput] = useState("");
  
  const takenColors = texts
    .filter((text) => text.name !== name)
    .map((text) => text.color);
  const availableColors = colors.filter(
    (color) => !takenColors.includes(color),
  );
  const mainColor = availableColors?.[0] || "navy";

  function handleClick() {
    const newText: Text = {
      type: KEY_CHAT,
      name: displayName,
      text: input,
      color: mainColor,
    };
    if (connections) {
      connections.forEach((connection) => {
        connection.send(newText);
      });
    }

    setTexts([...texts, newText]);

    setInput(""); //clear input
  }

  useEffect(() => {
    if (connections.length > 0) {
      connections.forEach((connection) => {
        connection.on("data", (data: unknown) => {
          const message = data as Text;
          if (message.type !== KEY_CHAT) {
            return;
          }
          setTexts((t) => [...t, message]);
        });
        connection.on("open", () => {
          setTexts((t) => [
            ...t,
            {
              type: KEY_CHAT,
              name: "System",
              text: "Connection opened",
              color: "red",
            },
          ]);
        });
        connection.on("close", () => {
          setTexts((t) => [
            ...t,
            {
              type: KEY_CHAT,
              name: "System",
              text: "Connection closed",
              color: "red",
            },
          ]);
        });
      });
    }
  }, [connections.length]);

  /*   if (!connection) {
    return null;
  } */
  return (
    <div className={`chat ${!minimize ? "chat--border" : "chat-minimize"}`}>
      <div>
        {!minimize && (
          <button onClick={() => setIsChangingName((prev) => !prev)}>
            Change name
          </button>
        )}
        <button
          className="minimize"
          onClick={() => setMinimize((prev) => !prev)}
        >
          {minimize ? "show chat" : "hide chat"}
        </button>
      </div>
      {isChangingName && (
        <div className="change-name">
          <label htmlFor="namechange">Change name</label>
          <input
            id="namechange"
            onKeyDown={keyDownWasEnter((e) => {
              const target = e.currentTarget as HTMLInputElement;
              localStorage.setItem("name", target.value);
              setName(target.value);
              setIsChangingName(false);
            })}
          />
        </div>
      )}
      {!minimize && !isChangingName && (
        <div className="chat-open">
          <div className="texts">
            {texts.map((text, index) => (
              <div className="text" key={index}>
                <span className="name-tag" style={{ color: text.color }}>
                  {text.name}
                </span>
                : {text.text}
              </div>
            ))}
          </div>
          <div className="input">
              <div style={{color: mainColor, display: "flex"}}>
                {displayName}:
              </div>
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input !== "") {
                  handleClick();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
