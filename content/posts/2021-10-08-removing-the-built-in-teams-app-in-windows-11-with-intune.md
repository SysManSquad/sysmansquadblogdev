---
title: Removing The Built-in Teams App in Windows 11 with Intune
author: Jóhannes Geir Kristjánsson
type: post
date: 2021-10-08T13:59:21+00:00
url: /2021/10/08/removing-the-built-in-teams-app-in-windows-11-with-intune/
categories:
  - Endpoint Management
  - Intune
  - Proactive Remediation
tags:
  - Intune
  - Proactive Remediations
  - windows11

---
## Intro

So you've started rolling out Windows 11 to your endpoints, and your users got confused and upset over the consumer teams apps that is installed? Understandably you wish to do something about this.<figure class="wp-block-image size-large">

<img loading="lazy" width="568" height="105" src="https://sysmansquad.com/wp-content/uploads/2021/09/vmconnect_HKVrTs61hf.png" alt="" class="wp-image-3000" srcset="https:/wp-content/uploads/2021/09/vmconnect_HKVrTs61hf.png 568w, https:/wp-content/uploads/2021/09/vmconnect_HKVrTs61hf-300x55.png 300w, https:/wp-content/uploads/2021/09/vmconnect_HKVrTs61hf-100x18.png 100w" sizes="(max-width: 568px) 100vw, 568px" /> <figcaption>(╯°□°）╯︵ ┻━┻</figcaption></figure> 

No worries mate, Intune Proactive Remediations to the rescue!

## The Solution

The code below fixes two things.

It removes the chat by writing the registry key that disables it<figure class="wp-block-image size-large">

<img loading="lazy" width="827" height="115" src="https://sysmansquad.com/wp-content/uploads/2021/09/vmconnect_GJk3LXz1EF.png" alt="" class="wp-image-3002" srcset="https:/wp-content/uploads/2021/09/vmconnect_GJk3LXz1EF.png 827w, https:/wp-content/uploads/2021/09/vmconnect_GJk3LXz1EF-300x42.png 300w, https:/wp-content/uploads/2021/09/vmconnect_GJk3LXz1EF-768x107.png 768w, https:/wp-content/uploads/2021/09/vmconnect_GJk3LXz1EF-100x14.png 100w" sizes="(max-width: 827px) 100vw, 827px" /> <figcaption>the TaskbarMn DWORD controls this</figcaption></figure> 

Then it simply uninstalls the appx package for the consumer teams app, note that this has no effect on the regular teams app. The two are completely different.

## Code

Pretty simple stuff, 

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Detection.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># Detection
try {

    # check the reg key for the taskbar teams app icon
    # Reg2CI (c) 2021 by Roger Zander
    if ( (Get-ItemPropertyValue -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name 'TaskbarMn' -ErrorAction Stop ) -eq 0 ) { $RegCompliance = $true }
    else { $RegCompliance = $false } 

    # check if the teams app is installed
    if ($null -eq (Get-AppxPackage -Name MicrosoftTeams) ) { $AppCompliance = $true }
    else { $AppCompliance = $false }
    
    # evaluate the compliance
    if ($RegCompliance -and $AppCompliance -eq $true) {

        Write-Host "Success, app/reg removed"
        exit 0
    }
    else {
        Write-Host "Failure, app/reg detected"
        exit 1
    }
   
    
}
catch {
    $errMsg = _.Exception.Message
    Write-Host $errMsg
    exit 1
}</pre>
</div>

Here is the remediation code, parts of it were made using the <a href="https://reg2ps.azurewebsites.net/" target="_blank" rel="noreferrer noopener">reg2ps website</a> which i highly recommend.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Remediation.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}"># Remediation

try {

    # remove the taskbar icon
    # Reg2CI (c) 2021 by Roger Zander
    if ((Test-Path -LiteralPath "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced") -ne $true) {
        New-Item "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced" -Force -ErrorAction Stop 
    }
    New-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced' -Name 'TaskbarMn' -Value 0 -PropertyType DWord -Force -ErrorAction Stop
    

    # uninstall the teams consumer app
    Get-AppxPackage -Name MicrosoftTeams | Remove-AppxPackage -ErrorAction stop

    # as nothing errored out, we will report success
    Write-Host "Success, regkey set and app uninstalled"
    exit 0
}

catch {
    $errMsg = _.Exception.Message
    Write-Host $errMsg
    exit 1
}</pre>
</div>

## Setting it up

Go to the <a href="https://endpoint.microsoft.com/#blade/Microsoft_Intune_Enrollment/UXAnalyticsMenu/proactiveRemediations" target="_blank" rel="noreferrer noopener">Proactive Remediations blade</a> in the Intune admin portal, create a new PR and add the detection and remediation scripts, configure the PR to run in user context and 64bit, and deploy accordingly.<figure class="wp-block-image size-large">

<img loading="lazy" width="515" height="185" src="https://sysmansquad.com/wp-content/uploads/2021/09/WindowsSandboxClient_EZVCQZGC8M.png" alt="" class="wp-image-3003" srcset="https:/wp-content/uploads/2021/09/WindowsSandboxClient_EZVCQZGC8M.png 515w, https:/wp-content/uploads/2021/09/WindowsSandboxClient_EZVCQZGC8M-300x108.png 300w, https:/wp-content/uploads/2021/09/WindowsSandboxClient_EZVCQZGC8M-100x36.png 100w" sizes="(max-width: 515px) 100vw, 515px" /> </figure> 

Once the Remediation has run on the targeted endpoints, your users will be happier and slightly less confused.<figure class="wp-block-image size-large">

<img loading="lazy" width="568" height="105" src="https://sysmansquad.com/wp-content/uploads/2021/09/j4sLKefuYe.png" alt="" class="wp-image-2999" srcset="https:/wp-content/uploads/2021/09/j4sLKefuYe.png 568w, https:/wp-content/uploads/2021/09/j4sLKefuYe-300x55.png 300w, https:/wp-content/uploads/2021/09/j4sLKefuYe-100x18.png 100w" sizes="(max-width: 568px) 100vw, 568px" /> <figcaption>┳━┳ ノ( ゜-゜ノ)</figcaption></figure>