function isUndefined(value: unknown) {
  return value === undefined;
}

function isNull(value: unknown) {
  return value === null;
}

function isBoolean(value: unknown) {
  return typeof value === "boolean";
}

function isObject(value: unknown) {
  return value === Object(value);
}

function isArray(value: unknown) {
  return Array.isArray(value);
}

function isDate(value: unknown) {
  return value instanceof Date;
}

function isBlob(value: unknown, isReactNative: boolean) {
  return isReactNative
    ? isObject(value) && !isUndefined((value as any)?.uri)
    : isObject(value) &&
        typeof (value as any)?.size === "number" &&
        typeof (value as any)?.type === "string" &&
        typeof (value as any)?.slice === "function";
}

function isFile(value: unknown, isReactNative: boolean) {
  return (
    isBlob(value, isReactNative) &&
    typeof (value as any)?.name === "string" &&
    (isObject((value as any)?.lastModifiedDate) ||
      typeof (value as any)?.lastModified === "number")
  );
}

function initCfg(value: unknown): boolean {
  return isUndefined(value) ? false : (value as boolean);
}

export function serialize(
  obj: any,
  cfg?: {
    indices?: boolean;
    nullsAsUndefineds?: boolean;
    booleansAsIntegers?: boolean;
    allowEmptyArrays?: boolean;
    noAttributesWithArrayNotation?: boolean;
    noFilesWithArrayNotation?: boolean;
    dotsForObjectNotation?: boolean;
  },
  fd: FormData = new FormData(),
  pre?: string
): FormData {
  cfg = cfg || {};
  cfg.indices = initCfg(cfg.indices);
  cfg.nullsAsUndefineds = initCfg(cfg.nullsAsUndefineds);
  cfg.booleansAsIntegers = initCfg(cfg.booleansAsIntegers);
  cfg.allowEmptyArrays = initCfg(cfg.allowEmptyArrays);
  cfg.noAttributesWithArrayNotation = initCfg(
    cfg.noAttributesWithArrayNotation
  );
  cfg.noFilesWithArrayNotation = initCfg(cfg.noFilesWithArrayNotation);
  cfg.dotsForObjectNotation = initCfg(cfg.dotsForObjectNotation);

  const isReactNative = typeof (fd as any).getParts === "function";

  if (isUndefined(obj)) {
    return fd;
  } else if (isNull(obj)) {
    if (!cfg.nullsAsUndefineds) {
      fd.append(pre || "", "");
    }
  } else if (isBoolean(obj)) {
    if (cfg.booleansAsIntegers) {
      fd.append(pre || "", obj ? "1" : "0");
    } else {
      fd.append(pre || "", obj.toString());
    }
  } else if (isArray(obj)) {
    if (obj.length) {
      obj.forEach((value, index) => {
        let key = pre + "[" + (cfg.indices ? index : "") + "]";

        if (
          cfg.noAttributesWithArrayNotation ||
          (cfg.noFilesWithArrayNotation && isFile(value, isReactNative))
        ) {
          key = pre || "";
        }

        serialize(value, cfg, fd, key);
      });
    } else if (cfg.allowEmptyArrays) {
      fd.append(
        cfg.noAttributesWithArrayNotation ? pre || "" : (pre || "") + "[]",
        ""
      );
    }
  } else if (isDate(obj)) {
    fd.append(pre || "", obj.toISOString());
  } else if (isObject(obj) && !isBlob(obj, isReactNative)) {
    Object.keys(obj).forEach((prop) => {
      let keyProp = prop;
      const value = obj[prop];

      if (isArray(value)) {
        while (
          keyProp.length > 2 &&
          keyProp.lastIndexOf("[]") === keyProp.length - 2
        ) {
          keyProp = keyProp.substring(0, keyProp.length - 2);
        }
      }

      const key = pre
        ? cfg.dotsForObjectNotation
          ? pre + "." + keyProp
          : pre + "[" + keyProp + "]"
        : keyProp;

      serialize(value, cfg, fd, key);
    });
  } else {
    fd.append(pre || "", obj);
  }

  return fd;
}
