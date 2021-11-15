---
title: Microsoft Teams Cache, a burden to us all
author: BeholdenCypress
type: post
date: 2021-11-12T02:10:08+00:00
url: /2021/11/11/microsoft-teams-cache-a-burden-to-us-all/
categories:
  - Endpoint Management
tags:
  - Microsoft
  - Microsoft Teams
  - Teams

---
Microsoft Teams Cache, we've all been there in the last year and a half. Microsoft Teams is working fine, then it's not. What happened? I restarted Teams and it's still acting weird.

Well, Teams is an interesting app when it comes to its cache. It relies heavily on it. I personally do not know all the ins and outs of the Teams cache, but I too know all too well that it is a pain in the butt when it goes awry.

This leads me to the bread and butter of this blog post. The following is a small script that at the end can be deployed through ConfigMan as a normal application in Software Center, that when run, will clear the Microsoft Teams Cache on a user's computer.

## Microsoft Teams Cache Clearing Script

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;ClearTeamsCache.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Write-Output "Killing Microsoft Teams process"
Stop-Process -Name Teams -Force -erroraction 'silentlycontinue'
Start-Sleep -seconds 5
Write-Output "Killing Microsoft Outlook process"
Stop-Process -Name Outlook -Force -erroraction 'silentlycontinue'
Start-Sleep -seconds 5
Write-Output "Clearing Microsoft Teams Cache"
Remove-Item -Path "$($env:USERPROFILE)\Appdata\Roaming\Microsoft\Teams" -Recurse -Force
Start-Sleep -seconds 5  #Probably not required, just makes sure all files are deleted before relaunching Teams and Outlook.
Write-Output "Restarting Microsoft Teams and Microsoft Outlook"
Start-Process -FilePath "$($env:LOCALAPPDATA)\Microsoft\Teams\Update.exe" -ArgumentList "--processStart Teams.exe"
Start-Process Outlook
</pre>
</div>

If you are reading this blog post, then you are probably at least somewhat familiar with PowerShell, but nevertheless, let's just go through this cute little PowerShell script right quick

Since this is a script where the output will be presented to the user (at least in the way I did it, you can choose to forgo that part if you wish), I have used the `<strong>Write-Output</strong>` so the user knows what is happening.

So this script kills the Teams Process and kills the Outlook process (because Outlook has a Teams plugin). There is a `<strong>Start-Sleep</strong>` between them because I have seen weird things where even when you kill the Teams process, it likes to hold on to files for a couple of seconds after the process has ended. All the Start-Sleeps are for is to give a couple of seconds for all the hooks on the files to be closed.

Once Teams and Outlook are closed, the entire Teams folder located at `<strong>$($env:USERPROFILE)\Appdata\Roaming\Microsoft\Teams"</strong>` gets removed from the system. This is not the "official" way to clear the cache in teams, but this is the most effective way, or what I like to call the "big hammer method" way.

It then does another Start-Sleep just to make sure there are no pending hooks in the file system, then it relaunches the Teams process and the Outlook Process.

Notice the `<strong>-ArgumentList "--processStart Teams.exe"</strong>` on the Teams command line. This is extremely important. Without this, Teams will not launch. Also, make sure the p in Process is lower case. Ask me how I know.

## Creating the Executable

That takes care of the script portion of this blog post. Next, we need to encapsulate this PowerShell script in an EXE. For this, I used a module in PSGallery called <a href="https://www.powershellgallery.com/packages/ps2exe/1.0.4" target="_blank" rel="noreferrer noopener">PS2EXE</a>. This module is so simple to use, it's almost criminal.

It is literally a simple as:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;PS2EXE&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS2EXE "ClearTeamsCache.ps1" "ClearTeamsCache.exe"</pre>
</div>

That is the simplest form you can do. There are a bunch of other switches you can do to add other information like Company Name, Version, Author, etc.

### Caveats

One caveat to this is that the EXE and the PS1 file **_<span style="text-decoration: underline">must</span>_** remain in the same directory with each other. Think of the EXE as basically a shortcut for the PS1 file, but still functions as a normal EXE.

The other caveat to keep in mind is that some AV solutions will falsely identify your newly created EXE as malicious since a lot of malware use this same method. From what I have seen, Defender does not detect this as malicious (in my environment at least). I don't know how you could get around this other than add the install location as an exclusion in your AV.

### Packaging

Alright. Once you have your PS1 and your EXE created, now all you need to do is package it up to install it on a computer. You can do this in whichever way you are comfortable, and whichever way ConfigMan or InTune will accept. I am lucky to have access to InstallShield, so I went that way. But you can just as easily use a PowerShell script or a Batch script to install this program and use the EXE version number as your detection method (if you go this way, I highly recommend using the version switch in PS2EXE when creating your EXE).

Whichever way you decide to package up your EXE and PS1 for install, just make sure it works through ConfigMan and InTune (if you go that route, you can also just stick this in a folder somewhere and create a shortcut for the EXE on your desktop).

## Conclusion

If you implement this as I have described, when a user runs this, they will be presented with a PowerShell window that says:<figure class="wp-block-image size-large">

<img loading="lazy" width="495" height="151" src="https://sysmansquad.com/wp-content/uploads/2021/11/ClearTeamsCache.png" alt="" class="wp-image-3049" srcset="https:/wp-content/uploads/2021/11/ClearTeamsCache.png 495w, https:/wp-content/uploads/2021/11/ClearTeamsCache-300x92.png 300w, https:/wp-content/uploads/2021/11/ClearTeamsCache-100x31.png 100w" sizes="(max-width: 495px) 100vw, 495px" /> <figcaption>Clear Teams Cache results window</figcaption></figure> 

And here is the Icon I made for my application if you want it. You can also make your own fairly easily if you wish.

<div class="wp-block-file">
  <a href="https://sysmansquad.com/wp-content/uploads/2021/11/ClearTeamsCacheIcon.ico">ClearTeamsCacheIcon</a><a href="https://sysmansquad.com/wp-content/uploads/2021/11/ClearTeamsCacheIcon.ico" class="wp-block-file__button" download>Download</a>
</div>

That should be it. You should now have a fully functioning "program" to clear the Microsoft Teams Cache on a computer.