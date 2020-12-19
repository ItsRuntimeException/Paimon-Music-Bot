***Personal Project; Last Updated: December 19, 2020***
# Random Functionality (Discord) Bot #
A Discord bot with various random functionalities.

Step 1: Make sure to have npm and nodeJS installed.<br/>
Step 2: Run "install_dependencies.bat".<br/>
Step 3: Replace the text in "/source/bot_token.txt" with your own bot token.<br/>
Step 4: Run 'native_boot.bat' or you can host it online with heroku/other servers.<br/>

**Example Usage**
| :---
?\[command\]

**Short list of bot-commands**
- [Help](#Help)
- [Music Support](#Music-Support)
- [Super Acess](#Super-Access)
- [Genshin Impact](#Genshin-Impact)
- [MapleStory](#MapleStory)
- [Roll](#Roll)

# Help #
Display a list of bot commands and its usage.

# Music Support #
Command | param | Description
| :--- | :--- | :---
?play \[string\] | Youtube-URL<br/>Keywords | Play music from youtube.
?playLocal \[string\] | Category | Play music from local_folder.
?pause | N/A | Pause music from playing.
?resume | N/A | Resume current paused music.
?skip \[int?Optional\] | skipNum | Skip current \| skipNum of songs in queue.
?stop | N/A | Stop music and clear queue.
?loop \[string?Optional\]  | on \| off | Loop current music.
?queue \[int?Optional\]  | queue_display_size | Display current queue.
?shuffle | N/A | Shuffle queue.

# Genshin Impact #
Command | bannerType | operation | Description
| :--- | :--- | :--- | :---
?gCreate | N/A | N/A | Create a default Genshin Impact Gacha Table.
?gShowtable | N/A | N/A | Display the user's current Genshin Impact Gacha Table.
?gWish \[bannerType\] \[operation\] \[int\] | Standard<br/>Weapon<br/>Event | Add<br/>Replace | Modify the specified banner in the user's Genshin Gacha Table.
?gReset \[bannerType\] | Standard<br/>Weapon<br/>Event | N/A | Reset the specified banner in the user's Genshin Gacha Table.

# Super Access Commands #
Can be used if 'SuperAccess' is granted by the owner \| exisiting admin w/ 'SuperAcess'.
Command | param | Description
| :--- | :--- | :---
?add super \[param\]<br/>?add superAccess \[param\] | @userTag | Remove a specified user from SuperAccess-commands.
?remove super \[param\]<br/>?remove superAccess \[param\] | @userTag | Add a specified user from SuperAccess-commands.
?clean \[int?Optional\] | numLines | Clean channel messages.
?shutdown | N/A | Shutdown the bot from the server.

# MapleStory #
Give the user my maplestory guild page.

# Roll #
Roll a random number from 1-6 (Dice Function).
