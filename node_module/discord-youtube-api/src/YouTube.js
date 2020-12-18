const Video = require("./Video");
const snekfetch = require("snekfetch");
const url = require("url");

class YouTube {

	constructor(key) {
		this.key = key;
		this.base = "https://www.googleapis.com/youtube/v3"
	}

	async getVideoByID(id) {
		const part = "contentDetails,snippet";
		try {
			const response = await snekfetch.get(`${this.base}/videos?part=${part}&key=${this.key}&id=${id}`);
			return new Video(JSON.parse(response.text));
		} catch (err) {
			throw new Error("Couldn't retrieve video");
		}
	}

	async getVideo(link) {
		const parsed = url.parse(link, true);
		const id = parsed.query.v;
		if (!!id && this.testID(id)) return await this.getVideoByID(id);
		else throw new Error("Cannot resolve video ID");
	}

	async searchVideos(query) {
		const max = 1;
		const part = "snippet";
		const type = "video";
		try {
			const response = await snekfetch.get(`${this.base}/search?part=${part}&key=${this.key}&maxResults=${max}&type=${type}&q=${query}`); 
			return await this.getVideoByID(JSON.parse(response.text).items[0].id.videoId);
		} catch (err) {
			throw new Error("Couldn't retrieve video");
		}
	}

	/* Modified to fetch all videos from a playlist */
	async getPlaylistByID(id) {
		const max = 50;
		const part = "snippet";

		try {
			console.log(`Fetching only up to 50 videos, please be patient if this takes awhile...`);
			/* Paging */
			const response = await snekfetch.get(`${this.base}/playlistItems?part=${part}&key=${this.key}&playlistId=${id}&maxResults=${max}`);
				var videos = await Promise.all(JSON.parse(response.text).items.map(async item => {
					try {
						return await this.getVideoByID(item.snippet.resourceId.videoId);
					} catch (err) {
						return null;
					}
				}));
		} catch (err) {
			throw new Error("Couldn't retrieve playlist");
		}
		return videos.filter(v => !!v);
	}

	async getPlaylist(link) {
		const parsed = url.parse(link, true);
		const id = parsed.query.list;
		if (!!id && this.testID(id)) return await this.getPlaylistByID(id);
		else throw new Error("Cannot resolve playlist ID");
	}

	testID(id) {
		return /[A-Za-z0-9_-]+/.test(id);
	}
}

module.exports = YouTube;
