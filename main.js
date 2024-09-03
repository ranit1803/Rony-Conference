const APP_ID = "f5d35bf2a6e5462ba6459c6ed7fe1260";
const TOKEN = "007eJxTYJg7t2mhuLqs7NMyfc+3gusW8F/oO1DAljHTpeHRVhvng/MUGNJMU4xNk9KMEs1STU3MjJISzUxMLZPNUlPM01INjcwMbGZcS2sIZGToeX+PkZEBAkF8FobcxMw8BgYAIvcfww==";
const CHANNEL = "main";
const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

let localTracks = [];
let remoteUsers = {};

let join_and_display_local_stream = async () => {
    try {
        client.on('user-published', handleUserJoined)
        client.on('user-left', handleUserLeft)
        let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);
        localTracks = await AgoraRTC.createMicrophoneAndCameraTracks(); // Corrected function name

        let player = `<div class="video-container" id="user-container-${UID}">
            <div class="video-player" id="user-${UID}"></div>
        </div>`;
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player); // Corrected insertion point
        localTracks[1].play(`user-${UID}`);
        await client.publish([localTracks[0], localTracks[1]]);
    } catch (error) {
        console.error("Error joining and displaying local stream:", error); // Add error handling
    }
};

let joinStream = async () => {
    await join_and_display_local_stream();
    document.getElementById('Join-btn').style.display = 'none';
    document.getElementById('stream-control').style.display = 'flex';
};

let handleUserJoined = async(user, mediaType) =>{
    remoteUsers[user.uid]=user
    await client.subscribe(user,mediaType)

    if (mediaType==='video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if(player!=null){
            player.remove()
        }
        player = `<div class="video-container" id="user-conatiner -${user.uid}">
        <div class="video-player" id="user-${user.uid}"></div>
        </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player);
        user.videoTrack.play(`user-${user.uid}`)
    }
    if(mediaType==='audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async(user)=>
{
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leave_and_remove_localStream = async()=>{
    for(let i=0; localTracks.length>i;i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    await client.leave()
    document.getElementById('Join-btn').style.display='block'
    document.getElementById('stream-control').style.display = 'none';
    document.getElementById('video-streams').innerHTML=''
}
let toggleMic = async(e)=>{
    if(localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = '#ba0000'
    }
    else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async(e)=>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = '#ba0000'
    }
    else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#ee4b2b'
    }
}
document.getElementById('Join-btn').addEventListener('click', joinStream);
document.getElementById('Leave-btn').addEventListener('click', leave_and_remove_localStream);
document.getElementById('Mic-btn').addEventListener('click', toggleMic);
document.getElementById('Camera-btn').addEventListener('click', toggleCamera);
