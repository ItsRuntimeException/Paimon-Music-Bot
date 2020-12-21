***Personal Project; Last Updated: December 21, 2020***
# [Discord Bot] Paimon-chan #
A Discord bot with various functionalities I desired to have.<br/>
<img src="moji/PaimonRub.gif" width="128" height="128">
<img src="moji/PaimonPeeks.gif" width="128" height="128">
<img src="moji/PaimonSpins.gif" width="128" height="128">
<img src="moji/PaimonCookies.gif" width="128" height="128">

**Steps**
1. Make sure to have npm and nodeJS installed.<br/>
2. Run "1 install_dependencies.bat".<br/>
3. Copy your bot-token and put it inside '.\json_data\login_tokens.json'.<br/>
4. Run '2 start.bat' or you can host it online with heroku/other servers.<br/>

Finally, If you want music capabilities, please follow the instructions in 'README - Add music support.txt'.<br/>

**Short list of bot-commands**
- [Help](#Help)
- [Music Support](#Music-Support)
- [Super Access Commands](#Super-Access-Commands)
- [Genshin Impact](#Genshin-Impact)
- [ETC](#Other-Commands)

# Help #
Display a list of bot commands and its usage.

Example Usage |
| :---
?Help

# Music Support #
Command | param | Description
| :--- | :--- | :---
?play \[string\] | Youtube-URL<br/>Keywords | Play music from youtube.
?playLocal \[string\] | Category | Play music from local_folder.
?musicInfo | N/A | Fetch details of current song.
?vol \[int?Optional\] | server.volume | Change the volume of the server's dispatcher.
?pause | N/A | Pause music from playing.
?resume | N/A | Resume current paused music.
?skip \[int?Optional\] | skipNum | Skip current \| skipNum of songs in queue.
?stop | N/A | Stop music and clear queue.
?loop \[string?Optional\]  | on \| off | Loop current music.

?queue \[int?Optional\]  | queue_display_size | Display current queue.
?shuffle | N/A | Shuffle queue.

**Paimon in action:**

<img src="examples/music_example_1.png" width="700"><br/>

<img src="examples/music_example_2.png" width="700"><br/>
<img src="examples/music_example_3.png" width="700"><br/>
<img src="examples/music_example_4.png" width="700"><br/>

# Super Access Commands #
Can be used if 'SuperAccess' is granted by the owner \| exisiting admin w/ 'SuperAcess'.<br/>

Command | param | Description
| :--- | :--- | :---
?caching \[string?Optional\] | on \| off | Preload audio data into a file, then stream it (Lower stream-quality?).
?dlmusic | N/A | Download music from pre-cached music file.
?clean \[int?Optional\] | numLines | Clean channel messages.
?shutdown | N/A | Shutdown the bot from the server.
?add super \[param\]<br/>?add superAccess \[param\] | @userTag | Remove a specified user from SuperAccess-commands.
?remove super \[param\]<br/>?remove superAccess \[param\] | @userTag | Add a specified user from SuperAccess-commands.

**Audio Caching/Downloading:**

 <img src="examples/superAccess_music_caching.png" width="728">

**Add new SuperAccess member:**

admins.json (Before) | admins.json (After)
| :---: | :---:
<img src="examples/superAccess_before.png" width="364"> | <img src="examples/superAccess_after.png" width="364">
<img src="examples/superAccess_example_1.png" width="728">

# Genshin Impact #
Command | bannerType | pityType | Operation | Description
| :--- | :--- | :--- | :--- | :---
?gCreate | N/A | N/A | N/A | Create a default Genshin Impact Gacha Table.
?gShowtable | N/A | N/A | N/A | Display the user's current Genshin Impact Gacha Table.
?gPity<br/>\[pityType: string?Optional\] | N/A | Normal<br/>Soft | N/A | Display the calculated wishes (or primogem) until your next 5-star pity item.
?gWish<br/>\[bannerType: string\]<br/>\[Operation\]<br/>\[int\] | Standard<br/>Weapon<br/>Event | N/A | Add<br/>Replace | Manually modify the specified count of bannerType in the user's Genshin Gacha Table.
?gReset<br/>\[bannerType: string\] | Standard<br/>Weapon<br/>Event | N/A | N/A | Manually reset the specified count of bannerType in the user's Genshin Gacha Table.

**Test Run:**

 <img src="examples/genshin_example_1.png" width="700"><br/>
 <img src="examples/genshin_example_2.png" width="700"><br/>

# Other Commands #
Command | Description
| :--- | :---
?mapleStory | Give the user my maplestory guild page.
?roll | Roll two random numbers from 1-6 (Dice Function).

**Examples:**

 <img src="examples/etc_example.png" width="700"><br/>
