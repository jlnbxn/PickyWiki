export default class WikipediaApi {
  constructor({ clientId, redirectUri }) {
    this.clientId = clientId;
    this.redirectUri = redirectUri;
  }

  getLoginUrl = () => {
    return `https://en.wikipedia.org/w/rest.php/oauth2/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${this.redirectUri}`;
  };

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  async getCurrentUser() {
    const response = await fetch(
      "/cors-proxy/https://en.wikipedia.org/w/api.php?action=query&meta=userinfo&uiprop=rights&format=json",
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    ).then((res) => res.json());

    return response.query.userinfo.name;
  }

  async getWatchlist() {
    try {
      let list = [];
      let response = await fetch(
        "/cors-proxy/https://en.wikipedia.org/w/api.php?action=query&format=json&list=watchlistraw&wrnamespace=0&wrlimit=500",
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
        }
      ).then((res) => res.json());

      list = response.watchlistraw;

      while (response.continue) {
        response = await fetch(
          `/cors-proxy/https://en.wikipedia.org/w/api.php?action=query&format=json&list=watchlistraw&wrnamespace=0&wrlimit=500&wrcontinue=${response.continue.wrcontinue}`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
          }
        ).then((res) => res.json());

        list = list.concat(response.watchlistraw);
      }

      return list;
    } catch (error) {
      console.log(error);
    }
  }

  async getThumbnailUrl(keyword) {
    const response = await fetch(
      `/cors-proxy/https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=thumbnail&titles=${keyword}&pithumbsize=600`
    ).then((res) => res.json());
    const pageId = Object.keys(response.query.pages)[0];
    const thumbnailUrl = response.query.pages[pageId].thumbnail?.source;
    return thumbnailUrl;
  }
}
