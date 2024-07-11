---
title: Un-Syncing SharePoint Libraries through PowerShell
author: Kevin Crouch
type: post
date: -001-11-30T00:00:00+00:00
draft: true
categories:
  - Endpoint Management

---
Install-Module Onedrive-Client

Get-ODClients | Get-ODSyncedLibraryConfig | where {$_.SiteName -like "OldTeam*"} | Remove-ODSyncedItemConfig

[PowerShell Gallery | Onedrive-client 0.2.2](https://www.powershellgallery.com/packages/Onedrive-client/0.2.2)

