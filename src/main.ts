import * as fitness from "./controllers/fitness.ts";
import * as healthplanet from "./controllers/healthplanet.ts";

import { add, createDataSources, deleteDataSources } from "./utils/fitness.ts";
import { innerscan } from "./utils/healthplanet.ts";

global.doGet = (event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent) => {
  if (event.pathInfo === "fitness/auth") {
    return fitness.auth();
  } else if (event.pathInfo === "healthplanet/auth") {
    return healthplanet.auth();
  }
};

global.fitnessAuthCallback = (
  event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent,
) => {
  return fitness.callback(event);
};

global.fitnessAuthRefresh = () => {
  return fitness.refresh();
};

global.healthplanetAuthCallback = (
  event: GoogleAppsScript.Events.AppsScriptHttpRequestEvent,
) => {
  return healthplanet.callback(event);
};

global.healthplanetAuthRefresh = () => {
  return healthplanet.refresh();
};

global.innerscan = () => {
  const from = new Date(
    Utilities.formatDate(
      new Date(Date.now() - 24 * 60 * 60 * 1e3),
      "JST",
      "yyyy-MM-dd 00:00:00",
    ),
  );
  const to = new Date(
    Utilities.formatDate(new Date(), "JST", "yyyy-MM-dd 00:00:00"),
  );

  innerscan(from, to).forEach(add);
};

global.createDataSources = () => {
  createDataSources("weight");
  createDataSources("fat");
};
