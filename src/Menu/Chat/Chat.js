import React, { useState, useEffect } from "react";

//a chat app with your connection
export function Chat({ connection, name }) {
  const mainColor = "purple";
  const displayName = name || "Guest";
  const [minimize, setMinimize] = useState(false);
  const [input, setInput] = useState("");
  const [texts, setTexts] = useState([
    {
      type: "chat",
      name: "System",
      text: "Welcome to the chat!",
      color: "red"
    }
  ]);

  function handleClick() {
    const newText = {
      type: "chat",
      name: displayName,
      text: input,
      color: mainColor
    };
    if (connection) {
      connection.send(newText);
    }

    setTexts([...texts, newText]);

    setInput(""); //clear input
  }

  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        if (data.type !== "chat") {
          return;
        }
        console.log("got some data in chat: ", data);
        setTexts((t) => [...t, data]);
      });
      connection.on("open", () => {
        setTexts((t) => [
          ...t,
          {
            type: "chat",
            name: "System",
            text: "Connection opened",
            color: "red"
          }
        ]);
      });
      connection.on("close", () => {
        console.log("connection closed");
        setTexts((t) => [
          ...t,
          {
            type: "chat",
            name: "System",
            text: "Connection closed",
            color: "red"
          }
        ]);
      });
    }
  }, [connection]);

  if (!connection) {
    return null;
  }
  return (
    <div className={`chat ${!minimize ? "chat--border" : ""}`}>
      <button className="minimize" onClick={() => setMinimize((prev) => !prev)}>
        {minimize ? "show chat" : "hide chat"}
      </button>
      {!minimize && (
        <div className="chat-open">
          <div className="texts">
            {texts.map((text, index) => (
              <div className="text" key={index}>
                <span style={{ color: text.color }}>{text.name}</span>:{" "}
                {text.text}
              </div>
            ))}
          </div>
          <div className="input">
            <span style={{ color: mainColor }}>{displayName}: </span>
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
