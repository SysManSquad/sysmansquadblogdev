---
title: Deploy languages via Software Center with PSCMWin10Language
author: Adam Cook
type: post
date: 2020-06-08T15:00:00+00:00
url: /2020/06/08/deploy-languages-via-software-center-with-pscmwin10language/
categories:
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Powershell
  - Scripting
tags:
  - features on demand
  - language experience pack
  - language pack

---
<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-9a00a591-1d32-40de-8866-a889c02a0be1 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Install the module](#install-the-module)<li class="uagb-toc__list">
          [Create LP, LXP and FoD repositories](#create-lp-lxp-and-fod-repositories)<li class="uagb-toc__list">
            [Create the Applications](#create-the-applications)<li class="uagb-toc__list">
              [Support](#support)</ol> </div> </div> </div> <hr class="wp-block-separator" />
              
              <p>
                This post complements [my other post](https://sysmansquad.com/2020/06/02/language-packs,-language-experience-packs,-language-interface-packs-what?!), where I walk-through the differences of LP, LIP, LXP and FoD.
              </p>
              
              <p>
                Here I will show you how to use a PowerShell module I wrote, [PSCMWin10Languages](https://github.com/codaamok/PSCMWin10Language), to create Microsoft Endpoint Manager Configuration Manager Applications for each language you want to deploy via the Software Center.
              </p>
              
              <p>
                These Applications are not for OSD. It changes the language only for the user who installs the Application via the Software Center. They will not work for OSD via task sequence.
              </p>
              
              <h2>
                Install the module
              </h2>
              
              <p>
                The module can be found on [GitHub](https://github.com/codaamok/PSCMWin10Language) or the [PowerShell Gallery](https://www.powershellgallery.com/packages/PSCMWin10Language/0.0.1). You can install it like so:
              </p>
              
              
```powershell
Install-Module "PSCMWin10Language" -Scope CurrentUser
```
              
              
              <p>
                Check out what functions are given to you:
              </p>
              
              
```powershell
Import-Module "PSCMWin10Language"
Get-Command -Module "PSCMWin10Language"
```
              
              
              <h2>
                Create LP, LXP and FoD repositories
              </h2>
              
              <p>
                We need to form the source folders for each of our Applications (in other words, for each language we want to support). The source folders will contain the needed LP, LXP and FoD files for each language - a mix of .cab and .appx files.
              </p>
              
              <p>
                Using the below functions, we can create the need folders and populate them with the files by extracting them from the ISOs downloaded from VLSC / Visual Studio subscription download portal (MSDN).
              </p>
              
              <ul>
                <li>
                  New-LPRepository
                </li>
                <li>
                  New-LXPRepository
                </li>
                <li>
                  New-FoDLanguageFeaturesRepository
                </li>
              </ul>
              
              <p>
                <strong>Note:</strong> New-FoDLanguageFeaturesRepository only extracts "LanguageFeature" FoDs. If you want to include more FoDs than these, you'll have to arrange something yourself.
              </p>
              
              <p>
                If you want to support fewer than a handful of languages, then this process is typically just about OK being completed manually. However, you will have to repeat this for each new version of Windows 10 which will quickly become a drag. Especially if you want to support many more languages. This is what inspired me to write these functions.
              </p>
              
              <p>
                Let's assume I want to support languages French and German. Our end goal is to create a folder structure that looks something like this:
              </p>
              
              
```powershell
PS C:\> tree "\\sccm.acc.local\OSD\Source\1909-Languages" | Select-Object -Skip 2
\\SCCM.ACC.LOCAL\OSD\SOURCE\1909-LANGUAGES
+---de-de
¦   +---FoD
¦   +---LP
¦   +---LXP
+---fr-fr
    +---FoD
    +---LP
    +---LXP
```
              
              
              <p>
                Start off by going to VLSC or MSDN and downloading the following ISOs for your target Windows 10 version:
              </p>
              
              <ul>
                <li>
                  Language Pack
                </li>
                <li>
                  Features on Demand (part 1)
                </li>
              </ul>
              
              <p>
                Once downloaded, mount them all and go back to the PowerShell prompt where we imported PSCMWin10Language, and execute the following (replace the appropriate drive letters):
              </p>
              
              
```powershell
New-LPRepository -Language "fr-FR", "de-DE" -SourcePath "I:\x64\langpacks" -TargetPath "\\sccm.acc.local\OSD\Source\1909-Languages"
New-LXPRepository -Language "fr-FR", "de-DE" -SourcePath "I:\LocalExperiencePack\" -TargetPath "\\sccm.acc.local\OSD\Source\1909-Languages"
New-FoDLanguageFeaturesRepository -Language "fr-FR", "de-DE" -SourcePath "J:\" -TargetPath "\\sccm.acc.local\OSD\Source\1909-Languages"
```
              
              
              <h2>
                Create the Applications
              </h2>
              
              <p>
                With the LP, LXP and FoD repositories set up, we're now ready to create our ConfigMgr Application(s)
              </p>
              
              
```powershell
New-CMLanguagePackApplication -SiteServer "cm.contoso.com" -SiteCode "P01" -SourcePath "\\sccm.acc.local\OSD\Source\1909-Languages" -Languages "fr-fr", "de-de" -WindowsVersion @{ "Version" = "1909"; "Build" = "18363" } -GlobalConditionName "Operating System build" -CreateAppIfMissing -CreateGlobalConditionIfMissing
```
              
              
              <p>
                There's quite a few parameters used here so let me explain them:
              </p>
              
              <ul>
                <li>
                  Site server and site code of your hierarchy, standard stuff
                </li>
                <li>
                  <code>-SourcePath</code> of where we exported all our languages' LP, LXP and FoDs to
                </li>
                <li>
                  <code>-Languages</code> an array of Language tags of which we want to create Applications for. The elements of this array will correlate with the folders directly beneath the given -SouthPath
                </li>
                <li>
                  <code>-WindowsVersion</code> a hashtable which denoates the version and build number of Windows 10 you're deploying language items for. Must contain two keys: "Version" and "Build".
                </li>
                <li>
                  <code>-GlobalConditionName</code> name of the Global Condition which queries the WMI class Win32_OperatingSystem for property Build. If a Global Condition with the given name does not exist, a terminating error is thrown. If it does exist, but it does not query the Win32_OperatingSystem class for the Build property, a terminating error is thrown.
                </li>
                <li>
                  Lastly, the two switches <code>-CreateAppIfMissing</code> and <code>-CreateGlobalConditionIfMissing</code> does pretty much it says on the tin; creates those items if they're missing.
                </li>
              </ul>
              
              <p>
                This is what the end result looks like:
              </p>
              
              <div class="wp-block-image">
                <figure class="aligncenter size-large">[![](LPSoftwareCenter-EndResult-2-new-1024x658.jpg)](LPSoftwareCenter-EndResult-2-new.jpg)</figure>
              </div>
              
              <p>
                There are two deployment types: one which runs as user and the other which runs as system. The system deployment type installs LP, LXP and FoD. Whereas the user deployment type registers the LXP, configures the user's language and prompts a reboot is required by returning exit code 3010.
              </p>
              
              <p>
                The user deployment type depends on the system deployment type.
              </p>
              
              <p>
                Poking around, you'll notice the requirements for all deployment types are that of what you used in the <code>-WindowsVersion</code> parameter.
              </p>
              
              <p>
                When you're ready to support another OS, or another language, just repeat these instructions with that context in mind and you're good to go!
              </p>
              
              <p>
                For example, I used the same process again to create deployment types on the existing Applications for Windows 10 2004:
              </p>
              
              
```powershell
New-LXPRepository -Language "fr-fr", "de-de" -SourcePath "I:\LocalExperiencePack\" -TargetPath "\\sccm.acc.local\OSD\Source\2004-Languages"
New-LPRepository -Language "fr-fr", "de-de" -SourcePath "I:\x64\langpacks\" -TargetPath "\\sccm.acc.local\OSD\Source\2004-Languages"
New-FoDLanguageFeaturesRepository -Language "fr-fr", "de-de" -SourcePath "I:\" -TargetPath "\\sccm.acc.local\OSD\Source\2004-Languages"
New-CMLanguagePackApplication -SiteServer "cm.contoso.com" -SiteCode "P01" -SourcePath "\\sccm.acc.local\OSD\Source\2004-Languages" -Languages "fr-fr", "de-de" -WindowsVersion @{ "Version" = "2004"; "Build" = "19041" } -GlobalConditionName "Operating System build" -CreateAppIfMissing -CreateGlobalConditionIfMissing
```
              <figure class="wp-block-image size-large">
              
              [![](LPSoftwareCenter-EndResult-3-new-1024x658.jpg)](LPSoftwareCenter-EndResult-3-new.jpg)</figure> <h2>
                Support
              </h2>
              
              <p>
                If you have any issues with the module, please do open an issue on the [PSCMWin10Language GitHub repository](https://github.com/codaamok/PSCMWin10Language)!
              </p>
