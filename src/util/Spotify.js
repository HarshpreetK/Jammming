const CLIENT_ID = '2f3042d5149345a8a07182230d6f2037';
const redirect_uri = 'http://localhost:3002';
let userAccessToken;

const Spotify = {
  getUserAccessToken(){
    if(userAccessToken){
      return userAccessToken;
    }
    const parsedAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const parsedExpiration = window.location.href.match(/expires_in=([^&]*)/);

    if(parsedAccessToken && parsedExpiration){
      userAccessToken = parsedAccessToken[1];
      let tokenExpiry = Number(parsedExpiration[1]);
      window.setTimeout(() => userAccessToken = '', tokenExpiry * 100);
      window.history.pushState('Access Token', null, '/');
      return userAccessToken;
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user-read-private%20user-read-email&response_type=token`;
    }

  },

  search(term){
    const accessToken = Spotify.getUserAccessToken();

    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers:{
        Authorization: `Bearer ${accessToken}`
      }}).then( response => {
        return response.json();
      }).then(jsonResponse => {
        if(!jsonResponse.tracks){
          return [];
        } else {
          return jsonResponse.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            album: track.album.name,
            artist: track.artists[0].name,
            uri: track.uri
          }))
        };
      })
  },

  savePlaylist(playlistName, trackURIs){
    if(!playlistName || !trackURIs){
      return;
    } else {
      let accessToken = Spotify.getUserAccessToken();
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      //let userID;

      return fetch('https://api.spotify.com/v1/me',{
        headers: headers,
      }).then( response => {
        return response.json();
      }).then( jsonResponse => {
        let userID = jsonResponse.id;

              return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: playlistName})
              }).then(response => {
                return response.json();
              }).then( jsonResponse => {
                  let playlistID = jsonResponse.id;

                                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                                  headers: headers,
                                  method: 'POST',
                                  body: JSON.stringify({uris: trackURIs})
                                })
              })

      })


    }
  },


}




export default Spotify;
