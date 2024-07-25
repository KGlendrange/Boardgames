export function keyDownWasEnter(
  callback: (e: React.KeyboardEvent<HTMLInputElement>) => void,
) {
  return (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      callback(e);
    }
  };
}
