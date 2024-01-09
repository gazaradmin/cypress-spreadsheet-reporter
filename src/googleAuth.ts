import { OAuth2Client } from 'google-auth-library';

const isTokenExpired = (
  tokenExpiredDate: number | undefined | null,
): boolean => {
  if (!tokenExpiredDate) {
    return true;
  }
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  return tokenExpiredDate < currentTime;
};

const refreshToken = async (oauth2Client: OAuth2Client) => {
  await oauth2Client.getAccessToken();
};
export const googleAuth = async (
  config: Cypress.Config,
): Promise<OAuth2Client> => {
  const {
    clientId,
    clientSecret,
    refreshToken: refresh_token,
    tokenExpiryDate,
  } = config.env;
  const oauth2Client: OAuth2Client = new OAuth2Client(clientId, clientSecret);
  if (isTokenExpired(tokenExpiryDate)) {
    oauth2Client.setCredentials({
      refresh_token,
    });
    oauth2Client.on('tokens', (tokens: any) => {
      const { id_token, access_token, expiry_date } = tokens;
      if (id_token && access_token && expiry_date) {
        config.env.id_token = id_token;
        config.env.access_token = access_token;
        config.env.tokenExpiryDate = expiry_date;
      }
    });
    await refreshToken(oauth2Client);
  } else {
    const { id_token, access_token } = config.env;
    oauth2Client.setCredentials({
      id_token,
      access_token,
    });
  }

  return oauth2Client;
};
