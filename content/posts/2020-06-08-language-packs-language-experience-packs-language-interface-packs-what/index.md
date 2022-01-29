---
title: Language Packs, Language Experience Packs, Language Interface Packs… what?!
author: acc
type: post
date: 2020-06-08T15:00:00+00:00
url: /2020/06/08/language-packs-language-experience-packs-language-interface-packs-what/
categories:
- Endpoint Management
- How-To
- MECM/MEMCM/SCCM
- Task Sequence
tags:
- features on demand
- language experience pack
- language pack
---
For a while I have been curious on how to do Windows OSD with multiple languages "the proper way" using Configuration Manager. Whenever I have approached the subject I have always felt overwhelmed.

Googling the topic is just a hot mess. You're faced with information that's old, lacking real detail or generally misunderstood. My aim here is to demystify the topic and show you a solid way to do Windows 10 multi language OSD with ConfigMgr along with sound reasoning.
I'll also touch on how to deploy languages via the Software Center and discuss what's improved in Windows 10 version 2004.

#### Update 2021-02-16

I've written a new post [Multilingual Windows 10 20H2 OSD with ConfigMgr](https://sysmansquad.com/2021/02/16/multilingual-windows-10-20h2-osd-with-configmgr/) which walks you through the detail on how to do this with Windows 10 2004 and onwards.

The new improvements negate the InstallLanguage issue. If you haven't read this post yet, it's still recommended to read it as it breaks down what Language Packs, Language Experience Packs, Language Interface Packs, and Features on Demands are. It also discusses what the InstallLanguage issue was.

While researching I had questions like:

* How and when do I install Language Experience Packs? What are they?
* To change a system's language I need a Language Pack. So what's the difference between a Language Experience Pack and Language Interface Pack?
* Why should I use one over the other?
* If a Language Pack does the job, why do Language Experience Packs exist?
* Why don't Language Experience Packs localise everything?
* What are language specific Features on Demand and do I need them?
* **What on earth do I need to do to deploy Windows 10 as another language (completely localized for a user in their most comfortable language), without a million different ISOs on my Distribution Points and in my task sequence, and not screw with the InstallLanguage / default system language? (if you're not familiar with the "InstallLanguage" issue, you will be after you've read this)**

That last question was my main driver for needing to learn this topic. I've spent many hours reading docs, blogs, messing around in my lab and putting this post together. I really hope it is useful!

Throughout examples I'll assume your OS media is something like en-us, the target language is fr-fr and we're deploying Windows 10 1909.

## Difference between LP, LXP, LIP and FoDs

Language Pack (LP), Language Experience Pack (LXP), Language Interface Pack (LIP) and Features on Demand (FoD). For simplicity I'm just going to use acronyms from here on out.

### Language Packs

These apparently used to come as `lp.cab` files in the "good ol' days". However more recently the naming convention is something like `Microsoft-Windows-Client-Language-Pack_x64_fr-fr.cab`. These are grabbed from VLSC or MSDN / Visual Studio Subscription in an ISO.
You'll see you can also download media for LXPs too, but these items are included just the "Language Packs" media too. For Windows 10 2004, there's no separate download in Visual Studio Subscription for LXP - all is included in one "Language Packs" media ISO.

[![screenshot](languagepackdownloadmsdn-1024x266.jpg)](languagepackdownloadmsdn-scaled.jpg)
Microsoft offer 38 base / primary languages to choose from, so in other words you can get 38 ISOs of Windows 10 in 38 languages, and also 38 LP `.cab` files. Click the below to see what these 38 base / primary languages are:

* [https://docs.microsoft.com/windows-hardware/manufacture/desktop/available-language-packs-for-windows#language-packs](https://docs.microsoft.com/windows-hardware/manufacture/desktop/available-language-packs-for-windows#language-packs)

It's good to know that Windows 10 supports 110 languages. 38 are possible via just LPs whereas the rest are achievable via LXPs (ignore the fact the table further down in that page reads Language Interface Packs and not Language Experience Packs, I'll get on to that later.)

To achieve full localization of our target language during OSD, generally we install LP `.cab` files in WinPE (aka "offline") using `dism.exe` or `Add-WindowsPackage`. This step normally occurs after the `Apply Operating System` step and before the `Apply Windows Settings` step. An example command below:

```text
dism.exe /Image:"%OSDTargetSystemDrive%" /ScratchDir:%OSDTargetSystemDrive%WindowsTemp /Add-Package /PackagePath=".Microsoft-Windows-Client-Language-Pack_x64_fr-fr.cab"
```

[![screenshot](installLPtasksequenceexample.png)](installLPtasksequenceexample.png)Example step to install LP using dism.exe
At this point, this isn't enough to localize the system as fr-fr. The next key bit is to configure the locale dropdown settings in the `Apply Windows settings` step as French.

[![screenshot](applywindowssettingstasksequencetexample-2-2.jpg)](applywindowssettingstasksequencetexample-2-2.jpg)Example Apply Windows Settings step to adjust locale after LP install
You have two options with the`Apply Windows settings`step. Either:

* Use the new-ish[OSDWindowsSettings* task sequence variables](https://docs.microsoft.com/mem/configmgr/osd/understand/task-sequence-steps#BKMK_ApplyWindowsSettings). These set what you would otherwise select from the dropdown settings in the `Apply Windows settings` step.
* **OR**
* Have as many`Apply Windows settings`steps as you do languages and select the locale options you want in the dropdown settings, then condition each step based on some criteria.

Either way, it's this `Apply Windows settings` step which populates elements in the unattend.xml answer file on the fly.
Configuring this step will give you a completely localized system as fr-fr. Windows startup, the logon UI, input locale, format, everything. Every element in the UI possible is localized to French.

Here is what the system will look like:

[![screenshot](StoryBoard-LanguagePackUserExperience.png)](StoryBoard-LanguagePackUserExperience.png)

Looks good, right? Well, sadly not. Let's discuss the 3 drawbacks with this approach:

#### Start menu search does not work

You will find that the start menu search, and perhaps other things, just don't work unless you (re)install the latest cumulative update.
It is a [known documented fact](https://docs.microsoft.com/windows-hardware/manufacture/desktop/add-language-packs-to-windows#considerations) that if you install anything that is language specific, such as a LP, then the latest cumulative update will want to reinstall again.

Perhaps an option here might to be use an RTM ISO/WIM of Windows 1909, or at least one that's serviced to be n-1, with the anticipation that you will install the latest cumulative update in your task sequence. Of course this will increase build time, although if you're installing software updates during OSD anyway then it might not be a big deal for you to do that.

[The order of install matters](https://docs.microsoft.com/windows-hardware/manufacture/desktop/features-on-demand-v2--capabilities). First add LPs, FoDs and then apps in that order. If you install a cumulative update before any of those, then the update will want reinstalling.

#### The "InstallLanguage" issue

If you're not familiar with the InstallLanguage issue, then it's well explained in the below Ignite 2019 session at around 7:45:

* [SolvingWindows10featureupdatesinamultilingualdeployment](https://www.youtube.com/watch?v=ZhL0AO8Cnig&ab_channel=MicrosoftIgnite) - Sudhagar Thirumoolan ([@sudhagart](https://twitter.com/sudhagart?lang=en))

In summary, the InstallLanguage issue is caused by what we just did by using en-us install media, installing fr-fr LP and then setting the System Locale to be fr-fr during Windows Setup (via unattend.xml / `Apply Windows Settings` step). It's symptoms are visible when you try to feature update Windows 10 using installation media which does not match the system language.

To reclarify exactly what causes the InstallLanguage install: take the scenario where if we install Windows, apply an LP to the image and change the System Locale to different langauge via configuring the `Apply Windows Settings` step like I've shown you, this will change the system language and create the InstallLanguage issue.

To identify a system which suffers with the InstallLanguage issue, you will find the `InstallLanguage` registry value in key `HKLM:SYSTEM\CurrentControlSet\Control\Nls\Language` set to `040c` (fr-fr) and not `0409` (en-us). Remember, my scenario throughout this post is to use en-us base install media, and attempt to localise the system as fr-fr.

After we've built a system like this, if we attempt to feature update it using en-us media `setupact.log` and [SetupDiag.exe](https://docs.microsoft.com/windows/deployment/upgrade/setupdiag) will both tell you:

`Target language en-US is not compatible with the host language`

Now what? Well your options are:

* Use all the Windows medias in your in-place upgrade task sequence that match the InstallLanguage on machines in your estate. This could get bulky very quick, but it'll work.
* Stop using in-place upgrade task sequences and use feature updates instead. This way you simply download, distribute and deploy all the feature updates in the languages that match the InstallLanguage on machines in your estate. This could also get bulky in storage as you'll need to download as many feature updates as you have languages in your estate.
* Point your clients to Windows Update / Windows Update for Business instead, because it "just works". If your remote offices have their own leg out on the Internet, or WAN link speed isn't a concern, then I recommend you seriously consider this option.
* This is most probably unsupported, but change the InstallLanguage registry value back to `0409` (en-us) and Windows will upgrade using en-us media. Just make sure en-us LP is definitely installed. Look in `HKLM:\SYSTEM\CurrentControlSet\Control\MUI\UILanguages` or check out `dism.exe /online /get-intl` (hey, don't shoot me, I'm just the messenger.)

Some of the above could be costly one way or another. It could mean more storage server side, more steps in your task sequence or saturated links. Take your pick. But maybe you're not happy with the options and you're convinced that there's got to be another way. Or maybe you need a little more translation than what's currently offered. In which case keep reading...

#### Not enough translation

Another problem with installing _only_ LPs is the limited translation support compared to the supposedly 110 languages available in Windows 10.

I know I said LP offers complete translation of the whole UI, which is true, however there are scenarios when you need further translation.

A good example of this is [this Twitter thread I had with Manel Rodero](https://twitter.com/manelrodero/status/1261359938481410048). Manel needs Windows 10 with Catalan language. The only Spanish options as far as base / primary languages go are es-mk (Mexico) or es-es (Spain).

This is where LXPs come in and why there is the concept of primary and secondary languages with Windows 10. Manel achieves Windows 10 localisation to Catalan using es-es base / primary language and then installs LXPs for Catalan which "tops up" the user experience with further, more specific, translations.

So let's move on to LXPs, but first let's briefly mention LIPs.

### Language Interface Packs

Not much to be said about these. Essentially all there is to it: LIPs are out, LXPs are in.
Starting with Windows 10 1803 LXPs were introduced and LIPs were deprecated. I think starting from 1809 you can no longer source LIPs, only LXPs.
All you do need to know is that LIPs provided partial translations to popular / common areas of the UI where LPs fell short.

### Language Experience Packs

LXPs serve the same purpose as LIPs; they still provided partial translations where the LP fell short.
They are in `.appx` form and are continuously updated by Microsoft via the Store. You can download them for your task sequence from VLSC or your Visual Studio Subscription download portal. I think you can also export them from your Store for Business? But I don't know enough about that, sorry.
Since they're serviced via the Store, it means you get continuous delivery of translation improvements and beautiful peer caching with Delivery Optimization.
If you block the Store then you prohibit your devices and users from receiving translation improvements.
Users can also submit translation feedback via the Feedback Hub:

![screenshot][![screenshot](feedbackhubexample.png)](feedbackhubexample.png)Feedback hub where users can submit translation feedback to Microsoft, which Microsoft can quickly patch and deliver via the store

You may think it's not a big deal if you block the Store, however when I built a task sequence to use LXP instead of LP, I observed some noticeable differences around Windows in testing before and after applying Store updates after OSD. I'll show you in a moment.

The process I followed to use LXP instead of LP in my task sequence was the same as demonstrated in a recent Microsoft PFE blog post:

* [Windows10MultilanguageDeploymentwithMEMCM](https://techcommunity.microsoft.com/t5/premier-field-engineering/windows-10-multilanguage-deployment-with-memcm/ba-p/1347144)

The post is OK. I couldn't quite understand why we were only installing LXP, especially since LXP provides only partial translation. It makes sense if you're trying to get to Catalan from es-es base language, but from en-us to fr-fr or de-de, or any other, it's not ideal.

I was also disappointed and confused to see what it felt like a hack being used to set the default language to that of the LXP using `control.exe intl.cpl` and some weird undocumented parameters.

> **Note:** this is not a dig at the author. I am hugely grateful for the community contribution. It offers excellent insight with examples. At this point I'm mostly expressing my frustration toward Microsoft for making the task seem like magic or voodoo, when it should be clear and logical.

The post suggests there's PowerShell cmdlets you can use instead to do the same as the `control.exe` method but on a per-user basis instead. [You can find them here](https://docs.microsoft.com/powershell/module/internationalcmdlets).

If you're interested in pursuing the LXP and `control.exe` method then it might useful for you to know all the [Geo IDs](https://docs.microsoft.com/windows/win32/intl/table-of-geographical-locations) and [language / region IDs](https://docs.microsoft.com/windows-hardware/manufacture/desktop/available-language-packs-for-windows#language-packs) too, which sadly were also not mentioned in the blog. These are needed for modifying the XML.

Nonetheless the post gives you an example on how to install LXP during OSD and make it the default language for new users.

Let me show you what a system looks like after OSD installing only LXP.

To clarify what I did in my task sequence: I followed the process in the aforementioned Microsoft PFE blog by installing only LXP and kept the `Apply Windows settings` locale options to  en-us and used the `control.exe intl.cpl` method to change the users' default language.

When you see the screenshots of the TS at the end of this section, you may notice some minor differences e.g. local admin account instead of domain user account, and content-less scripts used instead of script files, etc. But generally, it's the same.

This is what it gave me:

[![screenshot](StoryBoard-LanguageExperiencePackUserExperience-beforestoreupdates-1.png)](StoryBoard-LanguageExperiencePackUserExperience-beforestoreupdates-1.png)

I'll list the notables:

* Start up, logon UI and first logon experience looks completely localized as fr-fr which is nice.
* Some parts of the Windows UI **are not** localized: start menu app shortcuts, the pre-populated text in the start menu search, and the text in the calendar pane.
* The Windows settings UI is partially localized. It may seem not localized in the image but in other areas of the settings I did see some translations, not many though. Also, you can see that the user can change back to "English (United States)" display language if they wanted to, which is nice.
* The InstallLanguage registry value remained unchanged as en-us! Score!
* PowerShell doesn't seem to be localized and `dism.exe` is a bit weird: some parts are English some parts are French.
* The Microsoft Store is not localized at all, but **there are a boat load of updates...**
* Remember when I mentioned I'll get to it about noticing a difference in translations before and after Store updates? OK so here's the difference of the exact same system as before, but I installed those boat load of updates from the Store:  
[![screenshot](StoryBoard-LanguageExperiencePackUserExperience-afterstoreupdates.png)](StoryBoard-LanguageExperiencePackUserExperience-afterstoreupdates.png)Click me
* Start up, logon UI and first logon experience looks no different: still localized.
* Several improvements to the Windows UI in the start menu and calendar pane.
* More or less the same mix of translations in the Windows settings UI.
* As expected, no change to the InstallLanguage registry value.
* Same experience with PowerShell and `dism.exe`.
* The Microsoft Store is now completely localized.

After all that, it's clear that LXPs live up to their expectation: partial translation.

Two big bonuses with using LXPs instead of LPs are:

* No InstallLanguage issue
* No issue at any point with the start menu search or any other general functions of Windows that I noticed

Looking at the previous image, if this level of localisation is good for you and your users, then 100% the LXP-only solution is for you. I totally recommend it and Microsoft do too. Microsoft want us to stop using LPs and start using LXPs.

However there's a problem if your users don't know the language of your base / primary language from install media (en-us in this scenario). For that reason, I can't quite understand how or why Microsoft want us to stop using LP and use LXP exclusively.

Then I thought, "maybe I need to install LP _and_ LXP, keep the `Apply Windows settings` locale option to match the language of the install media (en-us in this scenario, because we don't want the InstallLanguage issue) and then use the `control.exe intl.cpl` method to change the default user language. What happens then?"

[![screenshot](StoryBoard-LanguagePackAndLanguageExperiencePackUserExperience.png)](StoryBoard-LanguagePackAndLanguageExperiencePackUserExperience.png)Click me
Bingo. Everything is completely localized and we don't have the InstallLanguage issue! As a sanity check, I managed to IPU to 2004 using en-us media with no issues.
My task sequence steps in lab for that looks like the below. As I mentioned earlier, I tweaked some of the steps for the group "Set Default Language" compared to the PFE blog post.

[![screenshot](finalts-1-1024x861.jpg)](finalts-1.jpg)

[![screenshot](finalts-2-1024x861.jpg)](finalts-2.jpg)
[![screenshot](finalts-3-1024x862.jpg)](finalts-3.jpg)
[![screenshot](finalts-4-1024x861.jpg)](finalts-4.jpg)
[![screenshot](finalts-5-1024x861.jpg)](finalts-5.jpg)
[![screenshot](finalts-6.jpg)](finalts-6.jpg)
[![screenshot](finalts-7.jpg)](finalts-7.jpg)
[![screenshot](finalts-8-1024x861.jpg)](finalts-8.jpg)

Make sure that you set the local options of the `Apply Windows Settings` step to match that of the install media (en-us in this case). Equally the same is true if you use any of the [OSDWindowsSetings* task sequence variables](https://docs.microsoft.com/mem/configmgr/osd/understand/task-sequence-steps#BKMK_ApplyWindowsSettings).

The only drawback with this approach is that because we've installed a LP, we still need to reinstall the latest cumulative update because the start menu search is broken until you do that.

Again, if you run software updates step during OSD in your task sequence then this isn't going to be a big deal for you. I think this is a reasonable compromise if we get a fully localized system that doesn't cause us problems down the line when it comes to upgrading Windows 10. It also keeps the content capacity requirements low, since there's no need for an ISO for each language we want to support in our task sequence and therefore on your Distribution Points.

However if build time is important to you, or you just don't/can't install software updates during OSD, then your only option is offline servicing. This enables you to inject all languages items (LP, LXP and FoD, which we will get on to next) directly in to the WIM. Once complete, you load the new Operating System Image into ConfigMgr.

Something like [David Segura](https://twitter.com/seguraosd)'s fantastic [OSDBuilder](https://osdbuilder.osdeploy.com/) is a great example of a community tool for servicing WIMs offline. His posts on building a [Windows 10 MultiLang baseline with OSDBuilder](https://osdbuilder.osdeploy.com/docs/advanced/multilang-baseline) highlights the importance of not applying updates to your WIM before you install the LPs or LXPs. I recommend using the RTM version of any Windows 10 you're looking to service.

* * *

#### Update 2020-07-29 I've been able to reproduce a reported issue where if we install en-gb (LP + LXP) over en-us (as base language) using the guidelines in this blog post. You will see strange things immediately after OSD:

[![screenshot](2020-07-29_21-37-56-1024x870.jpg)](2020-07-29_21-37-56.jpg)

For me, this was cleared up after I prompted an update for the en-gb LXP from the Microsoft Store. Immediately too, no reboot necessary. This shouldn't be too much of a surprise because I have detailed this quirk in the post already. LXPs are serviced via the store and odd translation issues were resolved after applying updates for the LXP(s) from the Store.

However this is a little different because it's clearly broken.

Perhaps this might be an issue with the RTM version of the en-gb LXP in the ISO from MSDN/Visual Studio downloads. None the less it's addressed in updates from the Store.

This might be a good opportunity to at least explore the idea of trying to export an updated LXP from Microsoft Store for Business. I haven't tested this.
Failing that, maybe you would be happy with force installing Store updates at the end of OSD using this tidbit [I found on Reddit](https://www.reddit.com/r/PowerShell/comments/94ikpc/any_way_to_update_windows_store_apps_via/):

```powershell
Get-CimInstance -Namespace "Rootcimv2mdmdmmap" -ClassName "MDM_EnterpriseModernAppManagement_AppManagement01" | Invoke-CimMethod -MethodName UpdateScanMethod
```
 
* * *

OK, we now have a task sequence which resolves most of the biggest issues with Windows 10 multi language OSD. What else should you be interested about? FoDs!

### Features on Demand

FoDs complete the user experience for languages on Windows 10. They give users Windows 10 features such as handwriting recognition, speech recognition, fonts, OCR and text to speech (and many more) in their desired language.
[Following the order of installation advice](https://docs.microsoft.com/windows-hardware/manufacture/desktop/features-on-demand-language-fod), remember FoDs must be installed after a LP.
Like LPs and LXPs, you can grab an ISO of FoDs for Windows 10 from VLSC or your MSDN / Visual Studio Subscription download page.

[![screenshot](foddownloadmsdn-1-1024x294.jpg)](foddownloadmsdn-1-scaled.jpg)
Part 1 is what you want, Part 2 contains content for retail store demo units.
It's worth pointing out that Microsoft don't offer FoDs for every language and weirdly provide a spreadsheet detailing which FoDs you should use for your desired target language. [Here's the link to the page](https://docs.microsoft.com/windows-hardware/manufacture/desktop/features-on-demand-language-fod) which links to the spreadsheet, and [here's the direct link to the spreadsheet](https://download.microsoft.com/download/7/6/0/7600F9DC-C296-4CF8-B92A-2D85BAFBD5D2/Windows-10-1809-FOD-to-LP-Mapping-Table.xlsx) which works at the time of writing this.

FoDs come in two types: with satellite packages and without satellite packages.

* **FoDs with satellite packages:** come with language and architecture elements in independent packages.
* **FoDs without satellite packages:** come with language and architecture elements bundled into one package.

Looking at the below screenshot which are the contents of the Part 1 FoD ISO, you can see how satellite and non-satellite FoDs differ by looking at them on disk based on naming convention and file size.

[![screenshot](fodsondisk-1024x272.jpg)](fodsondisk.jpg)Showing satellite and non-satellite FoD differences on disk
After OSD using the method I shared last (with LP + LXP but keeping `Apply Windows settings` the same as the install media), even the most "basic" language-focused FoDs are not installed.
The basic language-focused FoDs I'm referring to are the following:

* `Microsoft-Windows-LanguageFeatures-Basic-*`
* `Microsoft-Windows-LanguageFeatures-Handwriting-*`
* `Microsoft-Windows-LanguageFeatures-OCR-*`
* `Microsoft-Windows-LanguageFeatures-Speech-*`
* `Microsoft-Windows-LanguageFeatures-TextToSpeech-*`

I recommend you at least install these FoDs in your task sequence too.
You'll quickly get fed up with the process of downloading the ISO and grabbing all the FoDs you need for each new version of Windows 10, though. You've got to walk through a dozen folders, twice, for both LXP and FoD ISOs.
To help with that, I wrote some functions included in the [PSCMWin10Language](https://github.com/codaamok/PSCMWin10Language) module.
For more information on how to use these functions to build out LP, LXP and FoD repositories, [check out this blog post I also wrote](https://sysmansquad.com/2020/06/08/deploy-languages-via-software-center-with-pscmwin10language/).

* `New-LPRepository`
* Copy out only the Language Packs you want from the Language Pack ISO
* `New-LXPRepository`
* Copy out only the folders of the languages you want from the Language Experience Pack ISO
* `New-FoDLanguageFeaturesRepository`
* CopyoutonlythelanguagesyouwantoftheFeaturesonDemandLanguageFeaturesBasic,Handwriting,OCR,SpeechandTextToSpeechfromFeaturesonDemandISO

In my task sequence, I added the install FoD step to look like this:

[![screenshot](finalts-fodstep.jpg)](finalts-fodstep.jpg)Example step to install FoD

## Make new languages available via the Software Center

Take the scenario where you have a built machine already given to a user, however some time later that user (or another user) wants to change language. What are your options to change localisation after OSD?
You've probably noticed a user can install their own languages from the Settings UI or from the Store. However in both cases these are just LXPs - the user will only have a partially localized experienced after applying this.
[Check out this blog post I wrote](https://sysmansquad.com/2020/06/08/deploy-languages-via-software-center-with-pscmwin10language/), where I show you how to use my PowerShell module [PSCMWin10Language](https://github.com/codaamok/PSCMWin10Language) to create LP, LXP and FoD repositories and create ConfigMgr Applications using those repositories to deploy via the Software Center.

## Windows 10 2004 improvements to languages

I keep bringing up this Ignite session but it truly was amazing.

* [SolvingWindows10featureupdatesinamultilingualdeployment](https://www.youtube.com/watch?v=ZhL0AO8Cnig&ab_channel=MicrosoftIgnite) - Sudhagar Thirumoolan ([@sudhagart](https://twitter.com/sudhagart?lang=en))

We're promised some very key changes in Windows 10 2004: being able to configure system and user preferred languages. This gives us the completely localized experience on Windows 10, without being fussy with what we populate in the unattend.xml answer file other than the target language. And most importantly, no more InstallLanguage issue!

Timing is perfect because Michael Niehaus (former Principal Program Manager at Microsoft) [just posted an excellent blog](https://oofhours.com/2020/06/01/new-in-windows-10-2004-better-language-handling/) which discusses these new 2004 changes in more detail.

The upshot of the new changes in 2004 is: you can use en-us installation media, apply (for example) fr-fr LP, and update `Apply Windows Settings` to be French instead of English. Lo and behold, a French system with no more InstallLanguage issue!
This way, we can ditch the hacky `control.exe intl.cpl` method to change default user language.
I recommend you to still consider including LXPs in your task sequence, though, even if your target language is one of the 38 base languages. Just in case Microsoft push out some improved translations to UI.

My only gripe, still, is that there's still a remark in there about pushing to use LXP instead of LP, which I still don't understand or agree with. However, nonetheless, this is a hugely welcomed improvement.

## Closing thoughts

As I've mentioned, Microsoft want us to get away from using LP and instead use LXP, but I don't see how that's possible. If the partial translation of LXPs is good enough for your users, then I totally agree with that recommendation. But I'd imagine most users might need a totally translated experience for Windows 10, in which case you still need the LP in there.
Before Microsoft announced the 2004 improvements to the system and user default languages, the tone of this blog post would have been very different. However they've finally delivered on a solution by listening to our pain, which is excellent.
If you have any questions about any of this, don't hesitate to comment or ping me on Twitter ([@codaamok](https://twitter.com/codaamok)). Thanks for reading if you made it this far!
