---
title: Intune/Autopilot Proactive Remediation
author: Jake Shackelford
type: post
date: 2020-07-07T16:24:57+00:00
url: /2020/07/07/intune-autopilot-proactive-remediation/
featured_image: /wp-content/uploads/2020/06/msedge_OGHmAQhYGe.png
categories:
  - Documentation
  - Endpoint Management
  - How-To
  - Intune
  - Microsoft
  - Powershell
  - Proactive Remediation
  - Scripting
  - Windows
tags:
  - Proactive Remediations

---
### What is Proactive Remediation?

Proactive remediations are a pair of scripts used to detect and remediate a problem on a machine. The first script runs a query on your endpoints that returns an exit code of success or failure. We call this first script the detection script. On a successful exit code it is reported as "Without issue" in the Intune portal and nothing else is executed. On a failed exit code the second script is run which is called a remediation script. This script will "fix" in theory whatever you detected in your first script so the next time the detection script is run it returns successful. In the event the Intune portal reports a "Failed" status you have some detection or remediation logic failing. We will go over examples of both detection and remediation scripts to help alleviate that.<figure class="wp-block-image size-large">

![](https://sysmansquad.com/wp-content/uploads/2020/06/msedge_OGHmAQhYGe-1024x448.png) <figcaption>Example of a proactive remediation graph in the Intune Portal</figcaption></figure> 

If you're familiar with SCCM/MECM/MEMCM/SMS or whatever acronym you want to give Configuration Manager, proactive remediation is in essence the equivalent of configuration items and baselines. 

### How do we get started?

  1. Head over to the [Microsoft Endpoint Manager admin center](https://endpoint.microsoft.com/) 
  2. Select **Reports** under Favorites
  3. Select **Endpoint Analytics** under Analytics
  4. Select **Proactive remediations**

You'll notice by default we have two Script Packages that Microsoft authored. After we create our detection and remediation script we will create a script package so let's get cracking on that! 

### First we need to create a Detection script

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Detection.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">try{
    if (Get-VpnConnection -AllUserConnection -Name "VPN" -ErrorAction Stop)
    {
        write-host "Success"
    	exit 0  
    }
  
}
catch{
    $errMsg = $_.Exception.Message
    write-host $errMsg
    exit 1
}</pre>
</div>

The above detection script is the generic format you should use for detection logic. You'll notice it's a simple try-catch. In this script we are checking to see if a VPN connection exists. You can make these detection scripts as robust as you'd like but for this scenario we are making it simplistic. You can copy the above and simply change Line 2 to whatever you'd like to test. I would STRONGLY encourage you to include the **-ErrorAction Stop** section as not all PowerShell cmdlets exit without throwing the cmdlet error, and this will ensure that they exit with the proper exit codes you define. On a exit code of 0 it's reported as "Without Issues" in the portal. Nothing else will happen and the detection script will run again at the scheduled time. In the event an Exit code of 1 is thrown the remediation script will run. If no exit code is thrown the detection script will report as Failed and you'll need to adjust the script. As an example on the above script if you remove the **-ErrorAction Stop** section the detection fails because Get-VPNConnection doesn't throw the correct cmdlet error which results in the exit code not being defined. 

If you'd like to read more on error handling and exceptions Kevin Marquette has a fantastic blog on it. [https://powershellexplained.com/2017-04-10-Powershell-exceptions-everything-you-ever-wanted-to-know/#trycatch](https://powershellexplained.com/2017-04-10-Powershell-exceptions-everything-you-ever-wanted-to-know/#trycatch)

### Next lets make a remediation script

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Remediation.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">try{
    Add-VpnConnection -Name "VPN" -ServerAddress "VPN.Contoso.loc" -TunnelType L2TP -L2tpPsk "SecretPassword" -Force -AuthenticationMethod PAP -RememberCredential -AllUserConnection -ErrorAction Stop
    exit 0
}
catch{
    $errMsg = $_.Exception.Message
    Write-host $errMsg
    exit 1
}</pre>
</div>

The above remediation script, just like the detection script, is a try-catch. You'll see that I add The VPN connection and in the event of a failure it writes to the host what the error was. This is going to be important for diagnosing why your script fails if it does. This is included in both the detection and remediation scripts I've shown. Much like the detection script feel free to change Line 2 to whatever you'd like and expand upon it.

### Creating a script package

  1. On the Proactive Remediations tab (Go back to How do we get started section if you don't see this) Select **Create a Script Package**
  2. Add a friendly name and a description if desired
  3. Select **Next**
  4. Copy your Detection and Remediation scripts and add them to the respective field
  5. Some scripts may need to be run using the "Run this script using the logged on credentials" option, or "Run script in 64 bit PowerShell", depending on how your detection and remediation works. In our example, neither need to be enabled.  
  
![](https://sysmansquad.com/wp-content/uploads/2020/06/msedge_Pm7pXyDNrT.png) 
  6. Select **Next**
  7. Select your assignment group 
  8. By default it will schedule to run daily, you can edit this to be Once, Hourly, or Daily![](https://sysmansquad.com/wp-content/uploads/2020/06/msedge_dZOZmuqnCB.png)
  9. Select **Next**
 10. Review your settings and then hit **Create**

Now in proper Intune fashion wait a few hours and your devices should start reporting. 

### Run into a failure? 

In the event you have failures, you can see why they failed by doing the following:

  1. Go to your script package
  2. Select **Device Status**
  3. Select **Columns** 
  4. Turn on all the options and hit **Apply**. This will show you the output of the scripts which should include the error code and exception message thanks to our try-catch in the detection and remediation scripts  
![](https://sysmansquad.com/wp-content/uploads/2020/06/msedge_UJCXFijoRN.png) 
  5. Check the respective field for where the error occurred and you should be able to diagnose why the failure happened

### Other issues?

If you run into any other issues or have questions about anything Intune head over to the [WinAdmins discord community](http://aka.ms/winadmins) and go to the #Intune channel.
