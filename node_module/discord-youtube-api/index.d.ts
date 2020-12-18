declare module "discord-youtube-api" {
	export interface DurationObject {
			years: number;
			months: number;
			weeks: number;
			days: number;
			hours: number;
			minutes: number;
			seconds: number;
	}

	export class Video {
		public constructor(data: any);

		public title: string;
		public id: string;
		public description: string;
		public duration: DurationObject;
		public durationSeconds: number;
		public data: any;

		public get length(): string;
		public get url(): string;
		public get thumbnail(): string;
	}

	class YouTube {
		public constructor(key: string);

		public key: string;
		public base: string;

		public getVideoByID(id: string): Promise<Video>;
		public getVideo(url: string): Promise<Video>;
		public getPlaylistByID(id: string): Promise<Video[]>;
		public getPlaylist(url: string): Promise<Video[]>;
		public searchVideos(query: string, max: number = 1): Promise<Video>;
	}

	export = YouTube;
}