export const callbackFunction = "fitnessAuthCallback";

const baseUrl = "https://www.googleapis.com/fitness/v1";

export const dataSourceList = {
  weight: {
    dataTypeName: "com.google.weight",
    fieldName: "weight",
  },
  fat: {
    dataTypeName: "com.google.body.fat.percentage",
    fieldName: "percentage",
  },
} as const;

export const getService = () =>
  OAuth2.createService("fitness")
    // Set the endpoint URLs.
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
    .setTokenUrl("https://oauth2.googleapis.com/token")
    // Set the client ID and secret.
    .setClientId(
      PropertiesService.getScriptProperties().getProperty(
        "FITNESS_CLIENT_ID",
      ) || "",
    )
    .setClientSecret(
      PropertiesService.getScriptProperties().getProperty(
        "FITNESS_CLIENT_SECRET",
      ) || "",
    )
    // Set the name of the callback function that should be invoked to
    // complete the OAuth flow.
    .setCallbackFunction(callbackFunction)
    // Set the property store where authorized tokens should be persisted.
    .setPropertyStore(PropertiesService.getUserProperties())
    // Set the scope and additional Google-specific parameters.
    .setScope([
      "https://www.googleapis.com/auth/fitness.body.read",
      "https://www.googleapis.com/auth/fitness.body.write",
    ])
    .setParam("login_hint", Session.getActiveUser().getEmail())
    .setParam("access_type", "offline")
    .setParam("approval_prompt", "force");

export const createDataSources = (name: keyof typeof dataSourceList) => {
  const payload = {
    application: {
      name: "Healthplanet transmit to Google fit",
    },
    dataType: {
      field: [
        {
          name: dataSourceList[name].fieldName,
          format: "floatPoint",
        },
      ],
      name: dataSourceList[name].dataTypeName,
    },
    type: "raw",
  };

  const resuponse = UrlFetchApp.fetch(
    `${baseUrl}/users/me/dataSources`,
    {
      headers: {
        "Authorization": "Bearer " + getService().getAccessToken(),
      },
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    },
  );

  const res = JSON.parse(resuponse.getContentText());
  console.log(res);

  PropertiesService.getUserProperties().setProperty(
    name,
    res.dataStreamId,
  );
};

export const deleteDataSources = (dataSourceId: string) => {
  const resuponse = UrlFetchApp.fetch(
    `${baseUrl}/users/me/dataSources/${dataSourceId}`,
    {
      headers: {
        "Authorization": "Bearer " + getService().getAccessToken(),
      },
      method: "delete",
    },
  );
};

export const add = (input: {
  date: Date;
  data: number;
  tag: keyof typeof dataSourceList;
}) => {
  const timeNs = input.date.getTime() * 1e6;

  const dataSourceId = PropertiesService.getUserProperties().getProperty(
    input.tag,
  );

  const payload = {
    dataSourceId,
    maxEndTimeNs: String(timeNs),
    minStartTimeNs: String(timeNs),
    point: [
      {
        startTimeNanos: String(timeNs),
        endTimeNanos: String(timeNs),
        dataTypeName: dataSourceList[input.tag].dataTypeName,
        value: [{ fpVal: input.data }],
      },
    ],
  };

  const url =
    `${baseUrl}/users/me/dataSources/${dataSourceId}/datasets/${timeNs}-${timeNs}`;

  console.log(url);
  console.log(input);
  console.log(payload);

  const resuponse = UrlFetchApp.fetch(
    url,
    {
      headers: {
        "Authorization": "Bearer " + getService().getAccessToken(),
      },
      method: "patch",
      contentType: "application/json",
      payload: JSON.stringify(payload),
    },
  );

  const res = JSON.parse(resuponse.getContentText());
  console.log(res);
};
