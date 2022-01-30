---
title: Access Public GitHub Repo Feeds in Power Automate
author: kevin-crouch
type: post
date: 2021-02-09T13:26:41+00:00
url: /2021/02/09/access-public-github-repo-feeds-in-power-automate/
featured_image: Github-RSS-Flow-4.png
categories:
  - Documentation
  - General
  - How-To
  - Microsoft
tags:
  - Azure
  - GitHub
  - Notifications
  - Power Automate
  - PowerShell

---
Have you ever wanted to get a simple notification when there is a new Release for your favorite PowerShell Module or other Public Repo on GitHub? In this post we'll talk about how you can use Power Automate to watch for new releases and trigger events on these and send out Teams messages, Emails, or even Kick off an Azure Function or similar automation. 

## Introduction
              
In my [previous post](https://sysmansquad.com/2020/12/30/automating-changing-out-of-business-hours-responses/), we did some automation with client-side scripts and Microsoft Graph to update Outlook Auto-Responses on a schedule. Today we will be going in a different direction for something with almost no code in it at all - Power Automate.

[Power Automate](https://flow.microsoft.com) is an excellent tool that can monitor for changes, run actions on a schedule, process events, or just run a multi-step process when you hit a button. It does all of this with you having to write no, or minimal, code by using **Service Connectors** and abstracting out **Events** and **Actions** that you might need to take. This post assumes that you are somewhat familiar with Power Automate, for an introduction to Power Automate, check out this [Microsoft Docs Article](https://docs.microsoft.com/power-automate/getting-started), or this [Microsoft Learn Course](https://go.microsoft.com/fwlink/p/?linkid=2018566) on Automate.

There are hundreds of [supported app and service connectors](https://flow.microsoft.com/connectors/) including [Twitter](https://flow.microsoft.com/connectors/shared_twitter/twitter/), [Office 365 Outlook](https://flow.microsoft.com/connectors/shared_office365/office-365-outlook/), and the connector that seems like it would help us most for this goal: [GitHub](https://flow.microsoft.com/connectors/shared_github/github/).

![screenshot](https://i.imgur.com/8AsDn9T.png) Available triggers for GitHub are based on Issues or Pull Requests

However, when you look at the GitHub connector, it only supports a few **triggers** related to **Issues** and **Pull Requests**, and if we check the GitHub Connector [triggers documentation](https://docs.microsoft.com/connectors/github/#triggers), then even those would require an API key. Since these are public repos, instead of repos we own, we won't have any way to get a API key anyway.

We definitely need some other direction.

## GitHub supports Atom Feeds

After some searching around, I found that GitHub support [Atom Feeds](http://www.atomenabled.org/) by appending `.atom` to certain URLs.

From what I could find, these are supported on **Releases**, **Tags**, and **Commits**. To get the feed, simply take the URL for the feeds and append `strong>.atom/strong>` to the end.

### Sample URLs

**Releases · PowerShell** HTML - [https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases)
ATOM - [https://github.com/PowerShell/PowerShell/releases.atom](https://github.com/PowerShell/PowerShell/releases.atom)

**Tags · PowerShell** HTML - [https://github.com/PowerShell/PowerShell/tags](https://github.com/PowerShell/PowerShell/tags)
ATOM - [https://github.com/PowerShell/PowerShell/tags.atom](https://github.com/PowerShell/PowerShell/tags.atom)

**Releases · Pester** HTML - [https://github.com/pester/Pester/releases](https://github.com/pester/Pester/releases)
ATOM - [https://github](https://github.com/pester/Pester/releases.atom)[.com/pester/Pester/releases.atom](https://github.com/pester/Pester/releases.atom)

**Commits · win-acme · Master Branch** HTML - [https://](https://github.com/pester/Pester/releases)[github.com/win-acme/win-acme/commits/master](https://github.com/win-acme/win-acme/commits/master) ATOM - [](https://github.com/win-acme/win-acme/commits/master.atom)[https://github.com/win-acme/win-acme/commits/master.atom](https://github.com/win-acme/win-acme/commits/master.atom)

## Discovering & Testing RSS/Atom feeds

If you are still having a hard time finding the URL, I found this [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/get-rss-feed-url/pgbelohmepchkohpdldadopkblkgbjom) to discover Atom URLs for the current page, and a [Chrome Version](https://chrome.google.com/webstore/detail/get-rss-feed-url/kfghpdldaipanmkhfpdcjglncmilendn) as well.

![screenshot](image-1024x413.png) 

To test what the content of the feeds was, I used [rssatom.com](https://rssatom.com/) to check I had a valid Atom or RSS feed URL that worked publicly.

Now, armed with these feed URLs, we have... no connector for Atom Feeds directly... damn... we were so close...

![screenshot](https://media1.tenor.com/images/0d40c691a9a6ac353f1afcfdab3a3758/tenor.gif?itemid=12784504) 

But! Atom Feeds are mostly compatible with RSS Feeds. Compatible enough that we can actually use the [RSS Feed connector](https://flow.microsoft.com/connectors/shared_rss/rss/) to receive the feeds and throw our events! We just won't be able to access all of the fields.

## Connecting the Connectors

The useful fields available to us are below:

* Feed Entry Title
* Feed Entry Primary Link
* Feed Entry Links
  * A list of the links in the entry
* Feed Entry Summary
  * Roughly the "text" of the Feed Entry
* Feed Entry Update and Published Dates

Here is a full listing and link to the [RSS Feed Connector documentation](https://docs.microsoft.com/connectors/rss/)

![screenshot](image-5.png) 

So from here, we can use the **RSS Feed trigger**, build some variables, and send it to the **Teams Connector**. From this, I refined the formatting a bit, and ended up with this.

![screenshot](image-2.png) 

This sends through notifications to Teams that look like this:

![screenshot](https://i.imgur.com/VQ5lvlQ.png)

## Install Instructions

You can [download this here](https://github.com/SysManSquad/BlogFiles/tree/master/PsychoData/GitHub_to_Teams_Notifications) to import this into your own environment and start getting your own notifications from Public Repos.

You can also use this as a guide to set up alerts on any other RSS feeds or most Atom feeds as well. Since this is already in Power Automate, you could also use hundreds of different connectors to connect to other services like Azure [Automation](https://flow.microsoft.com/connectors/shared_azureautomation/azure-automation/), [DevOps](https://flow.microsoft.com/connectors/shared_visualstudioteamservices/azure-devops/), [Blob Storage](https://flow.microsoft.com/connectors/shared_azureblob/azure-blob-storage/), [FTP](https://flow.microsoft.com/connectors/shared_ftp/ftp/), [Slack](https://flow.microsoft.com/connectors/shared_slack/slack/), [Todoist](https://flow.microsoft.com/connectors/shared_todoist/todoist/), or even invoke a [Web API](https://docs.microsoft.com/connectors/webcontents/#get-web-resource).

## Conclusion

In this post, we found a way to work around some limitations of the GitHub Connector, made a Power Automate flow that can be easily duplicated to subscribe to many feeds, and used Power Automate to post notifications to Teams Channels.

![Image result for so much win jim halpert](https://uploads-ssl.webflow.com/5d2b950d9ea87fc61f0c1f3e/5daa2dfbe9a275421795e33d_ezgif.com-optimize%20(12).gif) **What kind of workflows would you like to automate**? Let me know what kind of things you are doing with **Power Platform** on the [Discord below](#contact). For some ideas of automations you might be able to use, go [Browse Power Automate Templates](https://us.flow.microsoft.com/templates/), [Search Connectors](https://flow.microsoft.com/connectors/), or check out the Power Automate [Community](https://go.microsoft.com/fwlink/?LinkID=787467).

If you have questions, are having problems, or just want to chat over something, for the best response you can reach me and several other IT Pros on the [WinAdmins Discord](https://discord.com/invite/winadmins) as [@PsychoData](https://discordapp.com/users/264652399824601088) or you can reach me on [Twitter](https://twitter.com/psychodata).
