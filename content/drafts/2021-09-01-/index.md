---
title: FSLogix App Masking rules for M365 Apps
author: Grant
type: post
date: -001-11-30T00:00:00+00:00
draft: true
categories:
  - Endpoint Management

---
I'm deploying Azure Virtual Desktop currently for a client and they want a "general shared desktop" pool that will have a bunch of core apps and M365 Apps installed. Some of the users who'll have access will be allowed Access (MS Access that is - which SHOULD be heavily restricted.). So it will be installed in the base image, but don't want EVERY user being able to use it.

The solution? FSLogix Application Masking!  
And it's generally really easy to set up.... until you want to do the Office suite.

This is because Office is all installed in the same directory and shares a lot of components with all applications in the suite, it makes it a lot more difficult to create app masking rules.

In order to get around this, I approached this in a modular fashion. Installing each app in a vm and capturing the rules needed. 

An older way was explained here: [[YouTube] FSLogix Application Masking - Advanced Hiding of Project and Visio](https://www.youtube.com/watch?v=opPTy9nUAwE)

We're going to use this script: [fslogix/Rules at main · aaronparker/fslogix · GitHub][2] to create the rules.

Our rules will hide Access, Publisher, Project, and Visio

First thing's first: Create a standard VM of Windows 10 (I did this on-prem so snapshotting and reverting back is easier). It MUST have internet access.  
Once your VM is ready, log in and download the Office Deployment Tool from [Download Office Deployment Tool from Official Microsoft Download Center][3] to a temporary location. i.e. C:\ODT

Second thing second: We need to create a bunch of M365 Apps customisation config XML files. 

(I will assume here that you already know how to make M365 Apps configuration files)

<ol type="1">
  <li>
    Base Office install without Project, Visio, or Visio Viewer<ul>
      <li>
        To create rules for Access, Publisher
      </li>
    </ul>
  </li>
  
  <li>
    With Visio<ul>
      <li>
        To create rule for Visio
      </li>
    </ul>
  </li>
  
  <li>
    With Project<ul>
      <li>
        To create rule for Project
      </li>
    </ul>
  </li>
</ol>

Edit the Office Customisation XML as follows:

Base Install Config:<figure class="wp-block-image size-large">

![](image-2.png) </figure> 

With Visio:<figure class="wp-block-image size-large">

![](image-3.png) </figure> 

With Project:<figure class="wp-block-image size-large">

![](image-4.png) </figure> 

Save each as a different version. E.g. M365Apps-AVD-Base.xml, M365Apps-AVD-Visio.xml, M365Apps-AVD-Project.xml

Download the office setup files by running:

`.\setup.exe /download .\M365Apps-AVD-Base.xml`

Install the FSLogix PowerShell Module

`Install-Module -Name "FSLogix.PowerShell.Rules"`

Snapshot the VM - "Pre-Office" (I snapshot here in case I make a mistake with the base install)

<div class="wp-block-group">
  <div class="wp-block-group__inner-container">
    <p>
      Now install the Base Office
    </p>
    
    `.\setup.exe /configure .\M365Apps-AVD-Base.xml`
    
    
#### Create Access Ruleset
    
    
    <p>
      Run:
    </p>
    
    `.\New-MicrosoftOfficeRuleset.ps1 -SearchString "Access"`
    
    <ul>
      <li>
        Open the generated Rule File (Default C:\Users\*USERNAME*\Documents\FSLogix Rule Sets\MicrosoftAccess.fxr
      </li>
      <li>
        Check & Delete any entries which are incorrect or aren't actually relevant to MS Access, they just have "access" in the name
      </li>
    </ul><figure class="wp-block-image size-large">
    
    <img loading="lazy" width="532" height="188" src="image-1.png" alt="Filter Rules: 
Hiding Rule 
Directory: 
A dded by New "crosoftOffceRWeset.ps I. 
Hiding Rule 
Directory : 
Added by tv—vyWcrosoftOffceRWeset.psI. 
Hiding R ule 
Key: HKLM 
Added by New—WcrosoftOffceRu/eset.psI. " class="wp-image-2953" srcset="image-1.png 532w, image-1.png 300w, image-1.png 100w" sizes="(max-width: 532px) 100vw, 532px" /></figure> 
    
    <p>
      I also deleted all the Classes\CLSID\{GUID} rules because they kinda broke Windows. I didn't have time to test them all, but you should for best results.
    </p>
    
    
#### Publisher Ruleset
    
    
    <p>
      Run:
    </p>
    
    `.\New-MicrosoftOfficeRuleset.ps1 -SearchString "Publisher"`
    
    <ul>
      <li>
        Open the generated Rule File (Default C:\Users\*USERNAME*\Documents\FSLogix Rule Sets\MicrosoftPublisher.fxr
      </li>
      <li>
        Check for any entries which are incorrect.
      </li>
    </ul>
    
    <p>
      Copy the Access and Publisher rules off the VM to a separate storage location.
    </p>
    
    <p>
      Revert the VM to last snapshot.
    </p>
    
    <hr class="wp-block-separator is-style-dots" />
  </div>
</div>

<div class="wp-block-group">
  <div class="wp-block-group__inner-container">
    
#### Visio Ruleset
    
    
    <p>
      Install Office with Visio
    </p>
    
    `.\setup.exe /configure .\M365Apps-AVD-Visio.xml`
    
    <p>
      Run:
    </p>
    
    `.\New-MicrosoftOfficeRuleset.ps1 -SearchString "Visio"`
    
    <ul>
      <li>
        Open the generated Rule File (Default C:\Users\USERNAME\Documents\FSLogix Rule Sets\MicrosoftVisio.fxr
      </li>
      <li>
        Check for any entries which are incorrect.
      </li>
    </ul>
    
    <p>
      Copy the Visio Ruleset off the VM to a separate storage location.
    </p>
    
    <p>
      Revert the VM to last snapshot.
    </p>
    
    <hr class="wp-block-separator is-style-dots" />
  </div>
</div>

<div class="wp-block-group">
  <div class="wp-block-group__inner-container">
    
#### Project Ruleset
    
    
    <p>
      Install Office with Project
    </p>
    
    `.\setup.exe /configure .\M365Apps-AVD-Project.xml`
    
    <p>
      Run:
    </p>
    
    `.\New-MicrosoftOfficeRuleset.ps1 -SearchString "Project", "WinProj"`
    
    <ul>
      <li>
        Open the generated Rule File (Default C:\Users\USERNAME\Documents\FSLogix Rule Sets\MicrosoftProject.fxr
      </li>
      <li>
        Check for any entries which are incorrect.
      </li>
    </ul>
    
    <div class="wp-block-group">
      <div class="wp-block-group__inner-container">
        <p>
          This one is quite difficult. I found and deleted a load of entries that are nothing really to do with Project (I am open to corrections):
        </p>
      </div>
    </div>
    
    <p>
      HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Outlook.File.otm.15<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.Project.16<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.Project<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.BlankProjectTemplate.16<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.BlankProjectTemplate<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.ADEFile.16<br />HKLM\SOFTWARE\Microsoft\Office\ClickToRun\REGISTRY\MACHINE\Software\Classes\Access.ADEFile<br />HKLM\SOFTWARE\Classes\Outlook.File.otm.15<br />HKLM\SOFTWARE\Classes\Access.Project.16<br />HKLM\SOFTWARE\Classes\Access.Project<br />HKLM\SOFTWARE\Classes\Access.BlankProjectTemplate.16<br />HKLM\SOFTWARE\Classes\Access.BlankProjectTemplate<br />HKLM\SOFTWARE\Classes\Access.ADEFile.16<br />HKLM\SOFTWARE\Classes\Access.ADEFile
    </p>
    
    <p>
      I also had to add:
    </p>
    
    <pre class="wp-block-preformatted">%CommonStartMenuFolder%\Programs\Microsoft Office Tools\Project Server Accounts.lnk</pre>
    
    <p>
      Copy the Project Ruleset off the VM to a separate storage location.
    </p>
  </div>
</div>

### NOTES

Pay close attention to any rules in HKLM\SOFTWARE\Classes\CLSID\{GUID}

These are sometimes related to the application, but often seem to be more system based registry keys and masking them can break things!

TEST!!!

 
 [2]: https://github.com/aaronparker/fslogix/tree/main/Rules
 [3]: https://www.microsoft.com/en-us/download/details.aspx?id=49117
