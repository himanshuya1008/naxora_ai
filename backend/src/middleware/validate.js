// Generic Zod validation middleware. Validates and *replaces* req[part] with
// the parsed result so downstream handlers receive coerced/defaulted values
// (e.g. query string numbers already converted to Number).
export function validate(schema, part = 'body') {
  return (req, res, next) => {
    const parsed = schema.parse(req[part]);
    req[part] = parsed;
    next();
  };
}
