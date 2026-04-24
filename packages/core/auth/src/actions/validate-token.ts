import { jwtVerify, createRemoteJWKSet, type JWTPayload } from "jose";

export type ValidateTokenResult =
  | {
      success: true;
      code: "SUCCESS";
      payload: JWTPayload;
    }
  | {
      success: false;
      code: "INVALID_TOKEN";
      message?: string;
    };

export async function validateToken({
  token,
  issuerUrl,
  audienceUrl,
}: {
  token: string;
  issuerUrl: string;
  audienceUrl: string;
}): Promise<ValidateTokenResult> {
  try {
    const JWKS = createRemoteJWKSet(new URL(`${issuerUrl}/api/auth/jwks`));
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: issuerUrl,
      audience: audienceUrl,
    });
    return {
      success: true,
      code: "SUCCESS",
      payload,
    };
  } catch (error) {
    return {
      success: false,
      code: "INVALID_TOKEN",
      message: `Token validation failed: ${JSON.stringify(error)}`,
    };
  }
}
