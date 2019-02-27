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
      const url = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirect_uri}`;
      window.location = url;
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
    let accessToken = Spotify.getUserAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    if(!playlistName || !trackURIs.length){
      return;
    }

      let userID='';
      let playlistID='';



      return fetch('https://api.spotify.com/v1/me',{
        headers: headers,
      }).then( response => {
        const jsonResponse = response.json();
        return jsonResponse;
      }).then( jsonResponse => {
        userID = jsonResponse.id;

              return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({name: playlistName})
              }).then(response => {
                const jsonResponse = response.json();
                return jsonResponse;
              }).then( jsonResponse => {
                  playlistID = jsonResponse.id;
                  console.log(playlistID);

                                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                                  headers: headers,
                                  method: 'POST',
                                  body: JSON.stringify({uris: trackURIs})
                                })
              })

      })
  },


}




export default Spotify;
