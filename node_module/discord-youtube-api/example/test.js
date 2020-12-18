const YouTube = require("../index");

const youtube = new YouTube("google api key");

async function testAll() {
	const video1 = await youtube.getVideo("https://www.youtube.com/watch?v=5NPBIwQyPWE");
	const video2 = await youtube.getVideoByID("5NPBIwQyPWE");
	const video3 = await youtube.searchVideos("big poppa biggie smalls");
	const videoArray1 = await youtube.getPlaylist("https://www.youtube.com/playlist?list=PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");
	const videoArray2 = await youtube.getPlaylistByID("PLxyf3paml4dNMlJURcEOND0StDN1Q4yWz");

	console.log(video1, video2, video3, videoArray1, videoArray2);
}

testAll();