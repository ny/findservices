const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
const ISSUER = process.env.REACT_APP_ISSUER;
const REDIRECTURI = process.env.REACT_APP_REDIRECTURI;
const LOGOUTURI = process.env.REACT_APP_LOGOUTURI;
const OKTA_TESTING_DISABLEHTTPSCHECK = false;

/**
 * Basic okta configuration
 */
export default {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECTURI,
    postLogoutRedirectUri: LOGOUTURI,
    scopes: ["openid", "profile", "email", "ITS"],
    pkce: true,
    storage: sessionStorage,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  },
};
