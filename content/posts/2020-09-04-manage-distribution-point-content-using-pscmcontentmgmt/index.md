---
title: Manage Distribution Point Content Using PSCMContentMgmt
author: acc
type: post
date: 2020-09-04T21:59:36+00:00
url: /2020/09/04/manage-distribution-point-content-using-pscmcontentmgmt/
categories:
  - Endpoint Management
  - MECM/MEMCM/SCCM
  - Powershell
  - Scripting
tags:
  - Distribution Point
  - PowerShell Module

---
                                        
## Introduction

I recently wrote [PSCMContentMgmt](https://github.com/codaamok/PSCMContentMgmt) which provides a simple and effective workflow for managing your MEMCM distribution points. Here are some of the things you can do with it:

* Query content objects which are distributed to distribution point(s) or distribution point group(s)
* Compare content objects distributed to distribution point(s) or distribution point group(s)
* Find content objects in a "distribution failed" state for all or selective distribution points
* Remove, distribute or redistribute content objects returned by any function to distribution point(s)
* Find an object in your site by searching on any arbitrary ID (useful when reading logs and want to know what object an ID resolves to)
* Migrate a distribution point's content to a new/different distribution point by exporting its content library to prestaged .pkgx files and importing the .pkgx files to the new distribution point
* Invoke the ContentLibraryCleanup.exe tool

PSCMContentMgmt is a mix of being no more than a wrapper for MEMCM cmdlets or native binaries. Some functions query WMI or invoke WMI methods.

PSCMContentMgmt does not intend to reinvent the wheel from already available cmdlets. Instead it provides a simpler workflow for managing your distribution points by offering:

* Easy to use pipeline support, so you can easily progress through the motions for tasks such as querying content on a distribution point or distribution point group - perhaps in a particular state (e.g. "distribution failed") - and distributing, redistributing or removing it from another (or the same) distribution point or distribution point group.
* Consistent property names when dealing with different types of content objects, i.e. the ObjectID property is always PackageID except for Applications/Deployment Types where it is CI_ID (same is true for the -ObjectID parameter on functions that offer it).
* Functionality which the Configuration Manager console does not provide e.g. content redistribution or import .pkgx files.
  
At the time of writing this, here are a list of functions in PSCMContentMgmt (be sure to check out the docs on the [GitHub repository](https://github.com/codaamok/PSCMContentMgmt) in case there are changes):

* [Find-CMObject](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Find-CMOBject.md)
* [Compare-DPContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Compare-DPContent.md)
* [Compare-DPGroupContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Compare-DPGroupContent.md)
* [Export-DPContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Export-DPContent.md)
* [Get-DP](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DP.md)
* [Get-DPContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPContent.md)
* [Get-DPDistributionStatus](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPDistributionStatus.md)
* [Get-DPGroup](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPGroup.md)
* [Get-DPGroupContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPGroupContent.md)
* [Import-DPContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Import-DPContent.md)
* [Invoke-DPContentLibraryCleanup](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Invoke-DPContentLibraryCleanup.md)
* [Remove-DPContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Remove-DPContent.md)
* [Remove-DPGroupContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Remove-DPGroupContent.md)
* [Set-DPAllowPrestagedContent](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Set-DPAllowPrestagedContent.md)
* [Start-DPContentDistribution](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPContentDistribution.md)
* [Start-DPContentRedistribution](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPContentRedistribution.md)
* [Start-DPGroupContentDistribution](https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPGroupContentDistribution.md)

## Installing

Install the module from the PowerShell gallery and import it to your session:

```powershell
PS C:\> Install-Module PSCMContentMgmt -Scope CurrentUser
PS C:\> Import-Module PSCMContentMgmt
```

All functions of the module require use of `-SiteServer` or `-SiteCode` parameters. This can be tedious to repeatedly type out. Therefore upon importing the module, two variables will be set in your session:

* `$CMSiteServer`
* Value determined by reading the `Server` registry value in the key `HKLM:\SOFTWARE\WOW6432Node\Microsoft\ConfigMgr10\AdminUI\Connection`.
* This registry key is used by the Configuration Manager module, therefore it is assumed this is the site you want to work in.
    
* `$CMSiteCode`
* Value determined by reading the `SiteCode` property in the`SMS_ProviderLocation` WMI class on the server defined in `$CMSiteServer`

Overwriting these variables is OK and essential if you operate in a multi-site environment.

If you receive a warning along the lines of being unable to auto-populate variables`$CMSiteServer`or`$CMSiteCode`, that means the module failed to read the previously mentioned registry value or the`SMS_ProviderLocation`class on your site server.

If the reason why the module could not set these variables itself is not known, or there's no viable workaround for you, then you can set`$CMSiteServer`or`$CMSiteCode`yourself. Alternatively you can use the`-SiteServer`and`-SiteCode`parameters on an ad-hoc basis.

## Examples

I'll walk you through some key examples which I think most people will benefit from.

## **Comparing distributed content objects between two distribution points or distribution point groups**

```powershell
PS C:\> Compare-DPContent -Source "dp1.contoso.com" -Target "dp2.contoso.com"

ObjectName        : 2020-03-1809
Description       :
ObjectType        : DeploymentPackage
ObjectID          : ACC000F3
SourceSize        : 324981
DistributionPoint : dp1.contoso.com

ObjectName        : 2020-02-1809
Description       :
ObjectType        : DeploymentPackage
ObjectID          : ACC000F4
SourceSize        : 292894
DistributionPoint : dp1.contoso.com

...
```

Returns content objects which are on dp1.contoso.com but not dp2.contoso.com.

With this command, you can pipe it to other appropriate functions within PSCMContentMgmt, e.g. `Remove-DPContent` or `Start-DPContentDistribution`.

```powershell
PS C:\> Compare-DPContent -Source "dp1.contoso.com" -Target "dp2.contoso.com" | Start-DPContentDistribution -DistributionPoint "dp2.contoso.com"

Result    ObjectId ObjectType               Message
------    -------- ----------               -------
Success   ACC00001 Package
Success   ACC00004 BootImage
Success   ACC00005 BootImage
Success   ACC00007 Package
Success   16999742 Application
Success   16999646 Application
Success   16999674 Application
Success   16999752 Application
Success   16999720 Application
Success   17007034 Application

...
```

## **Finding content objects in "distribution failed" state and initiating redistribution en masse**

This is the most practical function I like about PSCMContentMgmt. It is not uncommon for me to experience distribution failures in my environments and I wanted a way to quickly have a visual on those, and take action.

```powershell
PS C:\> Get-DP | Get-DPDistributionStatus -DistributionFailed | Group-Object -Property DistributionPoint

Count Name                      Group
----- ----                      -----
42 dp1.contoso.com           {@{ObjectID=17099179; ObjectType=Applicat...
30 dp2.contoso.com	        {@{ObjectID=17099179; ObjectType=Applicat...
```

Return all distribution points, their associated failed distribution tasks and group the results by distribution point name for an overview.

```powershell
PS C:\> Get-DPDistributionStatus -DistributionPoint "dp1.contoso.com" -DistributionFailed | Start-DPContentRedistribution
```

This is an example on taking action on those items. In this instance, I'm initiating redistribution for all of the objects on dp1.contoso.com in a "distribution failed" state.

If you didn't want to redistribute, you could pipe to `Remove-DPContent` instead.

## **Finding objects in your environment with some arbitrary ID**

This is my favourite function. Do you ever look through log files, see some random ID that you know represents some object in console and just want to know what object that is?

`Find-CMObject` accepts one parameter and that's `-ID`. Pass it anything and it'll do its best to find these objects for you:

* Applications
* Deployment Types
* Packages
* Drivers
* Driver Packages
* Boot Images
* Operating System Images
* Operating System Upgrade Images
* Task Sequences
* Configuration Items
* Configuration Baselines
* User Collections
* Device Collections
* (Software Update) Deployment Packages
  
```powershell
PS C:\> Find-CMObject -ID "ACC00048"
```

Finds any object which has the PackageID "ACC00048", this includes Applications, collections, driver packages, boot images, OS images, OS upgrade images, task sequences and deployment packages.

It searches for Applications by PackageID as a last resort if no match has been found yet by loading every Application's PackageID property which is a lazy property in WMI. This can be time consuming, depending on how many Applications you have in your site, hence why it is last in the list.

## **Migrating a distribution point to another**

Do you need to stand up a new distribution point beside an existing one, but don't want to send content across the WAN?

This requirement was what originally inspired me to write the module. A couple of years ago I came across [this post](http://synack87.blogspot.com/2017/03/distribution-point-migration-tool-kit.html) by someone with the handle SYN_ACK_87. The code offered on TechNet helped me hugely at the time for what I needed, but I felt like adding extra bits. I rolled my own and here we are.

Pull distribution points are undoubtedly a million miles easier than this. If you can, or do currently, use pull distribution points, don't follow this. Configure the new distribution point to pull from the old distribution point.

However if for whatever reason you can't or don't want to use the pull distribution point method, then this is for you.

### 1. Begin by exporting your old/source distribution point's content using `Export-DPContent`.

Preferably this server will be on the same LAN as the distribution point you intend to import the .pkgx files to.

If the server is remote across a slow link, it is recommended you copy the .pkgx files generated by `Export-DPContent` to your new/target distribution point.

```powershell
PS C:\> Get-DPContent -DistributionPoint "OldDP.contoso.com" | Export-DPContent -Folder "E:\exported"
```

### 2. Configure your new/target distribution point to allow prestaged content using `Set-DPAllowPrestagedContent`.

This will ensure when we use `Start-DPContentDistribution` in the next step that the content will not inadvertently transfer across an undesired route.

```powershell
PS C:\> Set-DPAllowPrestagedContent -DistributionPoint "NewDP.contoso.com"
```

### 3. Distribute the exported content from step 1 using `Start-DPContentDistribution` using its `-Folder` parameter.

This will walk through all .pkgx files in the given folder, identifying each object by the particular naming convention of the .pkgx files generated by `Export-DPContent`, and distribute each of the objects they represent in console to your new/target distribution point.

This will put the content objects in console in a "Pending" state; waiting to be imported on your new/target distribution point.

```powershell
Start-DPContentDistribution -Folder "E:\exported" -DistributionPoint "NewDP.contoso.com"
```

### 4. Log on locally or enter a PowerShell session to your new/target distribution point and import PSCMContentMgmt to run `Import-DPContent`.

This step must be executed locally to your new/target distribution point. This is because `Import-DPContent` simply invokes ExtractContent.exe.

Use Import-DPContent and the -Folder parameter (which is preferably a local drive path, or a UNC path where the host is on the same LAN) to begin importing content.

Similar to step 3, `Import-DPContent` depends on the particular naming convention of .pkgx files generated by `Export-DPContent` to successfully import the content.

```powershell
PS C:\> Import-DPContent -Folder "\\OldDP.contoso.com\e$\exported"
```

### 5. Unconfigure your new/target distribution point to only allow prestaged content.

```powershell
PS C:\> Set-DPAllowPrestagedContent -DistributionPoint "NewDP.contoso.com" -State $false
```

## Getting help

If you're seeing or hearing things, I recommend you drink more rum.

I encourage you to read the documentation on the [GitHub repository page](https://github.com/codaamok/PSCMContentMgmt) and the `Get-Help` material. I wrote several "About" help topics , filling all functions with examples and detailed descriptions for parameters.

To view the help material for a particular function:

```powershell
PS C:\> Get-Help Compare-DPContent -Detailed
```

To see all of the "About" help topics available for PSCMContentMgmt:

```powershell
PS C:\> Get-Help about_PSCMContentMgmt*
```

To read one of the "About" help topics:

```powershell
PS C:\> Get-Help about_PSCMContentMgmt_Query
```

Failing that:

* If you think you're experiencing, or have found, a bug in PSCMContentMgmt, please open an issue on its [GitHub repository](https://github.com/codaamok/PSCMContentMgmt).
* Ping me on Twitter [@codaamok](https://twitter.com/codaamok).
* Come to the [WinAdmins Discord](https://winadmins.io/) and bug me there, my handle is @acc.
  
The Configuration Manager module notoriously returns generic error messages (if any) for most of its cmdlets/functions. Since this module is mostly nothing more than a wrapper for most cmdlets/functions, I just forward those messages on to you so please bear that in mind.
