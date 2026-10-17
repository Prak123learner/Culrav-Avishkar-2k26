import { useRef } from "react";

export function ChoiceOptionsEditor({ type, options, onChange }) {
  const inputs = useRef([]);
  const choices = options.length ? options : [""];
  function add(after = choices.length - 1) {
    if (choices.length >= 100) return;
    const next = [...choices];
    next.splice(after + 1, 0, "");
    onChange(next);
    requestAnimationFrame(() => inputs.current[after + 1]?.focus());
  }
  return (
    <div className="ca-option-editor" role="group" aria-label="Answer options">
      <p>Options</p>
      {choices.map((choice, index) => (
        <div className="ca-option-row" key={index}>
          <span
            aria-hidden="true"
            className={`ca-option-symbol ca-option-${type}`}
          >
            {type === "select" ? `${index + 1}.` : ""}
          </span>
          <input
            ref={(element) => {
              inputs.current[index] = element;
            }}
            aria-label={`Option ${index + 1}`}
            maxLength={200}
            placeholder={`Option ${index + 1}`}
            value={choice}
            onChange={(event) =>
              onChange(
                choices.map((item, i) =>
                  i === index ? event.target.value : item,
                ),
              )
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                add(index);
              }
            }}
          />
          <button
            type="button"
            className="ca-option-remove"
            aria-label={`Remove option ${index + 1}`}
            disabled={choices.length === 1}
            onClick={() => onChange(choices.filter((_, i) => i !== index))}
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        className="ca-option-add"
        disabled={choices.length >= 100}
        onClick={() => add()}
      >
        <span aria-hidden="true">＋</span> Add option
      </button>
    </div>
  );
}
