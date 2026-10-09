/** Renders a product name without letting hyphenated words ("4-piece", "3-in-1") break across lines. */
export default function Name({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.includes("-") ? <span className="nowrap">{word}</span> : word}
        </span>
      ))}
    </>
  );
}
