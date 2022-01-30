---
title: Multilingual Windows 10 20H2 OSD with ConfigMgr
author: acc
type: post
date: 2021-02-16T10:06:58+00:00
url: /2021/02/16/multilingual-windows-10-20h2-osd-with-configmgr/
categories:
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Task Sequence
  - Windows

---

## Introduction

In this post I'm going to share with you a task sequence for ConfigMgr / SCCM / MEMCM / MECM / MCM (this is just getting silly now) that localises Windows 10 to a language other than the default language of the OS install media.

This is a follow up from my previous post [Language Packs, Language Experience Packs, Language Interface Packs… what?!](https://sysmansquad.com/2020/06/08/language-packs-language-experience-packs-language-interface-packs-what/)

In that post I broke down the necessary bits in order to understand how to localise a Windows system. I covered what Language Packs, Language Experience Packs, Language Interface Packs and Features on Demand are. I took a couple of cheap shots at Microsoft by complaining how annoying the process is, but ended on a high note because they came through with huge improvements to the process in Windows 10 2004 onwards.

In this post I'll discuss what those improvements are and what the process of localising a Windows 10 system in your ConfigMgr task sequence is now moving forward.

In summary of said improvements, instead of completely changing the system default language, we now have a distinction between a user default language and system default language - this negates the whole InstallLanguage issue ([read my previous post](https://sysmansquad.com/2020/06/08/language-packs-language-experience-packs-language-interface-packs-what/) if you don't know what the InstallLanguage issue is).

Language Pack (LP), Language Experience Pack (LXP), Language Interface Pack (LIP) and Features on Demand (FoD). For simplicity I’m just going to use acronyms from here on out.

## What changed?

Microsoft created a difference between system default language and user default language.

Here is the `dism.exe /online /get-intl` output after we have built a fr-fr system using en-us base install media with this "new" process in Windows 10 2004 or 20H2:

![screenshot](multilingualosdwin1020h2-14.png) `dism.exe /online /get-intl` output in French Here's the translation of the above output:

> Deployment Image Maintenance and Management Tool  
> Version: 10.0.19041.572  
> Image version: 10.0.19042.685  
> International settings report online.  
> **System user interface default language: en-US  
> System locale: fr-FR**  
> Default time zone: GMT Standard Time  
> Active keypad (s): 040c: 0000040c  
> Keyboard Layer Driver: Not Installed.  
> Installed language (s): en-US  
> Type: fully localized language.  
> Installed language (s): fr-FR  
> Type: partially localized language, MUI type.  
> Relief languages ​​en-US  
> The operation is a success.  

We can see from the above output, this is the new distinction of user and system default languages on a system.

This means in our task sequence, after the `Apply Operating System Image` step, we can now install our language content (LP, LXP and FoD) and set the locale options to match that of the newly installed LP in the `Apply Windows Settings` step.

You'll notice below I'm depending on the [OSDWindowsSettings* task sequence variables](https://docs.microsoft.com/mem/configmgr/osd/understand/task-sequence-steps#BKMK_ApplyWindowsSettings), which are picked up by collection variables. This saves from needing multiple `Apply Windows Settings` steps.

[![screenshot](multilingualosdwin1020h2-1-1-726x1024.png)](multilingualosdwin1020h2-1-1.png) Windows 10 20H2 task sequence, click to enlarge So what? That's not new! Correct, but what is new, is that previously, doing the above would have changed the system's default language and the InstallLanguage key to French. This caused a problem when admins tried to later IPU or deploy feature updates to their Windows 10 devices in the language that was of the install media they used in their task sequences (in this scenario, English en-us).

Specifically, the issue they would have seen is a halted IPU / feature upgrade, with `setupact.log` and [SetupDiag.exe](https://docs.microsoft.com/windows/deployment/upgrade/setupdiag) complaining about:

`Target language en-US is not compatible with the host language`

This new change means we don't have to do anything special or overly cumbersome in our task sequence! All we need is to specify the language we want in the `Apply Windows Settings` step. And more importantly, we can do so without worrying about it coming back to bite us later when you upgrade the system to a newer version of Windows 10.

I don't know how much work the lucky people in the Windows team did behind the scenes in order to make this work, but if you think about what they've done, they've nailed it. They solved the problem by not giving us any special instructions to follow. We literally no longer need to do anything special in our builds, or arguably any different compared to the way we **should** have been doing in all along, and it just works.

The InstallLanguage issue is now no more:

[![screenshot](multilingualosdwin1020h2-12.png)](multilingualosdwin1020h2-12.png) HKLM:SYSTEM\CurrentControlSet\Control\Nls\Language:InstallLanguage Above is what `HKLM:SYSTEM\CurrentControlSet\Control\Nls\Language` looks like after building a Windows 10 2004 or 20H2 system and changing the user default language to French (fr-fr - 040c), not the system default language (en-us - 0409)!

## Prerequisites

Before we get started, [I still recommend you create LXP and FoD repositories](https://sysmansquad.com/2020/06/08/deploy-languages-via-software-center-with-pscmwin10language/).

We'll be using that content from those repositories in this task sequence to further localise and improve the user experience with Windows 10 in their preferred language.

[As mentioned in my last blog post](https://sysmansquad.com/2020/06/08/language-packs-language-experience-packs-language-interface-packs-what#language-experience-packs), LXPs "top up" translations in parts of the UI where LPs fall short and FoDs improve the user experience with Windows 10 features in their preferred language.

Both LXP and FoDs frequently receive translation improves because their updates come from the Microsoft Store.

LXPs are also how Microsoft reach their 110+ language support in Windows 10, while only offering 38 base language ISO install media.

To get started, install my [PSCMWin10Language](https://github.com/codaamok/PSCMWin10Language) PowerShell module from the gallery and download the following ISO:

[![screenshot](multilingualosdwin1020h2-2-1024x459.png)](multilingualosdwin1020h2-2.png) mu_windows_10_language_pack_version_2004_x86_arm64_x64_dvd_7729a9da.iso 
[![screenshot](multilingualosdwin1020h2-15.png)](multilingualosdwin1020h2-15.png) Microsoft Volume Licensing Service Center searching for language content 

**Note:** yes you will be downloading content for 2004, even though we are building a 20H2 task seqeuence.

The above is a screenshot from the Visual Studio Subscription downloads portal and VLSC.

You'll see what we can download ISOs containing just LXPs, which have a new and confusing naming convention of 9B, 9C, 10C and 11C.

It looks like this naming convention is relevant to a [known issue with Windows 10 2004](https://docs.microsoft.com/windows-hardware/manufacture/desktop/language-packs-known-issue):

> When servicing a Windows image with a cumulative monthly security update or public preview, the corresponding LXP ISO for that update needs to be downloaded and installed for the LXPs to work correctly. If this step is skipped, then the user may experience unexpected language fallback (e.g., see text in a language that they cannot understand) until they are able to update their LXP via the Microsoft Store. Note that LXPs cannot be updated until OOBE is completed (i.e., device has reached the Desktop) and the device has established internet connectivity.
>
> To find the correct LXP ISO for your associated monthly quality update, look for the abbreviation of your update in the LXP ISO filename (e.g., 9B). If a quality update doesn't have a corresponding LXP ISO, use the LXP ISO from the previous release.
>
> Adding Local Experience Packs (LXPs) in Windows 10 version 2004 and later versions: Known issue

Thanks so much to [@SCCM_Ryan](https://twitter.com/sccm_ryan) for helping me by sharing the above info with me, and the screenshot from VLSC.

In any case, grab the one which reads just "Language Packs" because it contains LPs and LXPs:

[![screenshot](multilingualosdwin1020h2-3.png)](multilingualosdwin1020h2-3.png) Language Pack and Language Experience Pack ISO You'll also want to download the FoD ISO. You'll only want Part 1, Part 2 contains retail demo stuff.

[![screenshot](multilingualosdwin1020h2-4-1024x685.png)](multilingualosdwin1020h2-4.png) Features on Demand ISO Now you have the ISOs downloaded and mounted, let's use the PSCMWin10Language PowerShell module to create our folder structure for each language, ready to create Packages with in ConfigMgr.

[I did write another blog post](https://sysmansquad.com/2020/06/08/deploy-languages-via-software-center-with-pscmwin10language/) which covers how to use this module in a little more detail if you need it.

```powershell
Install-Module "PSCMWin10Language" -Scope CurrentUser
Import-Module "PSCMWin10Language"
New-LPRepository -Language "fr-FR", "de-DE" -SourcePath "D:\x64\langpacks\" -TargetPath "G:\OSD\Windows10-1903-Languages\"
New-LXPRepository -Language "fr-FR", "de-DE" -SourcePath "D:\LocalExperiencePack" -TargetPath "G:\OSD\Windows10-1903-Languages\"
New-FoDLanguageFeaturesRepository -Language "fr-FR", "de-DE" -SourcePath "E:\" -TargetPath "G:\OSD\Windows10-1903-Languages\"
```
                    
[![screenshot](multilingualosdwin1020h2-5.png)](multilingualosdwin1020h2-5.png) New-LPRepository
[![screenshot](multilingualosdwin1020h2-6.png)](multilingualosdwin1020h2-6.png) New-LXPRepository
[![screenshot](multilingualosdwin1020h2-7.png)](multilingualosdwin1020h2-7.png) New-FoDLanguageFeaturesRepository

Now you should have a nice folder structure ready for you to create your Packages with in ConfigMgr. Here's a screenshot of how I organised my ConfigMgr Packages using the newly created folders made by PSCMWin10Language.

**Note:** PSCMWin10Language will not create these Packages for you.

[![screenshot](multilingualosdwin1020h2-8-1024x497.png)](multilingualosdwin1020h2-8.png) Packages for Windows 10 2004 LP, LXP and FoD One last thing we want to take care of are your collections. In the task sequence we'll be using the [OSDWindowsSettings* task sequence variables](https://docs.microsoft.com/mem/configmgr/osd/understand/task-sequence-steps#BKMK_ApplyWindowsSettings) so we don't have lots of `Apply Windows Settings` steps.

My OSD collections used here have these collection variables defined:

[![screenshot](multilingualosdwin1020h2-9.png)](multilingualosdwin1020h2-9.png) Windows 10 French OSD collection with collection variables

Using the OSDWindowsSettings* collection variables so they're picked up in your task sequence is completely optional. If you you prefer, you can of course use your own conditions in your task sequence and have multiple `Apply Windows Settings` steps if you prefer, and for each of those `Apply Windows Settings` steps you would choose the language options from each dropdown.

## Shut up and give me the task sequence

[Download Exported Task Sequence](https://github.com/SysManSquad/BlogFiles/raw/master/codaamok/Multilingual%20Windows%2010%2020H2%20OSD%20with%20ConfigMgr/SysManSquadMultilingualWindows10TaskSequence-20200213.zip)

The Task Sequence was exported from a ConfigMgr 2010 environment.

This task sequence contains just enough to not only build a quick VM to demonstrate what I've discussing, but also it should be enough in order for you to glean the insight you need. Or to perhaps incorporate it into your own existing task sequence.

![screenshot](multilingualosdwin1020h2-10.png) Import SysManSquadMultilingualWindows10TaskSequence-20200213.zip You will need to set the option to **ignore dependencies**, simply because the PackageID references in the task sequence would not resolve in your environment.

![screenshot](multilingualosdwin1020h2-11.png) Set the **Action** to **Ignore Depedency** Once imported, you will see that beyond the initial few steps of formatting the drive and applying the OS image, there's nothing more complicated than the 3 steps for each language you want in your task sequence: installing the LP, LXP and FoD language content.

![screenshot](multilingualosdwin1020h2-13.png) Steps in the task sequence which install the language content for fr-FR and de-DE It's these steps you will have to update to use the Packages you made in the previous section, from your environment.

You'll notice the `Apply Windows Settings` step has the locale options set to `Do not specify` . This is by design because these are set on the fly by the OSDWindowsSettings* task sequence variables.

Poke around each step's condition so you understand how the collection variables come in to play, as this is ultimately how you control which client installs which language during the task sequence.

After running the task sequence, the result on the device is that it will have a system default language of en-us, and a user default language of either fr-fr or de-de.

## Trust but verify

There's a slight issue here. I want to be able to verify we can successfully IPU or feature update a system using en-us media/content after building a French/German system following this process. But we can't. Yet.

This new change to Windows was introduced in Windows 10 2004, and the latest version of Windows is 20H2. To upgrade 2004 to 20H2, [we can only use the enablement package](https://support.microsoft.com/topic/feature-update-through-windows-10-version-20h2-enablement-package-02d91e04-931e-f00d-090c-015467c49f6c).

Therefore the moment Windows 10 21H1 comes out, we should all be testing we can upgrade IPU / feature update from 2004, with no InstallLanguage issue. In theory, the InstallLanguage is literally non-existent and we can see that now from looking at the registry of a 2004/20H2 system today.

## Wrap up

I hope you found my content on localising Windows 10 helpful. I get a kick out of doing this for the community when I know I've helped someone. If you have any issues/questions, comment below or DM/tweet on Twitter [@codaamok](https://twitter.com/codaamok). Equally, if any of this helped, still let me know.

## Further reading

* [Reduce the size of multilingual Windows images with LXPs](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/reduce-the-size-of-multilingual-windows-images-with-lxps/ba-p/1503381)
* [New in Windows 10 2004: Better Language Handling](https://oofhours.com/2020/06/01/new-in-windows-10-2004-better-language-handling/)
* [Language Packs, Language Experience Packs, Language Interface Packs… what?!](https://sysmansquad.com/2020/06/08/language-packs-language-experience-packs-language-interface-packs-what/)
