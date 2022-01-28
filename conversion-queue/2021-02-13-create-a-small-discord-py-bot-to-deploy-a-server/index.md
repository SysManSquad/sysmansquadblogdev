---
title: Create a small discord.py bot to deploy a server
author: Aaron
type: post
date: 2021-02-14T04:10:39+00:00
excerpt: Building a discord.py bot to deploy a discord server for a competition.
url: /2021/02/13/create-a-small-discord-py-bot-to-deploy-a-server/
featured_image: eagle-46636_1280.png
categories:
  - General
  - How-To
  - Python
  - Scripting

---
I volunteer to help run [Southwest CCDC](https://southwestccdc.com/) every year, and had a need to deploy all of the communication infrastructure in a hurry. With Covid Times™ upon us, we needed to move a competition that usually has at least one round in person to all-virtual. Discord was the obvious choice for how to do that successfully - it is targeted to communities of people, and has moderation tools. My discord server needed to have a few things:

  * A few general channels for normal Discord business - announcements, general chatter, help requests etc.
  * Private channels for each competing team
  * Private channels for staff to organize during the event

Given that the smallest round will usually have 8 teams and the largest round varies - the only answer to make it correctly, efficiently, and correctly seemed to be automation. Clicking around in a GUI isn't fast nor is it easy to track what's been done and what is left. Discord's settings screens are also always full-screen instead of being something smaller you can drag around.

## Creating a Discord bot

While my preferred language is PowerShell, sometimes there's no point re-inventing the wheel and it's worth it to get your hands dirty in a second language. In this case the best/most well supported option seemed to be python, in the form of [Discord.py](https://discordpy.readthedocs.io/en/latest/index.html). 

The first step is to head to Discord's [developer portal](https://discord.com/developers/applications) and create an application. Here's where you set the icon your bot will use, along with its name also a few extra bits.

Creating an application is not enough to give your bot a presence on a server, so you also need to move down to the Bot tab, and also add an icon and username there. While you're there you'll have to turn on the 'Server Members Intent' toggle. This is for [Reasons](https://discordpy.readthedocs.io/en/latest/intents.html). The short story is that Discord feels that bots shouldn't be able to read the members list merely by expressing that intent in code. Other intents don't need this, and can be requested in your bot code.

I did my development on an empty test server, so I switched to the OAuth2 tab, and selected the 'bot' scope, set the 'Administrator' permission, and copied/pasted the URL provided to a new tab to authorize my bot to join the test server. Yes, administrator is a dangerous permission to grant for a bot, but given that it's my code, I am fine with it in this case. Also some role-managing stuff didn't work particularly well without it.

## Writing the code

Discord.py has a few [examples](https://github.com/Rapptz/discord.py/tree/master/examples) you can start from. 

### Python Setup

Because I have been exposed to Python before, I was already aware that python projects should make use of [virtual environments](https://docs.python.org/3/tutorial/venv.html). I created a folder for my code, initialized [git](https://www.atlassian.com/git/tutorials) in the folder to help me keep track of code revisions and began to write.

I created my virtual environment as a sub-folder. I couldn't possibly say whether it's good practice, but it worked. The virtual environment was in a subfolder called 'venv' so I added it to my `.gitignore` file. You may find [pyenv](https://github.com/pyenv/pyenv) useful.


```powershell
venv/

```


Having activated my virtual environment, I followed the instructions to use `pip` to add the required modules for Discord.py, and added a few of my own. I wanted to avoid storing credentials in a git repository, and the best way to do that is to hand them off to a vault of some kind. A quick google search found me a module called `keyring`. I also wanted to make sure that as I typed the token to save it, it wouldn't echo to the screen, so that led me to another module called `getpass`. Seems simple enough so far - they all seem to do what they say they will. The bot's name is MR_FLOOFY. 


```python
import keyring
import getpass

service_id='MR_FLOOFY'
token=getpass.getpass(prompt='Token: ', stream=None)
keyring.set_password(service_id, service_id, token)
```


Having a few extra python `pip` modules in place, I followed the instructions to use `pip` to freeze the list of installed modules in my environment to `requirements.txt`. This will allow me to quickly re-create this virtual environment if it is destroyed, or I need to change where it's hosted.

With a Secure Enough™ way of saving and retrieving the token devised, I headed back to Discord's developer portal, my app, and the Bot tab to get the token I'd need to allow the bot to connect. 

I'm not going to describe the entire, frustrating process of learning just enough about python and Discord.py to make this work, I'm just going to describe how the code works now that it works well enough for my purposes. In the future I'll probably keep refining it. 

## The Bot

The first thing one typically does in a python file is import the modules you'll need in the script. 


```python
import sys
import discord
import keyring
import logging
```


Next, we set some discord-specific options, retrieve our token and build objects to use later. The `intents` object is used to tell Discord what things the bot will need access to, so we create the object with the defaults, then also ask for the member list. 

The `client` object is what we'll use later to make things go. The `logging` object seems to come for free because we used `import logging` earlier , I didn't have to specifically create it. We define the service id that matches the service id from when we ran `save_key.py` earlier. We then retrieve the token to use later. 

The logging settings are also very important - if you screw up and do too many things to some API endpoints, you'll get locked out of it for a period of time. Some of the endpoint limits are ridiculously low and the logging will print to the screen to let you know when you've hit one of those limits so you don't enrage yourself wondering why code that worked a few minutes ago doesn't work now.


```python
intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)
logging.basicConfig(level=logging.INFO)
service_id ='MR_FLOOFY'
TOKEN=keyring.get_password(service_id, service_id)
```


This bot is meant to listen for messages that meet criteria, so we use this code to define what the bot will look for. I mostly looked through the Discord.py examples linked earlier to figure out how to get started.

We define the event we care about, then say what should happen when that event fires, in our case `on_message`. I believe this is a 'callback' but don't quote me. The `message` object contains the contents of the message, who sent it, the server it came from, and a number of other useful properties.

If the message meets some criteria, we do some stuff, then `return` to end processing. In this case the only one that needs to issue commands is me, so our first two conditions just check to see if the bot is talking to itself, or whether the caller is not me. Obviously the second condition would make the first condition completely irrelevant - but I'm leaving it in for this example.


```python
@client.event
async def on_message(message):
    # we do not want the bot to reply to itself
    if message.author == client.user:
        return

    # I don't want the bot to react to anyone but me.
    if message.author.id != 00000000000:
        return

    if message.content.startswith('!exit'):
        print('Exit command received')
        await client.close()
```


CCDC games are run by [several teams](https://www.nationalccdc.org/index.php/competition/competitors/rules). Given the audience of this Discord server and it's purpose, I have to code for 5 separate roles.

  * Gold team - organizers of the competition
  * Black team - infrastructure for the game, including the game machines themselves
  * White team - folks who help run the people side of the competition. 
  * I also have to set up special rights for team coaches, who are allowed to observe but not help. 
  * A role for each team

I originally had all of this bundled up in one command. It was _really_ fun to issue one command and watch an entire discord server populate, but like all good things - it got too complicated and debugging turned into a pain. 

This next stanza sets up the non-competition roles, along with what color they should appear as, whether the role members should be listed apart from all other server members ('_hoisted_') , server-wide [permissions](https://discordapi.com/permissions.html), etc. 


```python
    if message.content.startswith('!staffroles'):
        guild = message.guild
        await guild.create_role(name="Gold Team", color=discord.Color(0xe6bc00), hoist=1, permissions=discord.Permissions(permissions=1341648705))
        await guild.create_role(name="Black Team", color=discord.Color(0x004d27), hoist=1, permissions=discord.Permissions(permissions=1341648705))
        await guild.create_role(name="White Team", color=discord.Color(0xffffff), hoist=1, permissions=discord.Permissions(permissions=1341648705))
        await guild.create_role(name="Coach", color=discord.Color(0xff3333), hoist=1, permissions=discord.Permissions(permissions=68224000))

```


Now, we need to create a category of channels for staff using these roles, along with customized permissions for channels inside that category. 

We begin by getting the role objects we created earlier. We then create permission override objects we'll use when we create the channels. Following that, we create the category, get an object representing it, and create channels using the category object and the permission overrides.


```python
    if message.content.startswith('!staffchannels'):
        guild = message.guild

        role_black=discord.utils.get(guild.roles, name="Black Team")
        role_gold=discord.utils.get(guild.roles, name="Gold Team")
        role_white=discord.utils.get(guild.roles, name="White Team")
        role_coach=discord.utils.get(guild.roles, name="Coach")

        all_staff_overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            role_gold: discord.PermissionOverwrite(read_messages=True),
            role_black: discord.PermissionOverwrite(read_messages=True),
            role_white: discord.PermissionOverwrite(read_messages=True)
        }

        gold_team_overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            role_gold: discord.PermissionOverwrite(read_messages=True),
            role_black: discord.PermissionOverwrite(read_messages=False),
            role_white: discord.PermissionOverwrite(read_messages=False)
        }

        black_team_overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            role_black: discord.PermissionOverwrite(read_messages=True),
            role_gold: discord.PermissionOverwrite(read_messages=False),
            role_white: discord.PermissionOverwrite(read_messages=False)
        }    
        gold_x_black_team_overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            role_gold: discord.PermissionOverwrite(read_messages=True),
            role_black: discord.PermissionOverwrite(read_messages=True),
            role_white: discord.PermissionOverwrite(read_messages=False)
        }
        coach_overwrites = {
            guild.default_role: discord.PermissionOverwrite(read_messages=False),
            role_gold: discord.PermissionOverwrite(read_messages=True),
            role_black: discord.PermissionOverwrite(read_messages=True),
            role_white: discord.PermissionOverwrite(read_messages=True),
            role_coach: discord.PermissionOverwrite(read_messages=True,send_messages=True)
        }

        await guild.create_category_channel(name="Staff", overwrites=all_staff_overwrites)
        staff_category=discord.utils.get(guild.categories, name="Staff")

        await guild.create_text_channel(name="Gold Team", category=staff_category, overwrites=gold_team_overwrites)
        await guild.create_text_channel(name="Black Team", category=staff_category, overwrites=black_team_overwrites)
        await guild.create_text_channel(name="Gold x Black Team", category=staff_category, overwrites=gold_x_black_team_overwrites)
        await guild.create_text_channel(name="coaches", category=staff_category, overwrites=coach_overwrites)
        await guild.create_text_channel(name="White Team", category=staff_category)
```


Here we come to the meat of the script - how do you quickly create a number of teams along with some work channels, locked down to keep each blue team out of each other's business? Some loops mostly, using the code we've already seen above.

Generally speaking, here's how the permissions for teams are supposed to work:

Black/Gold/White/[1 Blue team] should have r/w for text and voice, while coaches can see everything and say nothing. This is to replicate the in-person experience where team coaches serve as room monitors for all teams except their own. It's not just about rule enforcement however, coaches have access to this level of information because it will help them coach their teams and learn from other team experiences. Since the ultimate goal of the competition is education, this aligns with that goal without making the competition unfair.

The coach role permissions below are not good enough, they allow the guild-wide permissions for the coach role to filter down to the teams. I'll change how those work in future versions of Mr Floofy.


```python
    if message.content.startswith('!deployteams'):
        guild = message.guild

        numTeams = int(message.content.split(' ')[1])

        role_black=discord.utils.get(guild.roles, name="Black Team")
        role_gold=discord.utils.get(guild.roles, name="Gold Team")
        role_white=discord.utils.get(guild.roles, name="White Team")
        role_coach=discord.utils.get(guild.roles, name="Coach")

        for i in range(1,numTeams):
            await guild.create_role(name="Team{:02d}".format(i),color=discord.Color(0x0d6dc9),hoist=1,permissions=discord.Permissions(permissions=36818496))
            role=discord.utils.get(guild.roles,name="Team{:02d}".format(i))

            blue_team_overwrites = {
                guild.default_role: discord.PermissionOverwrite(read_messages=False),
                role_gold: discord.PermissionOverwrite(read_messages=True),
                role_black: discord.PermissionOverwrite(read_messages=True),
                role_white: discord.PermissionOverwrite(read_messages=True),
                role_coach: discord.PermissionOverwrite(read_messages=True),
                role: discord.PermissionOverwrite(read_messages=True)
            }

            await guild.create_category_channel(name="Team{:02d}".format(i), overwrites=blue_team_overwrites)
            category=discord.utils.get(guild.categories,name="Team{:02d}".format(i))

            # Use the category to create child-channels. This section is easy to modify if we want to give more than the allotted amount of channels below to allow teams to split communication.
            await guild.create_text_channel(name="Team{:02d} General".format(i),category=category, topic='General chit-chat')
            await guild.create_text_channel(name="Team{:02d} Retrospective".format(i),category=category, topic='Notes for after-action - what went wrong, what went right for your team and SWCCDC staff.')
            await guild.create_text_channel(name="Team{:02d} A".format(i),category=category, topic='Channel to separate efforts and reduce cross-talk')
            await guild.create_text_channel(name="Team{:02d} B".format(i),category=category, topic='Channel to separate efforts and reduce cross-talk')
            await guild.create_text_channel(name="Team{:02d} C".format(i),category=category, topic='Channel to separate efforts and reduce cross-talk')
            await guild.create_voice_channel(name="Team{:02d} Voice 1".format(i),category=category)
            await guild.create_voice_channel(name="Team{:02d} Voice 2".format(i),category=category)

```


As you can see, we create a number of channels. Between the number of categories and channels involved, doing this by hand would be prohibitive and prone to failure.

Lastly, as a final command to help set things up, I wanted a way to automate assigning a user to a role in a way where I could easily paste some commands and get a team in their roles from a spreadsheet, given how the list of team members would be sent to me.


```python
    if message.content.startswith('!assign'):
        guild = message.guild
        userid = int(message.content.split(' ')[1])
        teamid = str(message.content.split(' ')[2])
        userobject = guild.get_member(userid)

        role=discord.utils.get(guild.roles, name=teamid)
        if(userobject == None):
            await message.channel.send('They are not here yet!')
            return
        try:
            await userobject.add_roles(role)
        except Exception as e:
            await message.channel.send('There was an error running this command ' + str(e))
        else:
            await message.channel.send('I think it worked')

```


It should be noted that the roles are case-sensitive here.

Lastly, we need an event to fire when the script has initialized and begun to run. We'll use the objects from the top of the script and tell the bot to go.


```python
@client.event
async def on_ready():
    print(client.user.id)
    print('------')

client.run(TOKEN)

```


## Conclusion

It has been an interesting experience building this bot, and as simple as it is, I'm very proud of it. I look forward to extending or replacing it with a proper PowerShell bot, perhaps [PoshBot](https://github.com/poshbotio/PoshBot). I deeply hate the experience of trying to debug python, especially in the context of a bot like this. 

I hope it's been instructive to you. 

I want to thank my friend [George](https://twitter.com/duplico) for both his expertise and patience as I struggled through some of the nastier parts of getting used to Python.

I also want to thank the fine folks at [Pixabay](https://pixabay.com/vectors/eagle-snake-kill-bird-wings-claws-46636/) for this beautiful header image that expresses my feelings about python.

