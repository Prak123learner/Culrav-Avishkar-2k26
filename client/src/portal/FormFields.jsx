export function FormFields({ fields, answers, setAnswers, disabled = false }) {
  return fields.map((f) => {
    const options = (f.options || []).filter((option) => option.trim());
    const value = answers[f.id] ?? (f.type === "checkbox" ? [] : "");
    const set = (value) => setAnswers((old) => ({ ...old, [f.id]: value }));
    const props = {
      id: f.id,
      "aria-label": f.label,
      required: f.required,
      disabled,
      value,
      onChange: (e) => set(e.target.value),
    };
    return (
      <fieldset key={f.id} disabled={disabled} className="ca-question">
        <legend>
          {f.label}
          {f.required ? " *" : ""}
        </legend>
        {f.help && <p>{f.help}</p>}
        {f.type === "paragraph" ? (
          <textarea {...props} maxLength={10000} />
        ) : f.type === "select" ? (
          <select {...props}>
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : f.type === "radio" ? (
          options.map((o) => (
            <label className="ca-choice" key={o}>
              <input
                type="radio"
                name={f.id}
                required={f.required}
                checked={value === o}
                onChange={() => set(o)}
              />
              {o}
            </label>
          ))
        ) : f.type === "checkbox" ? (
          options.map((o, i) => (
            <label className="ca-choice" key={o}>
              <input
                type="checkbox"
                required={f.required && !value.length && i === 0}
                checked={value.includes(o)}
                onChange={(e) =>
                  set(
                    e.target.checked
                      ? [...value, o]
                      : value.filter((x) => x !== o),
                  )
                }
              />
              {o}
            </label>
          ))
        ) : (
          <input
            {...props}
            type={
              f.type === "link"
                ? "url"
                : f.type === "number"
                  ? "number"
                  : f.type === "date"
                    ? "date"
                    : "text"
            }
            step={f.type === "number" ? "any" : undefined}
            maxLength={2000}
          />
        )}
      </fieldset>
    );
  });
}
export function AnswerView({ fields, answers }) {
  return (
    <dl>
      {fields.map((f) => {
        const value = answers[f.id];
        return (
          <div key={f.id}>
            <dt>{f.label}</dt>
            <dd>
              {f.type === "link" &&
              typeof value === "string" &&
              /^https?:\/\//i.test(value) ? (
                <a href={value} target="_blank" rel="noopener noreferrer">
                  Open submitted link ↗
                </a>
              ) : Array.isArray(value) ? (
                value.join(", ")
              ) : (
                String(value ?? "—")
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
