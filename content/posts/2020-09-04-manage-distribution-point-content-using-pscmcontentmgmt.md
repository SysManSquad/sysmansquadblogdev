---
title: Manage Distribution Point Content Using PSCMContentMgmt
author: Adam Cook
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
 <div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-8b0abf3d " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        <a href="#introduction">Introduction</a><li class="uagb-toc__list">
          <a href="#installing">Installing</a><li class="uagb-toc__list">
            <a href="#examples">Examples</a><ul class="uagb-toc__list">
              <li class="uagb-toc__list">
                <a href="#comparing-distributed-content-objects-between-two-distribution-points-or-distribution-point-groups">Comparing distributed content objects between two distribution points or distribution point groups</a><li class="uagb-toc__list">
                  <li class="uagb-toc__list">
                    <a href="#finding-content-objects-in-distribution-failed-state-and-initiating-redistribution-en-masse">Finding content objects in "distribution failed" state and initiating redistribution en masse</a><li class="uagb-toc__list">
                      <li class="uagb-toc__list">
                        <a href="#finding-objects-in-your-environment-with-some-arbitrary-id">Finding objects in your environment with some arbitrary ID</a><li class="uagb-toc__list">
                          <li class="uagb-toc__list">
                            <a href="#migrating-a-distribution-point-to-another">Migrating a distribution point to another</a><ul class="uagb-toc__list">
                              <li class="uagb-toc__list">
                                <a href="#1-begin-by-exporting-your-oldsource-distribution-points-content-using-export-dpcontent">1. Begin by exporting your old/source distribution point's content using Export-DPContent.</a><li class="uagb-toc__list">
                                  <li class="uagb-toc__list">
                                    <a href="#2-configure-your-newtarget-distribution-point-to-allow-prestaged-content-using-set-dpallowprestagedcontent">2. Configure your new/target distribution point to allow prestaged content using Set-DPAllowPrestagedContent.</a><li class="uagb-toc__list">
                                      <li class="uagb-toc__list">
                                        <a href="#3-distribute-the-exported-content-from-step-1-using-start-dpcontentdistribution-using-its-folder-parameter">3. Distribute the exported content from step 1 using Start-DPContentDistribution using its -Folder parameter.</a><li class="uagb-toc__list">
                                          <li class="uagb-toc__list">
                                            <a href="#4-log-on-locally-or-enter-a-powershell-session-to-your-newtarget-distribution-point-and-import-pscmcontentmgmt-to-run-import-dpcontent">4. Log on locally or enter a PowerShell session to your new/target distribution point and import PSCMContentMgmt to run Import-DPContent.</a><li class="uagb-toc__list">
                                              <li class="uagb-toc__list">
                                                <a href="#5-unconfigure-your-newtarget-distribution-point-to-only-allow-prestaged-content">5. Unconfigure your new/target distribution point to only allow prestaged content.</a>
                                              </li></ul>
                                            </li></ul>
                                          </li>
                                          <li class="uagb-toc__list">
                                            <a href="#getting-help">Getting help</a>
                                          </li></ul>
                                        </li></ul></ol> </div> </div> </div> 
                                        <h2>
                                          Introduction
                                        </h2>
                                        
                                        <p>
                                          I recently wrote <a href="https://github.com/codaamok/PSCMContentMgmt" target="_blank" rel="noreferrer noopener">PSCMContentMgmt</a> which provides a simple and effective workflow for managing your MEMCM distribution points. Here are some of the things you can do with it:
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            Query content objects which are distributed to distribution point(s) or distribution point group(s)
                                          </li>
                                          <li>
                                            Compare content objects distributed to distribution point(s) or distribution point group(s)
                                          </li>
                                          <li>
                                            Find content objects in a "distribution failed" state for all or selective distribution points
                                          </li>
                                          <li>
                                            Remove, distribute or redistribute content objects returned by any function to distribution point(s)
                                          </li>
                                          <li>
                                            Find an object in your site by searching on any arbitrary ID (useful when reading logs and want to know what object an ID resolves to)
                                          </li>
                                          <li>
                                            Migrate a distribution point's content to a new/different distribution point by exporting its content library to prestaged .pkgx files and importing the .pkgx files to the new distribution point
                                          </li>
                                          <li>
                                            Invoke the ContentLibraryCleanup.exe tool
                                          </li>
                                        </ul>
                                        
                                        <p>
                                          PSCMContentMgmt is a mix of being no more than a wrapper for MEMCM cmdlets or native binaries. Some functions query WMI or invoke WMI methods.
                                        </p>
                                        
                                        <p>
                                          PSCMContentMgmt does not intend to reinvent the wheel from already available cmdlets. Instead it provides a simpler workflow for managing your distribution points by offering:
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            Easy to use pipeline support, so you can easily progress through the motions for tasks such as querying content on a distribution point or distribution point group - perhaps in a particular state (e.g. "distribution failed") - and distributing, redistributing or removing it from another (or the same) distribution point or distribution point group.
                                          </li>
                                          <li>
                                            Consistent property names when dealing with different types of content objects, i.e. the ObjectID property is always PackageID except for Applications/Deployment Types where it is CI_ID (same is true for the -ObjectID parameter on functions that offer it).
                                          </li>
                                          <li>
                                            Functionality which the Configuration Manager console does not provide e.g. content redistribution or import .pkgx files.
                                          </li>
                                        </ul>
                                        
                                        <p>
                                          At the time of writing this, here are a list of functions in PSCMContentMgmt (be sure to check out the docs on the <a href="https://github.com/codaamok/PSCMContentMgmt" target="_blank" rel="noreferrer noopener">GitHub repository</a> in case there are changes):
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Find-CMOBject.md">Find-CMObject</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Compare-DPContent.md">Compare-DPContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Compare-DPGroupContent.md">Compare-DPGroupContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Export-DPContent.md">Export-DPContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DP.md">Get-DP</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPContent.md">Get-DPContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPDistributionStatus.md">Get-DPDistributionStatus</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPGroup.md">Get-DPGroup</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Get-DPGroupContent.md">Get-DPGroupContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Import-DPContent.md">Import-DPContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Invoke-DPContentLibraryCleanup.md">Invoke-DPContentLibraryCleanup</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Remove-DPContent.md">Remove-DPContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Remove-DPGroupContent.md">Remove-DPGroupContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Set-DPAllowPrestagedContent.md">Set-DPAllowPrestagedContent</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPContentDistribution.md">Start-DPContentDistribution</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPContentRedistribution.md">Start-DPContentRedistribution</a>
                                          </li>
                                          <li>
                                            <a href="https://github.com/codaamok/PSCMContentMgmt/blob/master/docs/Start-DPGroupContentDistribution.md">Start-DPGroupContentDistribution</a>
                                          </li>
                                        </ul>
                                        
                                        <h2>
                                          Installing
                                        </h2>
                                        
                                        <p>
                                          Install the module from the PowerShell gallery and import it to your session:
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Install-Module PSCMContentMgmt -Scope CurrentUser
PS C:\&gt; Import-Module PSCMContentMgmt</pre>
                                        </div>
                                        
                                        <p>
                                          All functions of the module require use of <code>-SiteServer</code> or <code>-SiteCode</code> parameters. This can be tedious to repeatedly type out. Therefore upon importing the module, two variables will be set in your session:
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            <code>$CMSiteServer</code><ul>
                                              <li>
                                                Value determined by reading the <code>Server</code> registry value in the key <code>HKLM:\SOFTWARE\WOW6432Node\Microsoft\ConfigMgr10\AdminUI\Connection</code>.
                                              </li>
                                              <li>
                                                This registry key is used by the Configuration Manager module, therefore it is assumed this is the site you want to work in.
                                              </li>
                                            </ul>
                                          </li>
                                          
                                          <li>
                                            <code>$CMSiteCode</code><ul>
                                              <li>
                                                Value determined by reading the <code>SiteCode</code> property in the<code>SMS_ProviderLocation</code> WMI class on the server defined in <code>$CMSiteServer</code>
                                              </li>
                                            </ul>
                                          </li>
                                        </ul>
                                        
                                        <p>
                                          Ovewritting these variables is OK and essential if you operate in a multi-site environment.
                                        </p>
                                        
                                        <p>
                                          If you receive a warning along the lines of being unable to auto-populate variables&nbsp;<code>$CMSiteServer</code>&nbsp;or&nbsp;<code>$CMSiteCode</code>, that means the module failed to read the previously mentioned registry value or the&nbsp;<code>SMS_ProviderLocation</code>&nbsp;class on your site server.
                                        </p>
                                        
                                        <p>
                                          If the reason why the module could not set these variables itself is not known, or there's no viable workaround for you, then you can set&nbsp;<code>$CMSiteServer</code>&nbsp;or&nbsp;<code>$CMSiteCode</code>&nbsp;yourself. Alternatively you can use the&nbsp;<code>-SiteServer</code>&nbsp;and&nbsp;<code>-SiteCode</code>&nbsp;parameters on an ad-hoc basis.
                                        </p>
                                        
                                        <h2>
                                          Examples
                                        </h2>
                                        
                                        <p>
                                          I'll walk you through some key examples which I think most people will benefit from.
                                        </p>
                                        
                                        <h4>
                                          <strong>Comparing distributed content objects between two distribution points or distribution point groups</strong>
                                        </h4>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Compare-DPContent -Source "dp1.contoso.com" -Target "dp2.contoso.com"

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

...</pre>
                                        </div>
                                        
                                        <p>
                                          Returns content objects which are on dp1.contoso.com but not dp2.contoso.com.
                                        </p>
                                        
                                        <p>
                                          With this command, you can pipe it to other appropriate functions within PSCMContentMgmt, e.g. <code>Remove-DPContent</code> or <code>Start-DPContentDistribution</code>.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Compare-DPContent -Source "dp1.contoso.com" -Target "dp2.contoso.com" | Start-DPContentDistribution -DistributionPoint "dp2.contoso.com"

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

...</pre>
                                        </div>
                                        
                                        <h4>
                                          <strong>Finding content objects in "distribution failed" state and initiating redistribution en masse</strong>
                                        </h4>
                                        
                                        <p>
                                          This is the most practical function I like about PSCMContentMgmt. It is not uncommon for me to experience distribution failures in my environments and I wanted a way to quickly have a visual on those, and take action.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-DP | Get-DPDistributionStatus -DistributionFailed | Group-Object -Property DistributionPoint

Count Name                      Group
----- ----                      -----
   42 dp1.contoso.com           {@{ObjectID=17099179; ObjectType=Applicat...
   30 dp2.contoso.com	        {@{ObjectID=17099179; ObjectType=Applicat...</pre>
                                        </div>
                                        
                                        <p>
                                          Return all distribution points, their associated failed distribution tasks and group the results by distribution point name for an overview.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-DPDistributionStatus -DistributionPoint "dp1.contoso.com" -DistributionFailed | Start-DPContentRedistribution</pre>
                                        </div>
                                        
                                        <p>
                                          This is an example on taking action on those items. In this instance, I'm initiating redistribution for all of the objects on dp1.contoso.com in a "distribution failed" state.
                                        </p>
                                        
                                        <p>
                                          If you didn't want to redistribute, you could pipe to <code>Remove-DPContent</code> instead.
                                        </p>
                                        
                                        <h4>
                                          <strong>Finding objects in your environment with some arbitrary ID</strong>
                                        </h4>
                                        
                                        <p>
                                          This is my favourite function. Do you ever look through log files, see some random ID that you know represents some object in console and just want to know what object that is?
                                        </p>
                                        
                                        <p>
                                          <code>Find-CMObject</code> accepts one parameter and that's <code>-ID</code>. Pass it anything and it'll do its best to find these objects for you:
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            Applications
                                          </li>
                                          <li>
                                            Deployment Types
                                          </li>
                                          <li>
                                            Packages
                                          </li>
                                          <li>
                                            Drivers
                                          </li>
                                          <li>
                                            Driver Packages
                                          </li>
                                          <li>
                                            Boot Images
                                          </li>
                                          <li>
                                            Operating System Images
                                          </li>
                                          <li>
                                            Operating System Upgrade Images
                                          </li>
                                          <li>
                                            Task Sequences
                                          </li>
                                          <li>
                                            Configuration Items
                                          </li>
                                          <li>
                                            Configuration Baselines
                                          </li>
                                          <li>
                                            User Collections
                                          </li>
                                          <li>
                                            Device Collections
                                          </li>
                                          <li>
                                            (Software Update) Deployment Packages
                                          </li>
                                        </ul>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Find-CMObject -ID "ACC00048"</pre>
                                        </div>
                                        
                                        <p>
                                          Finds any object which has the PackageID "ACC00048", this includes Applications, collections, driver packages, boot images, OS images, OS upgrade images, task sequences and deployment packages.
                                        </p>
                                        
                                        <p>
                                          It searches for Applications by PackageID as a last resort if no match has been found yet by loading every Application's PackageID property which is a lazy property in WMI. This can be time consuming, depending on how many Applications you have in your site, hence why it is last in the list.
                                        </p>
                                        
                                        <h4>
                                          <strong>Migrating a distribution point to another</strong>
                                        </h4>
                                        
                                        <p>
                                          Do you need to stand up a new distribution point beside an existing one, but don't want to send content across the WAN?
                                        </p>
                                        
                                        <p>
                                          This requirement was what originally inspired me to write the module. A couple of years ago I came across <a href="http://synack87.blogspot.com/2017/03/distribution-point-migration-tool-kit.html">this post</a> by someone with the handle SYN_ACK_87. The code offered on TechNet helped me hugely at the time for what I needed, but I felt like adding extra bits. I rolled my own and here we are.
                                        </p>
                                        
                                        <p>
                                          Pull distribution points are undoubtedly a million miles easier than this. If you can, or do currently, use pull distribution points, don't follow this. Configure the new distribution point to pull from the old distribution point.
                                        </p>
                                        
                                        <p>
                                          However if for whatever reason you can't or don't want to use the pull distribution point method, then this is for you.
                                        </p>
                                        
                                        <h6>
                                          1. Begin by exporting your old/source distribution point's content using <code>Export-DPContent</code>.
                                        </h6>
                                        
                                        <p>
                                          Preferably this server will be on the same LAN as the distribution point you intend to import the .pkgx files to.
                                        </p>
                                        
                                        <p>
                                          If the server is remote across a slow link, it is recommended you copy the .pkgx files generated by <code>Export-DPContent</code> to your new/target distribution point.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-DPContent -DistributionPoint "OldDP.contoso.com" | Export-DPContent -Folder "E:\exported"</pre>
                                        </div>
                                        
                                        <h6>
                                          2. Configure your new/target distribution point to allow prestaged content using <code>Set-DPAllowPrestagedContent</code>.
                                        </h6>
                                        
                                        <p>
                                          This will ensure when we use <code>Start-DPContentDistribution</code> in the next step that the content will not inadvertently transfer across an undesired route.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Set-DPAllowPrestagedContent -DistributionPoint "NewDP.contoso.com"</pre>
                                        </div>
                                        
                                        <h6>
                                          3. Distribute the exported content from step 1 using <code>Start-DPContentDistribution</code> using its <code>-Folder</code> parameter.
                                        </h6>
                                        
                                        <p>
                                          This will walk through all .pkgx files in the given folder, identifying each object by the particular naming convention of the .pkgx files generated by <code>Export-DPContent</code>, and distribute each of the objects they represent in console to your new/target distribution point.
                                        </p>
                                        
                                        <p>
                                          This will put the content objects in console in a "Pending" state; waiting to be imported on your new/target distribution point.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Start-DPContentDistribution -Folder "E:\exported" -DistributionPoint "NewDP.contoso.com"</pre>
                                        </div>
                                        
                                        <h6>
                                          4. Log on locally or enter a PowerShell session to your new/target distribution point and import PSCMContentMgmt to run <code>Import-DPContent</code>.
                                        </h6>
                                        
                                        <p>
                                          This step must be executed locally to your new/target distribution point. This is because <code>Import-DPContent</code> simply invokes ExtractContent.exe.
                                        </p>
                                        
                                        <p>
                                          Use Import-DPContent and the -Folder parameter (which is preferably a local drive path, or a UNC path where the host is on the same LAN) to begin importing content.
                                        </p>
                                        
                                        <p>
                                          Similar to step 3, <code>Import-DPContent</code> depends on the particular naming convention of .pkgx files generated by <code>Export-DPContent</code> to successfully import the content.
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Import-DPContent -Folder "\\OldDP.contoso.com\e$\exported"</pre>
                                        </div>
                                        
                                        <h6>
                                          5. Unconfigure your new/target distribution point to only allow prestaged content.
                                        </h6>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;showPanel&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Set-DPAllowPrestagedContent -DistributionPoint "NewDP.contoso.com" -State $false</pre>
                                        </div>
                                        
                                        <h2>
                                          Getting help
                                        </h2>
                                        
                                        <p>
                                          If you're seeing or hearing things, I recommend you drink more rum.
                                        </p>
                                        
                                        <p>
                                          I encourage you to read the documentation on the <a href="https://github.com/codaamok/PSCMContentMgmt" target="_blank" rel="noreferrer noopener">GitHub repository page</a> and the <code>Get-Help</code> material. I wrote several "About" help topics , filling all functions with examples and detailed descriptions for parameters.
                                        </p>
                                        
                                        <p>
                                          To view the help material for a particular function:
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:true,&quot;showPanel&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-Help Compare-DPContent -Detailed</pre>
                                        </div>
                                        
                                        <p>
                                          To see all of the "About" help topics available for PSCMContentMgmt:
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:true,&quot;showPanel&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-Help about_PSCMContentMgmt*</pre>
                                        </div>
                                        
                                        <p>
                                          To read one of the "About" help topics:
                                        </p>
                                        
                                        <div class="wp-block-codemirror-blocks-code-block code-block">
                                          <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:true,&quot;showPanel&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">PS C:\&gt; Get-Help about_PSCMContentMgmt_Query</pre>
                                        </div>
                                        
                                        <p>
                                          Failing that:
                                        </p>
                                        
                                        <ul>
                                          <li>
                                            If you think you're experiencing, or have found, a bug in PSCMContentMgmt, please open an issue on its <a href="https://github.com/codaamok/PSCMContentMgmt" target="_blank" rel="noreferrer noopener">GitHub repository</a>.
                                          </li>
                                          <li>
                                            Ping me on Twitter <a href="https://twitter.com/codaamok" target="_blank" rel="noreferrer noopener">@codaamok</a>.
                                          </li>
                                          <li>
                                            Come to the <a href="https://winadmins.io/" target="_blank" rel="noreferrer noopener">WinAdmins Discord</a> and bug me there, my handle is @acc.
                                          </li>
                                        </ul>
                                        
                                        <p>
                                          The Configuration Manager module notoriously returns generic error messages (if any) for most of its cmdlets/functions. Since this module is mostly nothing more than a wrapper for most cmdlets/functions, I just forward those messages on to you so please bear that in mind.
                                        </p>