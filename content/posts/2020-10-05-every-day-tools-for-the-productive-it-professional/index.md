---
title: Every day tools for the productive IT professional
author: acc
type: post
date: 2020-10-05T16:11:12+00:00
url: /2020/10/05/every-day-tools-for-the-productive-it-professional/
featured_image: toolbox-2645700_640.jpg
categories:
  - General
tags:
  - productivity

---
In this post I want to share with you a list of tips and tools that I feel have boosted my day-to-day productivity on the computer.

The title suggests this is only for IT professionals. However I can't see why power users can't appreciate what's here too.

You may already have different tools that achieve similar, or better, functionality, so drop a comment below or tweet your tip on Twitter using the hashtag **#EveryDayITPro**.

For each of the below I will link to the resource, offer a brief description on the tool and whether it's free or not. I'll also explain some key features which I believe are most useful.

### Ditto

  [Ditto](https://ditto-cp.sourceforge.io/) is an extension to the Windows Clipboard. You copy something to the Clipboard and Ditto takes what you copied and stores it in a database to retrieve at a later time.

  At the time of writing this, it's free and open source.

  Since Windows 10 1809, a clipboard history is introduced natively in to Windows by pressing `WIN` + `V`. It may require you to [enable it first in the settings](https://support.microsoft.com/help/4028529/windows-10-clipboard).

  However this has nothing on Ditto. Ditto is a clipboard manager on steroids. Some of the extra functionality you have when using Ditto:

* Configure your clipboard history size based on number of items or number of days
* Create an allow or deny list of applications that controls which applications Ditto stores in your clipboard history
* Paste only text (strip any sort of rich text formatting)
* Share your clipboard with other machines on your network
* Set keyboard shortcuts to access your clipboard's history in any position ranging from n to n-10, i.e. instead of `CTRL` + `V` only remembering your last copied item, you can create hot keys such as `CTRL` + `ALT` + `9` to access your 9th copied item in your clipboard history
* Set different keyboard shortcuts for different applications

### PowerToys

> [Microsoft PowerToys](https://github.com/microsoft/PowerToys) is a set of utilities for power users to tune and streamline their Windows experience for greater productivity. Inspired by the[Windows 95 era PowerToys project](https://en.wikipedia.org/wiki/Microsoft_PowerToys), this reboot provides power users with ways to squeeze more efficiency out of the Windows 10 shell and customize it for individual workflows. A great overview of the Windows 95 PowerToys can be found[here](https://socket3.wordpress.com/2016/10/22/using-windows-95-powertoys/).
    
  _[https://github.com/microsoft/PowerToys](https://github.com/microsoft/PowerToys)_
</blockquote>

  At the time of writing this, it's free and open source.

  For me, two features of PowerToys I can no longer live without are [FancyZones](https://github.com/microsoft/PowerToys/wiki/FancyZones-Overview) and [PowerToys Run](https://github.com/microsoft/PowerToys/wiki/PowerToys-Run-Overview).

  FancyZones enables me to designate "zones" as areas on my screen, then when I hold `SHIFT` and drag the window near the zone, it snaps in to shape/position. This lets me design my ideal window layout across my two 27" 1440p displays and capitalise on screen real estate.

  The team writing the modern PowerToys are rapidly adding new features so be sure to [check out the GitHub page](https://github.com/microsoft/PowerToys) for the latest news.

  At the time of writing this PowerToys also gives you:

* Colour picker
* Markdown (.md) and SVG (.svg) in the File Explorer Preview Pane
* Image Resizer
* Keyboard Manager
* PowerRename
* PowerToys Run
* Video Conference Mute

### Everything

No exaggeration, [Everything](https://www.voidtools.com/) locates files and folders by name **instantly**.

At the time of writing this, it's free and open source.

Got a file on disk somewhere named "thisis123maybeatextfile.pdf", but you can only remember the fact its extension is "pdf" and it contained "123" in the file name? No sweat.

This easily trumps Windows Search. It achieves superior performance by querying the NTFS Master File Table, rather than attempting to search, index and maintain its own database.

If regex is your jam and you want granular control, then you'll love Everything even more because it supports regex.

A scenario which I'm hugely grateful for of Everything for is searching SharePoint. We host our documentation on our internal SharePoint Online. Instead of using SharePoint's clunky search facility, I [sync the library to my machine](https://support.microsoft.com/office/sync-sharepoint-files-and-folders-87a96948-4dd7-43e4-aca1-53f3e18bea9b) and reap the benefits of using Everything's.

### SnagIt

[SnagIt](https://www.techsmith.com/screen-capture.html) is effectively Windows' native utility Snipping Tool, except it's also on steroids.

SnagIt is not free. This post, nor SysManSquad, are not sponsored by TechSmith.

I like SnagIt because it enables me to be effective for tasks like blog and documentation writing. It lets me grab what I see on screen and quickly annotate it.

It can go further and let you screen record, and save as .gif or .mp4.

I also like its built-in library. It stores all all of your screen snips or recordings in to a logical layout: by year, application, recent captures or by tags if you're that organised.

I especially like how I can free-form snip a window - where say an application occupies a larger % of the image - and SnagIt recognises that, and can categorise it under said application within your library.

I have a hot key set up with SnagIt to immediately start free-form snipping when I press `CTRL` + `SHIFT` + `Z`. Once snipped, it auto opens in the editor and puts it in my clipboard too.

There are also times when I really appreciate its ability to do OCR; reading text in an area of an image and produce a window where you can highlight and copy the text.

Some real popular [alternatives](https://alternativeto.net/software/snagit/), which are free, are [ShareX](https://getsharex.com/) and [Greenshot](https://getgreenshot.org/).

### AltDrag

[AltDrag](https://stefansundin.github.io/altdrag/) gives you the ability to move and resize windows in a new way.

At the time of writing this, it's free and open source.

I love that I can easily move a window by holding `ALT` and left click a window anywhere - not just the title bar - and drag it.

I can even resize it by holding `ALT` and use the right mouse button.

If you use a system which has scaling / DPI to be configured anything other than 100%, this won't work. [Here's an open issue that will better describe what you will experience](https://github.com/stefansundin/altdrag/issues/118).

It seems the original author is unable to commit on the project right now. However, the good news is that the [PowerToys team at Microsoft are planning to bring this feature to PowerToys](https://github.com/stefansundin/altdrag/issues/118)!

### Chocolatey

[Chocolatey](https://chocolatey.org/) is a sweet, sweet repository of packages which helps you automate installation of software.

Chocolatey is free with an option for extra paid-for features and support.

This isn't majorly common in terms of frequency of use for me, but I do find myself working on many machines as part of my job. Using Chocolatey, I can install everything I want/need very quickly.

I keep [Install-Choco](https://github.com/codaamok/codaamok/blob/master/codaamok/Public/Install-Choco.ps1) in my profile module and maintain [Get-MyChocoPackages](https://github.com/codaamok/codaamok/blob/master/codaamok/Public/Get-MyChocoPackages.ps1) so I can easily pass that to `choco install` in an elevated PowerShell console. I grab a coffee, come back, wait a little while longer, and all my preferred utilities are installed.

### ZoomIt

[ZoomIt](https://docs.microsoft.com/sysinternals/downloads/zoomit) is part of the [Windows Sysinternals suite](https://docs.microsoft.com/sysinternals/).

ZoomIt, and all other utilities in the Windows Sysinternals suite, are free.

> ZoomIt is a screen zoom and annotation tool for technical presentations that include application demonstrations. ZoomIt runs unobtrusively in the tray and activates with customizable hotkeys to zoom in on an area of the screen, move around while zoomed, and draw on the zoomed image. I wrote ZoomIt to fit my specific needs and use it in all my presentations.
>
> _[https://docs.microsoft.com/en-us/sysinternals/downloads/zoomit](https://docs.microsoft.com/sysinternals/downloads/zoomit)_

I can zoom in to a specific area using a hot key. The default is `CTRL` + `1` to zoom in with no cursor, or `CTRL` + `4` with cursor. You can immediately start annotating on screen while zoomed in using left click, or press `CTRL` + `2` to begin annotating on my screen while not zoomed in.

There's a bunch more you can do, e.g. change pen colour for annotations, annotate straight lines by holding `SHIFT` or squared objects by holding `CTRL`, increase line thickness, show an on-screen timer to illustrate a break timer (increase/decrease counter with the up/down keys).

Much like Chocolatey, this isn't common for me in terms of frequency of use, but is a fantastic tool if you're trying to focus the audience on a particular area on your screen while presenting - whether that's via Teams or in-person.

### PowerShell profile

If you don't already have a PowerShell profile configured on your machine, now is your chance!

What's a PowerShell profile?

> A PowerShell profile is a script that runs when PowerShell starts. You can use the profile as a logon script to customize the environment. You can add commands, aliases, functions, variables, snap-ins, modules, and PowerShell drives. You can also add other session-specific elements to your profile so they are available in every session without having to import or re-create them.
  
_about_Profiles - [Microsoft docs](https://docs.microsoft.com/powershell/module/microsoft.powershell.core/about/about_profiles?view=powershell-7)_
</blockquote>

If you work across multiple machines, or want to keep it backed up, you could store it a Gist. This is what Steve Lee, Principal Software Engineer Manager at Microsoft, [does with his PowerShell profile](https://gist.github.com/SteveL-MSFT/a208d2bd924691bae7ec7904cab0bd8e).

In there you can see there's an auto-update mechanism going on, so therefore there's versioning and a background thread job to update the profile from his GitHub Gist, ready for next time he launches PowerShell.

As I previously mentioned, as part of my job I often work across several machines. Using a PowerShell profile enables me to take my preferred functions with me everywhere I go.

However It eventually got a bit out of control. It grew to roughly 2.5k lines long with dozens of functions. I recently shifted [all my functions to a module](https://github.com/codaamok/codaamok) and [now my actual profile](https://github.com/codaamok/PoSH/blob/master/profile.ps1) contains very little. It's mostly just a custom prompt and a couple of functions dedicated to update/import my "profile module" which I keep in the [PowerShell Gallery](https://powershellgallery.com).

### Freedom

I could list an abundance of tools which will boost your productivity but what's the point if we're allowing distractions?

[Freeodom.to](https://freedom.to) is an app for all platforms which enables you to create scheduled or ad-hoc sessions for blocking apps and sites across all your devices.

Freedom is not free. This post, nor SysManSquad, are not sponsored by Freedom.

We live in a world that's greatly connected. This gives us an unmeasurable amount of benefits. It also introduces some unintended consequences.

Nearly everything we consume on the Internet is designed to grab our attention and keep us going back for more. We are obsessed with information in a new way.

Apps and websites want your attention: push notifications, instant messaging, news articles, repeatedly looking at Outlook for new mail, seeing what's new on Reddit or on certain hashtags you follow on Twitter or any other social media platform.

These platforms draw us back in by banking on our fear of missing out. Their revenue revolves around active users so you can bet everything is designed with the intent of wanting to want to come back.

As a result of this competing demand of our attention, we (as modern humans) have developed some great abilities to digest information quickly but only at a superficial level.

We now find it harder to deeply focus on one task and complete it from start to finish.

The purpose of Freedom is not to go cold turkey on the Internet or completely disconnect yourself. In my opinion, that puts you at a disadvantage. The idea is to be in control of when you decide to consume certain parts of the Internet.

Commit yourself to a task and let nothing stop you. Make yourself available for what's important to you or for whatever you want to achieve.

However, at the same time, don't alienate yourself from those you work with or friends/family. In other words, make time to block out distractions but equally create time to make yourself available or to actively engage with others.

Perhaps for a couple of hours in the morning and/or afternoon, set your status to Do Not Disturb, use Freedom to block out distractions, and focus.

If you're interested in more learning about the impact of what the Internet and social media is having on us, I strongly recommend you follow [Josh Duffney](https://twitter.com/joshduffney?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor), [check out his blog](https://duffney.io/), and [look at this thread](https://twitter.com/codaamok/status/1298133570905673728) which lists more resources for further reading.

### Twitter + Inoreader

This nicely follows on from my previous point of recommending Freedom.

[Inoreader](https://www.inoreader.com) is just an RSS feed reader. Yes, that's right, you're still here in 2020 and I just said I use an RSS feed reader.

Inoreader is not free. This post, nor SysManSquad, are not sponsored by Inoreader.

Not only can I subscribe to RSS feeds from blogs or news outlets, I can also subscribe to Twitter lists, users or hashtags with it.

This allows me to periodically block social media and have a single pane of glass collecting everything I'm interested in, so I can review it later.

This goes back to what I was saying about choosing when/how I engage with the Internet. I block access to Twitter's app and domain using Freedom, as well as Inoreader, and consume what I missed via Inoreader when I allow it. This gives me control of my life and mind, while curbing that fear of missing out.

As well as just being an RSS feed reader with some extra fancy bits for Twitter, the rule engine is fantastic. I can subscribe to a really broad feed from a news outlet, and create rules of my own to filter out the noise by *filtering in* keywords.
