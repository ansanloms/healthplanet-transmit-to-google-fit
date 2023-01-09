import { dataSourceList } from "./fitness.ts";

export const callbackFunction = "healthplanetAuthCallback";

const baseUrl = "https://www.healthplanet.jp";

export const getService = () =>
  OAuth2.createService("healthplanet")
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl(`${baseUrl}/oauth/auth`)
    .setTokenUrl(`${baseUrl}/oauth/token`)
    // Set the client ID and secret.
    .setClientId(
      PropertiesService.getScriptProperties().getProperty(
        "HEALTHPLANET_CLIENT_ID",
      ) || "",
    )
    .setClientSecret(
      PropertiesService.getScriptProperties().getProperty(
        "HEALTHPLANET_CLIENT_SECRET",
      ) || "",
    )
    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction(callbackFunction)
    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())
    // Set the scope and additional Google-specific parameters.
    .setScope(["innerscan"])
    .setGrantType("authorization_code");

/**
 * service.refresh() が動かないので自前でリフレッシュトークンを取得する。
 *
 * @description
 * healthplanet では リフレッシュトークン取得時に redirect_uri の指定が必須だが、
 * service.refresh() ではそれができない為必ずエラーになる。
 */
export const refresh = () => {
  const service = getService();

  const token = service.getToken() as any;
  if (!token.refresh_token) {
    throw new Error("Offline access is required.");
  }

  const response = UrlFetchApp.fetch(`${baseUrl}/oauth/token`, {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      refresh_token: token.refresh_token || "",
      client_id: PropertiesService.getScriptProperties().getProperty(
        "HEALTHPLANET_CLIENT_ID",
      ) || "",
      client_secret: PropertiesService.getScriptProperties().getProperty(
        "HEALTHPLANET_CLIENT_SECRET",
      ) || "",
      redirect_uri: "https://www.healthplanet.jp/success.html",
      grant_type: "refresh_token",
    },
    muteHttpExceptions: true,
  });

  const newToken = JSON.parse(response.getContentText());
  if (!newToken.refresh_token) {
    newToken.refresh_token = token.refresh_token;
  }

  // service.refresh() が動かれると困る為。
  newToken.refreshTokenExpiresAt = Math.floor(
    new Date("9999-12-31 00:00:00").getTime() / 1e3,
  );

  service.getStorage().setValue(null, newToken);
};

export const innerscan = (from: Date, to: Date) => {
  const response = UrlFetchApp.fetch(`${baseUrl}/status/innerscan.json`, {
    method: "get",
    payload: {
      access_token: (getService().getToken() as any).access_token || "",
      date: "1",
      from: Utilities.formatDate(from, "JST", "yyyyMMddHHmmss"),
      to: Utilities.formatDate(to, "JST", "yyyyMMddHHmmss"),
      tag: "6021,6022",
    },
  });

  return (JSON.parse(response.getContentText()).data as {
    date: string;
    keydata: number;
    model: string;
    tag: "6021" | "6022";
  }[]).map((data) => {
    return {
      date: new Date(
        Number(data.date.slice(0, 4)),
        Number(data.date.slice(4, 6)) - 1,
        Number(data.date.slice(6, 8)),
        Number(data.date.slice(8, 10)),
        Number(data.date.slice(10, 12)),
        Number(data.date.slice(12, 14)),
      ),
      data: data.keydata,
      tag: (() => {
        if (data.tag === "6021") {
          return "weight";
        } else if (data.tag === "6022") {
          return "fat";
        }
      })() as keyof typeof dataSourceList,
    };
  });
};
