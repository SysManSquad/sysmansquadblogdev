---
title: Access Public GitHub Repo Feeds in Power Automate
author: Kevin Crouch
type: post
date: 2021-02-09T13:26:41+00:00
url: 2021-02-09-access-public-github-repo-feeds-in-power-automate/
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

<!--more--><div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-2fc89ee7 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Introduction](#introduction)<li class="uagb-toc__list">
          [GitHub supports Atom Feeds](#github-supports-atom-feeds)<ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              [Sample URLs](#sample-urls)
            </li>
          </ul>
        </li>
        
        <li class="uagb-toc__list">
          [Discovering & Testing RSS/Atom feeds](#discovering-testing-rssatom-feeds)<li class="uagb-toc__list">
            [Connecting the Connectors](#connecting-the-connectors)<li class="uagb-toc__list">
              [Install Instructions](#install-instructions)<li class="uagb-toc__list">
                [Conclusion](#conclusion)
              </li></ul></ol> </div> </div> </div> 
              <h2>
                Introduction
              </h2>
              
              <p>
                In my [previous post](https://sysmansquad.com/2020/12/30/automating-changing-out-of-business-hours-responses/), we did some automation with client-side scripts and Microsoft Graph to update Outlook Auto-Responses on a schedule. Today we will be going in a different direction for something with almost no code in it at all - Power Automate.
              </p>
              
              <p>
                [Power Automate](https://flow.microsoft.com) is an excellent tool that can monitor for changes, run actions on a schedule, process events, or just run a multi-step process when you hit a button. It does all of this with you having to write no, or minimal, code by using <strong>Service Connectors</strong> and abstracting out <strong>Events</strong> and <strong>Actions</strong> that you might need to take. This post assumes that you are somewhat familiar with Power Automate, for an introduction to Power Automate, check out this [Microsoft Docs Article](https://docs.microsoft.com/en-us/power-automate/getting-started), or this [Microsoft Learn Course](https://go.microsoft.com/fwlink/p/?linkid=2018566) on Automate.
              </p>
              
              <p>
                There are hundreds of [supported app and service connectors](https://flow.microsoft.com/connectors/) including [Twitter](https://flow.microsoft.com/connectors/shared_twitter/twitter/), [Office 365 Outlook](https://flow.microsoft.com/connectors/shared_office365/office-365-outlook/), and the connector that seems like it would help us most for this goal: [GitHub](https://flow.microsoft.com/connectors/shared_github/github/).
              </p>
              
              <div class="wp-block-image">
                <figure class="aligncenter is-resized">![](https://i.imgur.com/8AsDn9T.png)<figcaption>Available triggers for GitHub are based on Issues or Pull Requests</figcaption></figure>
              </div>
              
              <p>
                However, when you look at the GitHub connector, it only supports a few <strong>triggers</strong> related to <strong>Issues </strong>and <strong>Pull Requests</strong>, and if we check the GitHub Connector [triggers documentation](https://docs.microsoft.com/en-us/connectors/github/#triggers), then even those would require an API key. Since these are public repos, instead of repos we own, we won't have any way to get a API key anyway.
              </p>
              
              <p>
                We definitely need some other direction.
              </p>
              
              <div class="wp-block-group">
                <div class="wp-block-group__inner-container">
                  <h2 id="github-atom-feeds">
                    GitHub supports Atom Feeds
                  </h2>
                  
                  <div class="wp-block-group">
                    <div class="wp-block-group__inner-container">
                      <p>
                        After some searching around, I found that GitHub support [Atom Feeds](http://www.atomenabled.org/) by appending <code>.atom</code> to certain URLs.
                      </p>
                      
                      <p>
                        From what I could find, these are supported on <strong>Releases</strong>, <strong>Tags</strong>, and <strong>Commits</strong>. To get the feed, simply take the URL for the feeds and append <code>&lt;strong>.atom&lt;/strong></code> to the end.
                      </p>
                    </div>
                  </div>
                  
                  <div class="wp-block-group">
                    <div class="wp-block-group__inner-container">
                      <h4 id="sample-urls">
                        Sample URLs
                      </h4>
                      
                      <p>
                        <strong>Releases · PowerShell<br /></strong>HTML - [https://github.com/PowerShell/PowerShell/releases](https://github.com/PowerShell/PowerShell/releases)<br />ATOM - [https://github.com/PowerShell/PowerShell/releases.atom](https://github.com/PowerShell/PowerShell/releases.atom)
                      </p>
                      
                      <p>
                        <strong>Tags · PowerShell</strong><br />HTML - [https://github.com/PowerShell/PowerShell/tags](https://github.com/PowerShell/PowerShell/tags)<br />ATOM - [https://github.com/PowerShell/PowerShell/tags.atom](https://github.com/PowerShell/PowerShell/tags.atom)
                      </p>
                      
                      <p>
                        <strong>Releases · Pester</strong><br />HTML - [https://github.com/pester/Pester/releases](https://github.com/pester/Pester/releases)<br />ATOM - [https://github](https://github.com/pester/Pester/releases.atom)[.com/pester/Pester/releases.atom](https://github.com/pester/Pester/releases.atom)
                      </p>
                      
                      <p>
                        <strong>Commits · win-acme · Master Branch<br /></strong>HTML - [https://](https://github.com/pester/Pester/releases)[github.com/win-acme/win-acme/commits/master](https://github.com/win-acme/win-acme/commits/master)<br />ATOM - [](https://github.com/win-acme/win-acme/commits/master.atom)[https://github.com/win-acme/win-acme/commits/master.atom](https://github.com/win-acme/win-acme/commits/master.atom)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="wp-block-group alignwide">
                <div class="wp-block-group__inner-container">
                  <div class="wp-block-group alignwide">
                    <div class="wp-block-group__inner-container">
                      <h2 class="alignwide has-text-align-center">
                        Discovering & Testing RSS/Atom feeds
                      </h2>
                      
                      <p>
                        If you are still having a hard time finding the URL, I found this [Edge Extension](https://microsoftedge.microsoft.com/addons/detail/get-rss-feed-url/pgbelohmepchkohpdldadopkblkgbjom) to discover Atom URLs for the current page, and a [Chrome Version](https://chrome.google.com/webstore/detail/get-rss-feed-url/kfghpdldaipanmkhfpdcjglncmilendn) as well.
                      </p>
                    </div>
                  </div><figure class="wp-block-image alignwide size-large">
                  
                  ![](image-1024x413.png)</figure> 
                  
                  <p>
                    To test what the content of the feeds was, I used [rssatom.com](https://rssatom.com/) to check I had a valid Atom or RSS feed URL that worked publicly.
                  </p>
                  
                  <p>
                    Now, armed with these feed URLs, we have... no connector for Atom Feeds directly... damn... we were so close...
                  </p><figure class="wp-block-image">
                  
                  ![](https://media1.tenor.com/images/0d40c691a9a6ac353f1afcfdab3a3758/tenor.gif?itemid=12784504)</figure> 
                  
                  <p>
                    But! Atom Feeds are mostly compatible with RSS Feeds. Compatible enough that we can actually use the [RSS Feed connector](https://flow.microsoft.com/connectors/shared_rss/rss/) to receive the feeds and throw our events! We just won't be able to access all of the fields.
                  </p>
                </div>
              </div>
              
              <div class="wp-block-group">
                <div class="wp-block-group__inner-container">
                  <h2 id="connecting-the-connectors">
                    Connecting the Connectors
                  </h2>
                  
                  <p>
                    The useful fields available to us are below:
                  </p>
                  
                  <ul>
                    <li>
                      Feed Entry Title
                    </li>
                    <li>
                      Feed Entry Primary Link
                    </li>
                    <li>
                      Feed Entry Links <ul>
                        <li>
                          A list of the links in the entry
                        </li>
                      </ul>
                    </li>
                    
                    <li>
                      Feed Entry Summary<ul>
                        <li>
                          Roughly the "text" of the Feed Entry
                        </li>
                      </ul>
                    </li>
                    
                    <li>
                      Feed Entry Update and Published Dates
                    </li>
                  </ul>
                  
                  <p>
                    Here is a full listing and link to the [RSS Feed Connector documentation](https://docs.microsoft.com/connectors/rss/)
                  </p><figure class="wp-block-image size-large">
                  
                  ![](image-5.png)</figure> 
                  
                  <p>
                    So from here, we can use the <strong>RSS Feed trigger</strong>, build some variables, and send it to the <strong>Teams Connector</strong>. From this, I refined the formatting a bit, and ended up with this.
                  </p><figure class="wp-block-image size-large">
                  
                  ![](image-2.png)</figure> 
                  
                  <p>
                    This sends through notifications to Teams that look like this:
                  </p><figure class="wp-block-image">
                  
                  ![](https://i.imgur.com/VQ5lvlQ.png)</figure>
                </div>
              </div>
              
              <h2 id="install">
                Install Instructions
              </h2>
              
              <p>
                You can [download this here](https://github.com/SysManSquad/BlogFiles/tree/master/PsychoData/GitHub_to_Teams_Notifications) to import this into your own environment and start getting your own notifications from Public Repos.
              </p>
              
              <p>
                You can also use this as a guide to set up alerts on any other RSS feeds or most Atom feeds as well. Since this is already in Power Automate, you could also use hundreds of different connectors to connect to other services like Azure [Automation](https://flow.microsoft.com/connectors/shared_azureautomation/azure-automation/), [DevOps](https://flow.microsoft.com/connectors/shared_visualstudioteamservices/azure-devops/), [Blob Storage](https://flow.microsoft.com/connectors/shared_azureblob/azure-blob-storage/), [FTP](https://flow.microsoft.com/connectors/shared_ftp/ftp/), [Slack](https://flow.microsoft.com/connectors/shared_slack/slack/), [Todoist](https://flow.microsoft.com/connectors/shared_todoist/todoist/), or even invoke a [Web API](https://docs.microsoft.com/connectors/webcontents/#get-web-resource).
              </p>
              
              <h2 id="build-your-own">
                Conclusion
              </h2>
              
              <p>
                In this post, we found a way to work around some limitations of the GitHub Connector, made a Power Automate flow that can be easily duplicated to subscribe to many feeds, and used Power Automate to post notifications to Teams Channels.
              </p><figure class="wp-block-image">
              
              ![Image result for so much win jim halpert](https://uploads-ssl.webflow.com/5d2b950d9ea87fc61f0c1f3e/5daa2dfbe9a275421795e33d_ezgif.com-optimize%20(12).gif)</figure> <p>
                <strong>What kind of workflows would you like to automate</strong>? Let me know what kind of things you are doing with <strong>Power Platform</strong> on the [Discord below](#contact). For some ideas of automations you might be able to use, go [Browse Power Automate Templates](https://us.flow.microsoft.com/en-us/templates/), [Search Connectors](https://flow.microsoft.com/connectors/), or check out the Power Automate [Community](https://go.microsoft.com/fwlink/?LinkID=787467).
              </p>
              
              <p id="contact">
                If you have questions, are having problems, or just want to chat over something, for the best response you can reach me and several other IT Pros on the [WinAdmins Discord](https://discord.com/invite/winadmins) as [@PsychoData](https://discordapp.com/users/264652399824601088) or you can reach me on [Twitter](https://twitter.com/psychodata).
              </p>
              
              <p>
              </p>
