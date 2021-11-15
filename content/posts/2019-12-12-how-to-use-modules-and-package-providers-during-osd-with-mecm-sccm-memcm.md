---
title: How to use modules and package providers during OSD with MECM (SCCM/MEMCM)
author: Jake Shackelford
type: post
date: 2019-12-12T15:53:40+00:00
url: /2019/12/12/how-to-use-modules-and-package-providers-during-osd-with-mecm-sccm-memcm/
pm_content_access_group:
  - all
uagb_style_timestamp-js:
  - 1580332074
uag_style_timestamp-js:
  - 1591645893
categories:
  - Powershell
  - Scripting

---
![PowerShell_5.0_icon-1.png](PowerShell_5.0_icon-1.png)

For the past few days, I've been implementing SnipeIT into our environment to start actually tracking assets as opposed to the archaic spreadsheet we had going. I wanted to add any new machine that were imaged into the database right away without any input from me. That way, all I had to do was assign a user to the device in the asset management portal for SnipeIT, and I was good to go. However, this proved to be quite the headache for me. Special thanks to Christopher Kibble, Colin Wilkins, and Adam Gross for all their support and helping me learn some PS along the way (I'm still a noob).

### It's easier than it sounds!

I've used many PowerShell scripts during OSD In the past and thanks to the recent changes, where you can just paste a script into a task sequence, it's become even easier! With this in mind, I created a script and tested it on my dev machine and a few others, and everything looked great. They ran in the SYSTEM context fine, as an admin fine, all looked dandy. I put it into my OSD, and it returned successful but never actually showed up into my asset management system. After trying everything under the sun including placement of the script during OSD, turning it into an application, making it a package, etc. I just could not get it to work during OSD. I was about ready to give in but was thinking maybe it's an issue with installing the modules and package providers (It was).

### How to get those lovely modules and packages during OSD.

In my use case, I already had the module and package provider I needed installed to my machine.

You can find the modules you need at `$env:ProgramFiles\WindowsPowerShell\Modules` assuming you have them installed on your machine.

You can find PackageProviders at `$env:ProgramFiles\PackageManagement\ProviderAssemblies` also assuming you have them installed on your machine.

I copied the WindowsPowerShell folder and the PacakageManagement folders to a new folder on my SCCM server

In my case, my folder structure for the entire package looks like so:

![Imgur2](https://camo.githubusercontent.com/ec9b5904e323575dc980183eb46dc07aed204989/68747470733a2f2f696d6775722e636f6d2f37656a7339526f2e6a7067)

Once we have these two folders in a folder on our SCCM, we can create a package.

Now please forgive me for my terrible PS skills I'm working on improving them!

Create a script in the same folder you put PackageManagemet and WindowsPowerShell that looks like the following

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">$executingScriptDirectory = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent

copy-item $executingScriptDirectory\PackageManagement $env:ProgramFiles -force -Recurse

copy-item $executingScriptDirectory\WindowsPowershell $env:ProgramFiles -force -Recurse</pre>
</div>

In my case, I called this script **MoveItems.ps1**

Once you have this complete create a package with all the content.

In your OSD task Sequence create a run PowerShell script step and reference the package you made like so

![Imgur3](https://camo.githubusercontent.com/17cb3f713d11be996213630ba822f8b005cb446b/68747470733a2f2f696d6775722e636f6d2f6f4f43627857442e6a7067)

Next, in your original script that's failing to run, you'll want to IMPORT those modules or packageproviders as opposed to installing them since you now have the content copied to that local machine. In my case the code looks like so: (This will look different depending on the modules you are trying to import)

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Import-Module -Name $env:ProgramFiles\WindowsPowerShell\Modules\SnipeitPS -Verbose

Import-PackageProvider -Name "Nuget" -Verbose</pre>
</div>

Add another Run PowerShell script to your task sequence and reference your script with the newly added Import commands and you should be good to go! Don't forget to update your distribution point for the package you created!

If anyone is interested in the actual SnipeIT script feel free to come to the [WinAdmins](https://aka.ms/winadmins) discord and send me a message!



