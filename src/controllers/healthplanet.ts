import { getService, refresh as tokenRefresh } from "../utils/healthplanet.ts";

export const auth = () => {
  const authorizationUrl = getService().getAuthorizationUrl();
  console.log("authorizationUrl", authorizationUrl);

  const template = HtmlService.createTemplateFromFile(
    "templates/healthplanet/auth",
  );
  template.authorizationUrl = authorizationUrl;
  template.stateQuery = authorizationUrl.match(/state=([^&]*)/)[0] || "";

  return template.evaluate();
};

export const callback = (
  event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent,
) => {
  const isAuthorized = getService().handleCallback(event);
  console.log("isAuthorized", isAuthorized);

  const template = HtmlService.createTemplateFromFile(
    "templates/healthplanet/callback",
  );
  template.isAuthorized = isAuthorized;

  return template.evaluate();
};

export const refresh = () => {
  tokenRefresh();
};
