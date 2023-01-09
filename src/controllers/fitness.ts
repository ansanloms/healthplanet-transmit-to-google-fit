import { createDataSources, getService } from "../utils/fitness.ts";

export const auth = () => {
  const authorizationUrl = getService().getAuthorizationUrl();
  console.log("authorizationUrl", authorizationUrl);

  const template = HtmlService.createTemplateFromFile("templates/fitness/auth");
  template.authorizationUrl = authorizationUrl;

  return template.evaluate();
};

export const callback = (
  event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent,
) => {
  const isAuthorized = getService().handleCallback(event);
  console.log("isAuthorized", isAuthorized);

  const template = HtmlService.createTemplateFromFile(
    "templates/fitness/callback",
  );
  template.isAuthorized = isAuthorized;

  return template.evaluate();
};

export const refresh = () => {
  getService().refresh();
};
