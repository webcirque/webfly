# WebFly
Whole new implementation of Safiullin's Cafechat.app

## Status

## Installing
No server-side configuration required, because it is only a set of static files. It even works with only GitHub/GitLab Pages!

Download ZIP or TGZ archives from the releases, and then extract them somewhere you wish.

## Configuration
### iconidx.json
This is the file used by WEBSF Icon Manager, which contains all of in-app icon resources and sizing specs.

**DO NOT CHANGE IF YOU DO NOT KNOW WHAT WILL HAPPEN!**
### config.json
#### ```groups {}```
Specifies the configuration towards groups.
##### ```list []```
Specifies the default list of Telegram groups for your users to join.
###### ```id```
The ID of the target Telegram group.
###### ```name```
The display name of that group chat.
##### ```default```
The index of the default Telegram group to show up.
##### ```allowCustom```
Controls whether user modifies the group list client-side is allowed.

For dedicated customer chats, it is recommended to turn this on.
#### ```users {}```
Specifies what you want your users to behave client-side.
##### ```allowCustom```
Controls whether users can choose their own usernames. If set to ```false```, only randomly generated usernames are allowed.
##### ```minLength```
Minimum length of a valid username. A value above 5 is recommended.
##### ```maxLength```
Maximum length of a valid username. A value below 21 is strongly recommended.
##### ```randomizer {}```
Tells the client how to generate a username.
###### ```map```
All of the characters that is allowed to show up in a randomly-generated username.
###### ```length```
The length of a randomly-generated username.
#### ```server {}```
Specifies the target remote bridge server.
##### ```remote```
The real remote server for bridging messages.
##### ```protocol```
The protocol of the bridge.

* ```safiullin```: The protocol used by InstantChatBot
##### ```greetOnJoin```
If set to true, the client will send an greeting message to the remote upon join. Invisible on the client-side GUI.
##### ```byeOnLeave```
If set to true, the client will send an greeting message to the remote upon leaving. Invisible on the client-side GUI.
#### ```info {}```
Control what extra information will users send to the remote bridge server.
##### realPath
Whether the real path of the client's URL will be sent to the remote server.
##### fakePath
What will the client send to the remote server instead of the real one if ```realPath``` is set to ```false```.
##### realHost
Whether the real domain which hosts the client will be sent to the remote server.
##### fakeHost
What will the client send to the remote server instead of the real one if ```realHost``` is set to ```false```.
