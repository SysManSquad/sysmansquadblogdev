---
title: Updating Dell Drivers During Autopilot
author: Jóhannes Geir Kristjánsson
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=2984
categories:
  - Endpoint Management

---
lol

## The Problem



## The Script

Im using the [Powershell Application toolkit](https://psappdeploytoolkit.com/) for this, a toolkit i highly recommend

In the Pre-installation task area

Don't forget to download the latest [Dell Command Update](https://www.dell.com/support/kbdoc/en-us/000177325/dell-command-update) and make the needed changes on line 12 if needed

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{"mode":"powershell","mime":"application/x-powershell","theme":"default","lineNumbers":true,"styleActiveLine":true,"lineWrapping":true,"readOnly":false,"fileName":"Pre-Installation\u00a0tasks","language":"PowerShell","modeName":"powershell"}">		# check if Dell command update is installed
		# the reason for the wildcard is because there are two versions of DCU available
		# one is a UWP app, called "Dell Command | Update for Windows 10" 
		# the other is a win32 app called "Dell Command | Update"

		$DCU = Get-InstalledApplication -Name "Dell Command * update*" -WildCard


		# if dell command update is missing, we install it
        # you can tell im using VS code to write this
		if ($null -eq $dcu){
			Execute-Process -Path "$dirFiles\Dell-Command-Update-Application_8D5MC_WIN_4.3.0_A00.EXE" -Parameters "/s"
			Write-Log "installed Dell Command Update 4.3"
		}</pre>
</div>

In the Installation task area

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{"mode":"powershell","mime":"application/x-powershell","theme":"default","lineNumbers":true,"styleActiveLine":true,"lineWrapping":true,"readOnly":false,"fileName":"Installation task","language":"PowerShell","modeName":"powershell"}">        # success is more likely when you have the correct path to the dcu-cli.exe
        $dcupath = $dcu.InstallLocation + "dcu-cli.exe"

        # disabling reboots, i don't want one during autopilot
        # and i don't care if a driver fails to install, so im igoring exit code 1
		Execute-Process -Path $dcupath -Parameters "/applyupdates -reboot=disable -IgnoreExitCodes 1"</pre>
</div>

And finally in the post-installation area  


<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{"mode":"powershell","mime":"application/x-powershell","theme":"default","lineNumbers":true,"styleActiveLine":true,"lineWrapping":true,"readOnly":false,"fileName":"Post-installation","language":"PowerShell","modeName":"powershell"}">        # we might not have installed anything, we just executed a service
        # win32 apps need a detection, so lets up make one up
		Set-RegistryKey -Key 'HKEY_LOCAL_MACHINE\SOFTWARE\Dell' -Name 'Autopilot-run' -Type 'Dword' -Value '1'</pre>
</div>

## Dynamic Groups

Relying on a Dynamic Azure AD group that queries for Dell devices isn't going to work in this scenario. The Evaluation of the membership is simply far too slow for a brand new devices going through autopilot.

You could target the dynamic group that queries for the autopilot grouptag. But you might be buying hardware from several OEMs, we don't want to install dell tools on lenovos. So we will use the new [filter feature](https://docs.microsoft.com/en-us/mem/intune/fundamentals/filters)!  
Simply create a new filter using the example query below

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{"mode":"powershell","mime":"application/x-powershell","theme":"default","lineNumbers":true,"styleActiveLine":true,"lineWrapping":true,"readOnly":false,"fileName":"Filter","language":"PowerShell","modeName":"powershell"}">(device.manufacturer -contains "Dell") and (device.deviceOwnership -eq "Corporate")</pre>
</div>

and add it to the application assignment

## Existing Devices

You might not want to cause a sudden driver installation on your existing devices, a quick script takes care of that. Just make sure to deploy this to your devices well ahead of putting the autopilot solution into production.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{"mode":"powershell","mime":"application/x-powershell","theme":"default","lineNumbers":true,"styleActiveLine":true,"lineWrapping":true,"readOnly":false,"fileName":"shell.ps1","language":"PowerShell","modeName":"powershell"}"># Reg2CI (c) 2021 by Roger Zander
# https://reg2ps.azurewebsites.net/
if((Test-Path -LiteralPath "HKLM:\SOFTWARE\Dell") -ne $true) {  New-Item "HKLM:\SOFTWARE\Dell" -force -ea SilentlyContinue };
New-ItemProperty -LiteralPath 'HKLM:\SOFTWARE\Dell' -Name 'Autopilot-run' -Value 1 -PropertyType DWord -Force -ea SilentlyContinue;</pre>
</div>

<figure class="wp-block-image size-large">

![](vmconnect_YSACp0qsPD.png) </figure> 

## Deploying

don't forget the ESP!
