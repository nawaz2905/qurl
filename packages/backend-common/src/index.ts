const jwtPasscode = process.env.JWT_PASSCODE;

if (process.env.NODE_ENV === "production" && !jwtPasscode) {
  throw new Error("JWT_PASSCODE is required in production");
}

export const JWT_PASSCODE = jwtPasscode ?? "PasswordIsStrong";
