---
title: Retrieving additional details for AutoPilot in MS Graph
author: Adam Gell
type: post
date: -001-11-30T00:00:00+00:00
draft: true
categories:
  - Endpoint Management

---
 

I had a member in the [Windows Admin](http://discord.gg/winadmins) ask a question in the #Intune channel the other day. The question was how do I find AutoPilot registered devices when there is no unique serial number and have the Azure AD guid. 

I started poking around the MS Graph API's directly until it dawned on my someone else has already solved this problem. There is a module on the PowerShell Gallery called, [WindowsAutoPilotIntune][2].

We are going to talk about how to use this module to retrieve additional details and hunt for that one device you need to modify. 

Open an elevated PowerShell prompt and run

`Install-Module -Name WindowsAutoPilotIntune`

You should also make sure you have the official MS Graph module installed as well. 

`Install-Module -Name Microsoft.Graph.Intune`

To check if they are installed run the follow cmd. 

`Get-module -ListAvailable | ?{ $_.Name -eq "WindowsAutoPilotIntune" -or $_.Name -eq "Microsoft.Graph.Intune"}`<figure class="wp-block-image size-large">

![](image-1024x157.png) </figure> 

Since the pre-requirements are out of the way. Let's retrieve some additional Autopilot details.  


First we want to make a connection to the Graph API. You should also make sure to have some devices already registered in Intune and AutoPilot. 

I am going to show you how to take an Azure AD device ID and pull up the AutoPilot device.

{{insert image}}

 
 [2]: https://www.powershellgallery.com/packages/WindowsAutoPilotIntune/5.0
