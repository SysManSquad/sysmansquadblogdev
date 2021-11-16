---
title: Reversing OneDrive Client Sync Config for fun and Un-Syncing Libraries
author: Kevin Crouch
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=2946
categories:
  - Endpoint Management

---
Okay, so you've gotten all of your OneDrive libraries you want syncing down to the PC, but you just finished the migration, closed a Team, or need to remove that Synced folder you had to recreate again. Well, no one told the OneDrive Client to un-sync the deleted site/document-library so it just throws an angry warning. Let's fix that. 

<!--more-->

## Identifying Use Case {#identifying}

In my personal case, I was hoping to find a way to Un-Sync a library from CLI or URL handler, or something to script against with a Proactive Remediation. Specifically, we had just finished a migration, and a site we meant to be **temporary** was now deleted. We had access to information like Site, Document Library, and Folder IDs for the folders we were trying to clear - the same kind of IDs you would use to make an **odopen://** link to [sync a library](https://docs.microsoft.com/en-us/onedrive/deploy-on-windows#auto-configure-sharepoint-site-synchronization). 

## Microsoft Documentation

OneDrive.exe has almost no documentation that I could find for any command line features, and when I asked Microsoft, they told me that the feature I asked for documentation about didn't exist. 

<div class="wp-block-image">
  <figure class="aligncenter size-large">![](image.png)</figure>
</div>

Well, that's..... not remotely useful.... and sort of inaccurate. 

See, OneDrive does not have any central list of OneDrive.exe params or commands that I could find, but you can see some examples around - like [here](https://docs.microsoft.com/en-us/onedrive/plan-onedrive-enterprise#install-onedrive-on-windows-devices-by-using-scripting-methods), where they mention some random CLI Parameters for Silent Account Config, or those **odopen://** links from the [identifying section](#identifying) that basically pass through to **OneDrive.exe /URL:odopen://** .

## Compiled Documentation

After some searching around Microsoft Docs, random blog posts around the internet, strings searching, and some attempts at decompiling the executable, this was the whole list of command lines that I was able to find. Alternatively, feel free to jump right on to [building a solution](#building-a-solution) if you don't want to look over the parameters. 

Note: Some of these seem like they may have been related to OneDrive**SETUP**.exe - but in several cases, I also saw mentions of them where it seemed to be talking about the already installed app, or where I saw it showing up when I was searching for parameters. These may not actually be valid commands - I couldn't find any documentation from Microsoft. <figure class="wp-block-table alignwide">

<table>
  <tr>
    <th>
      <strong>Parameter Name</strong>
    </th>
    
    <th>
      Approximate / Estimated Use case
    </th>
    
    <th>
      Microsoft Docs
    </th>
    
    <th>
      Blogs / <br />"<strong>External Documentation</strong>" / <br />Reference / Source
    </th>
  </tr>
  
  <tr>
    <td>
      /allUsers
    </td>
    
    <td>
      Used around installing/launching OneDrive Per-machine
    </td>
    
    <td>
    </td>
    
    <td>
      [OneDrive Sync Client in "Per-Machine" mode (byteben.com)](https://byteben.com/bb/installing-the-onedrive-sync-client-in-per-machine-mode-during-your-task-sequence-for-a-lightening-fast-first-logon-experience/)
    </td>
  </tr>
  
  <tr>
    <td>
      /firstSetup
    </td>
    
    <td>
      Unclear the precise function and how it may be different from /thFirstSetup
    </td>
    
    <td>
    </td>
    
    <td>
      Startup item in some installations
    </td>
  </tr>
  
  <tr>
    <td>
      /thfirstsetup
    </td>
    
    <td>
      Unclear the precise function and how it may be different from /firstSetup
    </td>
    
    <td>
      [Can't open OneDrive on images using Sysprep - SharePoint | Microsoft Docs](https://docs.microsoft.com/en-us/sharepoint/troubleshoot/lists-and-libraries/cannot-open-onedrive-on-images-using-sysprep#how-to-correctly-deploy-onedrive-via-sysprep)
    </td>
    
    <td>
      Startup item in some installations
    </td>
  </tr>
  
  <tr>
    <td>
      /client=<br />/cci <br />/cci /client=Personal<br />/client=Business1<br />/client=Business2
    </td>
    
    <td>
      These can be used to start only 1 particular client without starting all clients. Personal is for Microsoft Accounts, while the "BusinessX" seems to relate to their place in local configs/directories.
    </td>
    
    <td>
    </td>
    
    <td>
      [Automated Analysis Service - powered by Falcon Sandbox - file analysis results for 'OneDrive.exe' (hybrid-analysis.com)](https://www.hybrid-analysis.com/sample/40ea86e7b4e4d11e3e1fd45993e250ae1e22179917c8004099c779cd51182c73/5df071d2a67bbe5f8972e84b#:~:text=OneDrive.exe%20/cci%20/-,client%3DPersonal,-%25LOCALAPPDATA%25%5CMicrosoft%5COneDrive)
    </td>
  </tr>
  
  <tr>
    <td>
      /configure_business<br />/configure_business:$tenantID
    </td>
    
    <td>
      /configure_business:$tenantID - seems to be used to prompt to setup a specific Tenant ID - and may work with Silent Account config info, and/or SSO to silently start synchronizing
    </td>
    
    <td>
      Mention on [Deploy OneDrive apps using Microsoft Endpoint Configuration Manager](https://docs.microsoft.com/en-us/onedrive/deploy-on-windows#:~:text=/-,configure_business,-%3A%3CtenantId%3E)
    </td>
    
    <td>
      - [Deploy & Manage OneDrive for Business | OutsideSys](https://itpro.outsidesys.com/2016/07/13/deploy-manage-onedrive-for-business/#:~:text=Launching%20OneDrive.exe%20with%20the%20command%20line%20parameter%20/configure_business)<br /><br />- [14 OneDrive for Business Configurations You Need to Use (sherweb.com)](https://www.sherweb.com/blog/office-365/configure-onedrive-for-business/#:~:text=command-line%20parameter%3A%20/-,configure_business,-%3A%3CtenantId%3E)
    </td>
  </tr>
  
  <tr>
    <td>
      /url<br />/url:odopen://
    </td>
    
    <td>
      These are used as part of the handler for <strong>odopen://</strong> protocol. This is essentially what gets used in the background when you click on "Sync" in SharePoint or Teams. <br /><br />I could not find a proper explanation of the ODOPEN protocol, but it seems to have various minor functions and in general function to open OneDrive when called.
    </td>
    
    <td>
      [Deploy OneDrive apps using Microsoft Endpoint Configuration Manager - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/deploy-on-windows#auto-configure-sharepoint-site-synchronization)<br /><br />[[MS-FILESYNC]: Other Local Events | Microsoft Docs](https://docs.microsoft.com/en-us/openspecs/sharepoint_protocols/ms-filesync/967d897f-7ad2-4351-83be-bc419e6a4e57)
    </td>
    
    <td>
      Registry handler for <strong>odopen://</strong> protocol
    </td>
  </tr>
  
  <tr>
    <td>
      /silentConfig
    </td>
    
    <td>
      This seems to trigger the OneDrive to attempt to detect the user to sign in from other Office apps or possibly the currently signed in user.
    </td>
    
    <td>
      [Silently configure user accounts - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/use-silent-account-configuration)
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /silent
    </td>
    
    <td>
      This seems to generally be used in the installer for silent installation - though I believe I saw it mentioned somewhere as essentially and alternative to <strong>/background</strong>
    </td>
    
    <td>
      [OneDrive guide for enterprises - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/plan-onedrive-enterprise#install-onedrive-on-windows-devices-by-using-scripting-methods)
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /onPrem
    </td>
    
    <td>
      Unclear the precise function, though it is assumed it is related to on-premise SharePoint
    </td>
    
    <td>
    </td>
    
    <td>
      Dissassembly / Strings in EXE
    </td>
  </tr>
  
  <tr>
    <td>
      /update
    </td>
    
    <td>
      This seems to be used by the OneDriveSetup.exe and OneDrive.exe both to trigger or check for an update.
    </td>
    
    <td>
      [The OneDrive sync app update process - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/sync-client-update-process#deploying-updates-in-the-deferred-ring)
    </td>
    
    <td>
      Several sites
    </td>
  </tr>
  
  <tr>
    <td>
      /perMachineUpdate
    </td>
    
    <td>
      This appears to be related to a newer Per-machine install type, but also to an older issue that caused the OneDrive.exe icons to not show correctly.
    </td>
    
    <td>
      [Install the sync app per machine - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/per-machine-installation)
    </td>
    
    <td>
      ["Finish installing update" appears in the system tray after you restart OneDrive.exe (microsoft.com)](https://support.microsoft.com/en-us/office/-finish-installing-update-appears-in-the-system-tray-after-you-restart-onedrive-exe-bb1c58e4-f5fd-47ed-9303-4292798ebdf4?ui=en-us&rs=en-us&ad=us)
    </td>
  </tr>
  
  <tr>
    <td>
      /takeover
    </td>
    
    <td>
      Seems to be used to takeover from earlier predecessors to the current OneDrive client.
    </td>
    
    <td>
      [Transition from the previous OneDrive for Business sync app - OneDrive | Microsoft Docs](https://docs.microsoft.com/en-us/onedrive/transition-from-previous-sync-client#configure-takeover)
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /wait
    </td>
    
    <td>
      Unclear the precise function, though it may be related to waiting for a particular file/handle to become available?
    </td>
    
    <td>
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /OneDrivePid:
    </td>
    
    <td>
      Unclear the precise function but I think it may be related to the update process
    </td>
    
    <td>
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /Background
    </td>
    
    <td>
      This seems to start all of the OneDrive.exe clients without popping up the matching File Explorer window, and without triggering the OneDrive setup window if it is not setup.
    </td>
    
    <td>
    </td>
    
    <td>
      - Startup Items<br /><br />- [windows 10 - Start onedrive.exe in silent mode? - Super User](https://superuser.com/questions/1091330/start-onedrive-exe-in-silent-mode)
    </td>
  </tr>
  
  <tr>
    <td>
      /shutdown
    </td>
    
    <td>
      This seems to gracefully shutdown all OneDrive.exe sync processes in the CURRENT USER.<br />Based on my testing this would shut down only the current user, regardless of Administrator rights, even on shared environments like RDS / WVD / AVD.
    </td>
    
    <td>
    </td>
    
    <td>
      [windows - CMD option to exit OneDrive - Super User](https://superuser.com/questions/992367/cmd-option-to-exit-onedrive)
    </td>
  </tr>
  
  <tr>
    <td>
      /setAutoStart
    </td>
    
    <td>
      This seems likely to be related to creating a startup/autorun task for OneDrive
    </td>
    
    <td>
    </td>
    
    <td>
      [OneDrive Sync Client in "Per-Machine" mode (byteben.com)](https://byteben.com/bb/installing-the-onedrive-sync-client-in-per-machine-mode-during-your-task-sequence-for-a-lightening-fast-first-logon-experience/)
    </td>
  </tr>
  
  <tr>
    <td>
      /reset
    </td>
    
    <td>
      This seems to reset the OneDrive.exe account and sync states on all businesses/personal accounts configured in this user
    </td>
    
    <td>
    </td>
    
    <td>
    </td>
  </tr>
  
  <tr>
    <td>
      /RemoteBindToObjectWW<br />/remotedebug<br />/remoteport<br />/rz
    </td>
    
    <td>
      These options were found through decompiling and analysis tools, and seem likely to be related to troubleshooting or development
    </td>
    
    <td>
    </td>
    
    <td>
    </td>
  </tr>
</table></figure> 

### More Info or Feedback?

This is a list that is likely incomplete or may be referencing older versions of OneDrive sync clients. If you have any suggestions, please reach out at one of the addresses below and I will try to get this updated.

## Building a Solution {#building-a-solution}

Since you can use [odopen](odopen://sync/?)[://sync/?siteId....](odopen://sync/?siteId) to configure a new sync site, I was hoping I might be able to find a similar URI to De-Sync a site. From what I have found though, this is not currently built in.

However, I did find the config file for the OneDrive.exe client - and it seems to store it's configuration files in plaintext .ini files in **$Env:LocalAppData/Microsoft/OneDrive/Settings/$ClientTypeID/$ClientID** . Here is a partial sample of one of these files below, showing part of how different lines map to different synced folders and libraries. <figure class="wp-block-image alignwide">

![](https://i.imgur.com/HWj6rsM.png) </figure>

With a little bit of comparison and fiddling around, it seems that removing the relevant line from this config file will remove that directory from being synced by the OneDrive client. 

## Parsing the Config

One of the raw lines in that file looks like this


```powershell



If I break that up into what parameters those seem to be, and comment them


  ```powershell 
libraryScope = 
0 
c1b8b28878084aa3aa4692b15d1fa0d6 
5 
"MySite" 
"ODB" 
2 
"https://m365x114093-my.sharepoint.com/personal/admin_m365x114093_onmicrosoft_com"
"243a00ed-631c-4e2a-b264-642efff51d7d"
57809bec75a14692936eb7a5c3620a2d 
9db72cb2c1ad4f6b8da47c30b6a4c90e
c7e03f010f30405087b91ae67c84cbf0
1630910205
"C:\Users\User\OneDrive - Contoso"
1
02ef40a0-4989-461f-ba82-fa75a3e5548c
-
1407374883731881
2789232661
00000000-0000-0000-0000-000000000000


```


## Finishing the Solution

First we need to stop the OneDrive client so it will not modify the config files after we change then - which lines up nicely with **onedrive.exe /shutdown** from above. Then we will need to make the changes to the config files, and then start OneDrive back up again (preferably without popping up Explorer.exe for the user) - this lines up nicely with **OneDrive.exe /background** from above. 

One frustrating this is that this leaves any locally-synced files present on the disk, which can easily get confusing. Probably best to wrap this with some additional commands to unpin that directory from OneDrive sync, and free up space so that the dead Library isn't taking up that disk space. 

## Where is the Module

I wrapped up parsing this config file, and clearing it off the disk space, into a command in the Module OneDrive-Client, available on the [PSGallery](https://www.powershellgallery.com/packages/Onedrive-client) and [GitHub](https://github.com/PsychoData/Onedrive-Client). Here are a couple examples of it's use. 


```powershell
Install-Module -Name OneDrive-Client    
Get-ODClients | Get-ODSyncedLibraryConfig  | where {$_.SiteID -eq "f496b4697f1d4b968542d065c7dd261b"} | Remove-ODSyncedItemConfig
```



```powershell
Install-Module -Name OneDrive-Client    
 Get-ODClients | Get-ODSyncedLibraryConfig  | where {$_.SiteName -like "OldTeam"} | select -expandProperty SyncedFolders | where {$_.FolderName -eq 'OldDeadChannel'} | Remove-ODSyncedItemConfig
```


