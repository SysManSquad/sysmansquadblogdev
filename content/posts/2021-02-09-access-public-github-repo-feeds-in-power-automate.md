---
title: Access Public GitHub Repo Feeds in Power Automate
author: Kevin Crouch
type: post
date: 2021-02-09T13:26:41+00:00
url: /2021/02/09/access-public-github-repo-feeds-in-power-automate/
featured_image: /wp-content/uploads/2021/02/Github-RSS-Flow-4-100x32.png
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
        <a href="#introduction">Introduction</a><li class="uagb-toc__list">
          <a href="#github-supports-atom-feeds">GitHub supports Atom Feeds</a><ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              <a href="#sample-urls">Sample URLs</a>
            </li>
          </ul>
        </li>
        
        <li class="uagb-toc__list">
          <a href="#discovering-testing-rssatom-feeds">Discovering & Testing RSS/Atom feeds</a><li class="uagb-toc__list">
            <a href="#connecting-the-connectors">Connecting the Connectors</a><li class="uagb-toc__list">
              <a href="#install-instructions">Install Instructions</a><li class="uagb-toc__list">
                <a href="#conclusion">Conclusion</a>
              </li></ul></ol> </div> </div> </div> 
              <h2>
                Introduction
              </h2>
              
              <p>
                In my <a href="https://sysmansquad.com/2020/12/30/automating-changing-out-of-business-hours-responses/" target="_blank" rel="noreferrer noopener">previous post</a>, we did some automation with client-side scripts and Microsoft Graph to update Outlook Auto-Responses on a schedule. Today we will be going in a different direction for something with almost no code in it at all - Power Automate.
              </p>
              
              <p>
                <a href="https://flow.microsoft.com" target="_blank" rel="noreferrer noopener">Power Automate</a> is an excellent tool that can monitor for changes, run actions on a schedule, process events, or just run a multi-step process when you hit a button. It does all of this with you having to write no, or minimal, code by using <strong>Service Connectors</strong> and abstracting out <strong>Events</strong> and <strong>Actions</strong> that you might need to take. This post assumes that you are somewhat familiar with Power Automate, for an introduction to Power Automate, check out this <a href="https://docs.microsoft.com/en-us/power-automate/getting-started" target="_blank" rel="noreferrer noopener">Microsoft Docs Article</a>, or this <a href="https://go.microsoft.com/fwlink/p/?linkid=2018566" target="_blank" rel="noreferrer noopener">Microsoft Learn Course</a> on Automate.
              </p>
              
              <p>
                There are hundreds of <a href="https://flow.microsoft.com/connectors/" target="_blank" rel="noreferrer noopener">supported app and service connectors</a> including <a href="https://flow.microsoft.com/connectors/shared_twitter/twitter/" target="_blank" rel="noreferrer noopener">Twitter</a>, <a href="https://flow.microsoft.com/connectors/shared_office365/office-365-outlook/" target="_blank" rel="noreferrer noopener">Office 365 Outlook</a>, and the connector that seems like it would help us most for this goal: <a href="https://flow.microsoft.com/connectors/shared_github/github/" target="_blank" rel="noreferrer noopener">GitHub</a>.
              </p>
              
              <div class="wp-block-image">
                <figure class="aligncenter is-resized"><img loading="lazy" src="https://i.imgur.com/8AsDn9T.png" alt="" width="465" height="181" /><figcaption>Available triggers for GitHub are based on Issues or Pull Requests</figcaption></figure>
              </div>
              
              <p>
                However, when you look at the GitHub connector, it only supports a few <strong>triggers</strong> related to <strong>Issues </strong>and <strong>Pull Requests</strong>, and if we check the GitHub Connector <a href="https://docs.microsoft.com/en-us/connectors/github/#triggers" target="_blank" rel="noreferrer noopener">triggers documentation</a>, then even those would require an API key. Since these are public repos, instead of repos we own, we won't have any way to get a API key anyway.
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
                        After some searching around, I found that GitHub support <a href="http://www.atomenabled.org/" target="_blank" rel="noreferrer noopener">Atom Feeds</a> by appending <code>.atom</code> to certain URLs.
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
                        <strong>Releases · PowerShell<br /></strong>HTML - <a href="https://github.com/PowerShell/PowerShell/releases" target="_blank" rel="noreferrer noopener">https://github.com/PowerShell/PowerShell/releases</a><br />ATOM - <a href="https://github.com/PowerShell/PowerShell/releases.atom" target="_blank" rel="noreferrer noopener nofollow">https://github.com/PowerShell/PowerShell/releases.atom</a>
                      </p>
                      
                      <p>
                        <strong>Tags · PowerShell</strong><br />HTML - <a href="https://github.com/PowerShell/PowerShell/tags" target="_blank" rel="noreferrer noopener">https://github.com/PowerShell/PowerShell/tags</a><br />ATOM - <a href="https://github.com/PowerShell/PowerShell/tags.atom" target="_blank" rel="noreferrer noopener nofollow">https://github.com/PowerShell/PowerShell/tags.atom</a>
                      </p>
                      
                      <p>
                        <strong>Releases · Pester</strong><br />HTML - <a href="https://github.com/pester/Pester/releases" target="_blank" rel="noreferrer noopener">https://github.com/pester/Pester/releases</a><br />ATOM - <a href="https://github.com/pester/Pester/releases.atom" target="_blank" rel="noreferrer noopener">https://github</a><a href="https://github.com/pester/Pester/releases.atom" target="_blank" rel="noreferrer noopener nofollow">.com/pester/Pester/releases.atom</a>
                      </p>
                      
                      <p>
                        <strong>Commits · win-acme · Master Branch<br /></strong>HTML - <a href="https://github.com/pester/Pester/releases" target="_blank" rel="noreferrer noopener">https://</a><a href="https://github.com/win-acme/win-acme/commits/master" target="_blank" rel="noreferrer noopener">github.com/win-acme/win-acme/commits/master</a><br />ATOM - <a href="https://github.com/win-acme/win-acme/commits/master.atom" target="_blank" rel="noreferrer noopener nofollow"></a><a href="https://github.com/win-acme/win-acme/commits/master.atom" target="_blank" rel="noreferrer noopener">https://github.com/win-acme/win-acme/commits/master.atom</a>
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
                        If you are still having a hard time finding the URL, I found this <a href="https://microsoftedge.microsoft.com/addons/detail/get-rss-feed-url/pgbelohmepchkohpdldadopkblkgbjom">Edge Extension</a> to discover Atom URLs for the current page, and a <a href="https://chrome.google.com/webstore/detail/get-rss-feed-url/kfghpdldaipanmkhfpdcjglncmilendn">Chrome Version</a> as well.
                      </p>
                    </div>
                  </div><figure class="wp-block-image alignwide size-large">
                  
                  <img loading="lazy" width="1024" height="413" src="https://sysmansquad.com/wp-content/uploads/2021/02/image-1024x413.png" alt="" class="wp-image-2257" srcset="https:/wp-content/uploads/2021/02/image-1024x413.png 1024w, https:/wp-content/uploads/2021/02/image-300x121.png 300w, https:/wp-content/uploads/2021/02/image-768x310.png 768w, https:/wp-content/uploads/2021/02/image-100x40.png 100w, https:/wp-content/uploads/2021/02/image-855x345.png 855w, https:/wp-content/uploads/2021/02/image-1234x497.png 1234w, https:/wp-content/uploads/2021/02/image.png 1367w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure> 
                  
                  <p>
                    To test what the content of the feeds was, I used <a href="https://rssatom.com/" target="_blank" rel="noreferrer noopener">rssatom.com</a> to check I had a valid Atom or RSS feed URL that worked publicly.
                  </p>
                  
                  <p>
                    Now, armed with these feed URLs, we have... no connector for Atom Feeds directly... damn... we were so close...
                  </p><figure class="wp-block-image">
                  
                  <img src="https://media1.tenor.com/images/0d40c691a9a6ac353f1afcfdab3a3758/tenor.gif?itemid=12784504" alt="" /></figure> 
                  
                  <p>
                    But! Atom Feeds are mostly compatible with RSS Feeds. Compatible enough that we can actually use the <a href="https://flow.microsoft.com/connectors/shared_rss/rss/" target="_blank" rel="noreferrer noopener">RSS Feed connector</a> to receive the feeds and throw our events! We just won't be able to access all of the fields.
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
                    Here is a full listing and link to the <a href="https://docs.microsoft.com/connectors/rss/" target="_blank" rel="noreferrer noopener">RSS Feed Connector documentation</a>
                  </p><figure class="wp-block-image size-large">
                  
                  <img loading="lazy" width="303" height="429" src="https://sysmansquad.com/wp-content/uploads/2021/02/image-5.png" alt="" class="wp-image-2266" srcset="https:/wp-content/uploads/2021/02/image-5.png 303w, https:/wp-content/uploads/2021/02/image-5-212x300.png 212w, https:/wp-content/uploads/2021/02/image-5-100x142.png 100w" sizes="(max-width: 303px) 100vw, 303px" /></figure> 
                  
                  <p>
                    So from here, we can use the <strong>RSS Feed trigger</strong>, build some variables, and send it to the <strong>Teams Connector</strong>. From this, I refined the formatting a bit, and ended up with this.
                  </p><figure class="wp-block-image size-large">
                  
                  <img loading="lazy" width="960" height="778" src="https://sysmansquad.com/wp-content/uploads/2021/02/image-2.png" alt="" class="wp-image-2261" srcset="https:/wp-content/uploads/2021/02/image-2.png 960w, https:/wp-content/uploads/2021/02/image-2-300x243.png 300w, https:/wp-content/uploads/2021/02/image-2-768x622.png 768w, https:/wp-content/uploads/2021/02/image-2-100x81.png 100w, https:/wp-content/uploads/2021/02/image-2-855x693.png 855w" sizes="(max-width: 960px) 100vw, 960px" /></figure> 
                  
                  <p>
                    This sends through notifications to Teams that look like this:
                  </p><figure class="wp-block-image">
                  
                  <img src="https://i.imgur.com/VQ5lvlQ.png" alt="" /></figure>
                </div>
              </div>
              
              <h2 id="install">
                Install Instructions
              </h2>
              
              <p>
                You can <a href="https://github.com/SysManSquad/BlogFiles/tree/master/PsychoData/GitHub_to_Teams_Notifications" target="_blank" rel="noreferrer noopener">download this here</a> to import this into your own environment and start getting your own notifications from Public Repos.
              </p>
              
              <p>
                You can also use this as a guide to set up alerts on any other RSS feeds or most Atom feeds as well. Since this is already in Power Automate, you could also use hundreds of different connectors to connect to other services like Azure <a href="https://flow.microsoft.com/connectors/shared_azureautomation/azure-automation/" target="_blank" rel="noreferrer noopener">Automation</a>, <a href="https://flow.microsoft.com/connectors/shared_visualstudioteamservices/azure-devops/" target="_blank" rel="noreferrer noopener">DevOps</a>, <a href="https://flow.microsoft.com/connectors/shared_azureblob/azure-blob-storage/" target="_blank" rel="noreferrer noopener">Blob Storage</a>, <a href="https://flow.microsoft.com/connectors/shared_ftp/ftp/" target="_blank" rel="noreferrer noopener">FTP</a>, <a href="https://flow.microsoft.com/connectors/shared_slack/slack/" target="_blank" rel="noreferrer noopener">Slack</a>, <a href="https://flow.microsoft.com/connectors/shared_todoist/todoist/" target="_blank" rel="noreferrer noopener">Todoist</a>, or even invoke a <a href="https://docs.microsoft.com/connectors/webcontents/#get-web-resource" target="_blank" rel="noreferrer noopener">Web API</a>.
              </p>
              
              <h2 id="build-your-own">
                Conclusion
              </h2>
              
              <p>
                In this post, we found a way to work around some limitations of the GitHub Connector, made a Power Automate flow that can be easily duplicated to subscribe to many feeds, and used Power Automate to post notifications to Teams Channels.
              </p><figure class="wp-block-image">
              
              <img src="https://uploads-ssl.webflow.com/5d2b950d9ea87fc61f0c1f3e/5daa2dfbe9a275421795e33d_ezgif.com-optimize%20(12).gif" alt="Image result for so much win jim halpert" /></figure> <p>
                <strong>What kind of workflows would you like to automate</strong>? Let me know what kind of things you are doing with <strong>Power Platform</strong> on the <a href="#contact">Discord below</a>. For some ideas of automations you might be able to use, go <a href="https://us.flow.microsoft.com/en-us/templates/">Browse Power Automate Templates</a>, <a href="https://flow.microsoft.com/connectors/" target="_blank" rel="noreferrer noopener">Search Connectors</a>, or check out the Power Automate <a href="https://go.microsoft.com/fwlink/?LinkID=787467" target="_blank" rel="noreferrer noopener">Community</a>.
              </p>
              
              <p id="contact">
                If you have questions, are having problems, or just want to chat over something, for the best response you can reach me and several other IT Pros on the <a href="https://discord.com/invite/winadmins" target="_blank" rel="noreferrer noopener">WinAdmins Discord</a> as <a href="https://discordapp.com/users/264652399824601088">@PsychoData</a> or you can reach me on <a href="https://twitter.com/psychodata" target="_blank" rel="noreferrer noopener">Twitter</a>.
              </p>
              
              <p>
              </p>