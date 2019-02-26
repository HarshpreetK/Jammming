const clientID = '2f3042d5149345a8a07182230d6f2037';
const redirectURI = 'http://localhost:3002/';
let accessToken = '';
let expiresIn = '';
//const url = `${authorizeURL}client_id=${clientID}&redirect_uri=${redirectURI}&scope=playlist-modify-public&response_type=token&state=${state}`;
const url = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;


const Spotify = {
  getAccessToken(){
    if(accessToken){
      return accessToken;
    }
    const retreivedAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const retreivedExpiration =  window.location.href.match(/expires_in=([^&]*)/);

    if(retreivedAccessToken && retreivedExpiration){
      accessToken = retreivedAccessToken;
      expiresIn = retreivedExpiration[1];
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      window.location = url;
    }
  },

  search(term){
    let accessToken = Spotify.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(response => {
      if (response.ok){return response.json()}
      else { console.log('Error')}
    }).then(jsonResponse => {
        if(!jsonResponse.tracks){
          return [];
        } else {
          return jsonResponse.tracks.items.map(track =>{
            return {
              id: track.id,
            name: track.name,
            album: track.album.name,
            artist: track.artists[0].name,
            uri: track.uri
            }
          })

        }
      })
  },

  savePlaylist(name, trackUris){
    let accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };

    let userId;

    if(name && trackUris){
      return fetch('https://api.spotify.com/v1/me', {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({ name: name})
      }).then(response =>{
        if(response.ok){
        return response.json()
      } else{
        console.log('Error')
      }
      }).then(jsonResponse => jsonResponse.id)
    } else {
      return;
    }

  },

  createPlaylist(name){
    const headers = {
      Authorization: `Bearer ${accessToken}`
    };
    let userID = this.getUsername();
    let  playlistID;

    return fetch('', {
      headers: headers,
      method: "POST",
      body: JSON.stringify({name: name})
    }).then(response => response.json()
    ).then(jsonResponse => jsonResponse.id)
  },

  addTrackToPlaylist(trackURIs){
    let accessToken = this.getAccessToken();
    let playlist_id = this.getPlaylistID();
    let user_id = this.getUsername();
    const headers = {
      ContentType: 'application/json',
      Authorization: `Bearer ${accessToken}`
    };

    return fetch(`https://api.spotify.com/v1/users/${user_id}/playlists/${playlist_id}/tracks`,{
      headers: headers,
      method: "POST",
      body: JSON.stringify({uris: trackURIs})
    })
  }

  }



export default Spotify;
