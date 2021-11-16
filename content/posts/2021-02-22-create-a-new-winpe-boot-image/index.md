---
title: Create a new WinPE boot image
author: Adam Cook
type: post
date: 2021-02-22T09:51:23+00:00
url: /2021/02/22/create-a-new-winpe-boot-image/
categories:
  - Endpoint Management
  - How-To
  - MECM/MEMCM/SCCM

---
<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-dbfa68ec " data-scroll= "1" data-offset= "30" data-delay= "800" > 

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
          [The "GUI" way](#the-gui-way)<li class="uagb-toc__list">
            [Using PowerShell](#using-powershell)<ul class="uagb-toc__list">
              <li class="uagb-toc__list">
                [Update](#update)
              </li>
            </ul></ol> </div> </div> </div> 
            
            <h2>
              Introduction
            </h2>
            
            <p>
              In this post I'll show you how you can create a new boot image in ConfigMgr.
            </p>
            
            <p>
              There's plenty of good content out there already on this, but I was interested to write this because I didn't see many PowerShell examples out there until I came across Michael Niehaus' post on [Build your own Windows PE image](https://oofhours.com/2021/01/17/build-your-own-windows-pe-image/). A fantastic post, highly recommend reading it. Michael provided a useful script at the end of this post in a .zip file. I felt it could do with some improvements.
            </p>
            
            <p>
              In this post I'll share two ways on how to create a boot image for ConfigMgr:
            </p>
            
            <ul>
              <li>
                The "GUI" way: copy the WinPE.wim file from your ADK directory, importing it into ConfigMgr, and adding your optional components drivers via the console
              </li>
              <li>
                Using PowerShell to copy the WinPE.wim, add our drivers and optional components and then import into wherever you need
              </li>
            </ul>
            
            <p>
              Generally, it's better to not modify the default boot images that come out of the box with ConfigMgr. But if you've modified them, don't sweat it, at least you'll have this post to help you create a fresh one in future if need.
            </p>
            
            <h2>
              The "GUI" way
            </h2>
            
            <ol>
              <li>
                Navigate to your ADK installation directory. It'll likely be <code>C:\Program Files (x86)\Windows Kits\10\Assessment and Deployment Kit\Windows Preinstallation Environment</code>
              </li>
              <li>
                You'll notice you have multiple winpe.wim files on disk, one for each architecture:
              </li>
            </ol><figure class="wp-block-image size-large">
            
            ![](createnewbootimageconfigmgr-1-1024x468.png)<figcaption>Multiple WinPE.wim files in the ADK installation directory</figcaption></figure> <ol start="3">
              <li>
                Let's run with the most common requirement here and copy <code>amd64\en-us\winpe.wim</code> to any destination directory you need
              </li>
              <li>
                Optionally rename it to something more particular, perhaps to include today's date and architecture e.g. <code>WinPE-amd64-2021-02-13.wim</code>
              </li>
              <li>
                Open the ConfigMgr console, and right click on Boot Images under Software Library > Operating Systems.
              </li>
            </ol><figure class="wp-block-image size-large">
            
            [![](createnewbootimageconfigmgr-2.png)](createnewbootimageconfigmgr-2.png)<figcaption>Add Boot Image in ConfigMgr console</figcaption></figure> <ol start="6">
              <li>
                Go through the wizard to browse out and select our new boot image <code>WinPE-amd64-2021-02-13.wim</code>
              </li>
              <li>
                After the wizard completes, you'll notice that ConfigMgr duplicated the .wim file and appended the PackageID to the file name. Any changes we make to this boot image, e.g. add optional components or drivers, ConfigMgr will modify the .wim file with the PackageID in the filename, leaving the original untouched.
              </li>
            </ol>
            
            <p>
              For each change you make to this boot image, ConfigMgr will always start with a fresh copy from the original - the one without the PackageID in the file name. **Don't delete it**!Otherwise you'll find yourself making a new one, again, when you come to update drivers or add new components later.
            </p><figure class="wp-block-image size-large">
            
            [![](createnewbootimageconfigmgr-3-1024x358.png)](createnewbootimageconfigmgr-3.png)<figcaption>Boot image on disk and in console after imported</figcaption></figure> <ol start="8">
              <li>
                Now you're free to do as you please with your new fresh new vanilla boot image. You'll notice adding optional components etc will increase the file size, naturally.
              </li>
            </ol><figure class="wp-block-image size-large">
            
            [![](createnewbootimageconfigmgr-4-1024x823.png)](createnewbootimageconfigmgr-4.png)<figcaption>Boot image with drivers and optional components added</figcaption></figure> <p>
              What I want to point out here is that because we did these actions within the ConfigMgr console, i.e. add drivers and optional components, we can see exactly what those drivers and components are.
            </p>
            
            <p>
              When we come to do this using PowerShell, our new boot image will contain all the same drivers and optional components, however when we right click and go to Properties like I demonstrated in the screenshots above, you won't actually see anything in the **Drivers** or **Optional Components** tabs.
            </p>
            
            <h2>
              Using PowerShell
            </h2>
            
            <p>
              This was inspired by Michael Niehaus's script but I added some improvements.
            </p>
            
            <ol>
              <li>
                [Download New-WinPEWIM.ps1](https://github.com/codaamok/PoSH/blob/master/ConfigMgr/New-WinPEWIM.ps1) from my GitHub by cloning my repo or clicking the Raw button, right clicking empty space and selecting "Save As". It will attempt to download it as .txt. Just rename it to .ps1 as the only file extension.
              </li>
            </ol><figure class="wp-block-image size-large">
            
            [![](createnewbootimageconfigmgr-5-1024x582.png)](createnewbootimageconfigmgr-5.png)<figcaption>View New-WinPEWIM.ps1 as Raw</figcaption></figure> <ol start="2">
              <li>
                Execute the script. Customise any of the parameters to suit your needs:
              </li>
            </ol>
            
            
```powershell
.\New-WinPEWIM.ps1 -Platforms amd64 -OptionalComponents "WinPE-WDS-Tools", "WinPE-Scripting", "WinPE-WMI", "WinPE-SecureStartup", "WinPE-NetFx", "WinPE-PowerShell", "WinPE-StorageWMI", "WinPE-DismCmdlets" -OutputDirectory "G:\OSD\BootImages" -DriversDirectory "G:\Drivers\WINPE10.0-DRIVERS-A22-3GVJN\x64"
```
            <figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio">
            
            <div class="wp-block-embed__wrapper">
              <span class="embed-youtube" style="text-align:center; display: block;"></span>
            </div><figcaption>YouTube video on using New-WinPEWIM.ps1</figcaption></figure> 
            
            <p>
              You'll notice that when you import this to ConfigMgr, the **Drivers **and **Optional Components** tabs will be blank. Since ConfigMgr wasn't the tool used to inject drivers or optional components, it doesn't know what it doesn't know!
            </p>
            
            <p>
              This is arguably a reasonable drawback of using this approach, because it creates a little obfuscation. Another admin who was looking through your boot images wouldn't understand there are already drivers and optional components added to the boot image. Their only clue when looking at it on face value would be that the file size would be larger than the default.
            </p><section class="wp-block-uagb-section uagb-section__wrap uagb-section__background-undefined uagb-block-8fcd5028">
            
            <div class="uagb-section__overlay">
            </div>
            
            <div class="uagb-section__inner-wrap">
              <h4>
                Update
              </h4>
              
              <p>
                Adam Gross has a script on his GitHub where you can import a new WinPE boot image to your ConfigMgr site while still being able to get those juicy tabs / metadata fields populated!
              </p>
              
              <p>
                [New-BootImage.ps1](https://github.com/AdamGrossTX/PowershellScripts/blob/master/ConfigMgr/BootImage/New-BootImage.ps1)
              </p>
              
              <p>
                It looks like it doesn't have a parameter to let you specify which Optional Components you want injected, it's hardcoded on [line #214](https://github.com/AdamGrossTX/PowershellScripts/blob/master/ConfigMgr/BootImage/New-BootImage.ps1#L214). So tinker with that if you want to add different, more, or fewer optional components.
              </p>
              
              <p>
                It also doesn't have a parameter for it to inject a directory of drivers. I'll make a PR at some point and update this block when that's done.
              </p>
            </div></section> 
            
            <p>
              None the less I hope you found this useful. Let me know if you have any questions or feedback in the comments below, or [DM/tweet me on Twitter @codaamok](https://twitter.com/codaamok).
            </p>
