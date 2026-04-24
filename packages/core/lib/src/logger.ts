const noop = () => undefined;

export const logger =
  process.env.NODE_ENV === "development"
    ? console
    : {
        log: noop,
        warn: noop,
        error: noop,
        info: noop,
      };
