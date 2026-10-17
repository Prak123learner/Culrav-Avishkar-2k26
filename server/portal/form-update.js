function questionSignature(field) {
  return JSON.stringify([
    field.id,
    field.label,
    field.type,
    [...(field.options || [])],
  ]);
}

function needsFormUpdate(previous = [], current = []) {
  if (previous.length !== current.length) return true;
  const old = new Map(previous.map((field) => [field.id, field]));
  return current.some((field) => {
    const earlier = old.get(field.id);
    return (
      !earlier ||
      questionSignature(earlier) !== questionSignature(field) ||
      !!earlier.required !== !!field.required
    );
  });
}

function carriedAnswers(previous = [], current = [], answers = {}) {
  const old = new Map(
    previous.map((field) => [field.id, questionSignature(field)]),
  );
  return Object.fromEntries(
    current
      .filter(
        (field) =>
          old.get(field.id) === questionSignature(field) &&
          Object.hasOwn(answers, field.id),
      )
      .map((field) => [field.id, answers[field.id]]),
  );
}

function currentFields(event) {
  return (
    event.formVersions.find((form) => form.version === event.currentVersion)
      ?.fields || []
  );
}

module.exports = { needsFormUpdate, carriedAnswers, currentFields };
