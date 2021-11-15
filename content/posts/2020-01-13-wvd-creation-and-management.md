---
title: 'Windows Virtual Desktop: Creation and Management'
author: Jake Shackelford
type: post
date: 2020-01-13T06:33:53+00:00
url: /2020/01/13/wvd-creation-and-management/
featured_image: /wp-content/uploads/2019/12/image-1-100x64.png
uag_style_timestamp-js:
  - 1591720982
categories:
  - Azure
  - Endpoint Management
  - How-To
  - Windows
tags:
  - Windows Virtual Desktop
  - WVD

---
## THIS GUIDE IS NOW OUTDATED WITH THE RELEASE OF WVD 2.0 I will create a new blog with the updated info in the future! Some of the info below is still valid!

### Why Windows Virtual Desktop?  {#0--why-windows-virtual-desktop-}

Windows Virtual Desktop allows you to create virtual Windows 10 machines that can be accessed from virtually anywhere. This means you can give someone a full desktop experience from virtually anywhere including android and iOS! In addition, if you do not want users to have a full desktop you can deploy specific applications which look and act like a native app on the machine, which can save you time and headaches when trying to deploy complex software.

### Requirements {#1-requirements}<figure class="wp-block-table">

| OS                                                           | Required license                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Windows 10 Enterprise multi-session or Windows 10 Enterprise | Microsoft 365 E3, E5, A3, A5, F1, Business  
Windows E3, E5, A3, A5 |</figure> 

This guide assumes you have either <a rel="noreferrer noopener" aria-label="Azure Active Directory Domain Services (Azure AD DS) (opens in a new tab)" href="https://docs.microsoft.com/en-us/azure/active-directory-domain-services/" target="_blank">Azure Active Directory Domain Services (Azure AD DS)</a> or a network connection from your Azure tenant to your on-premises network. In the following guide I will be going over the Azure AD DS method, but both are similar.  
  
You will also need <a rel="noreferrer noopener" aria-label="Marcel Meurer's tool (opens in a new tab)" href="https://blog.itprocloud.de/Windows-Virtual-Desktop-Admin/" target="_blank">Marcel Meurer's tool</a> (I provide download links farther down). Several of the items I will be covering are a re-hash of what he has in his post but with more steps for using the tool and creating a master virtual machine (VM).

## Creating Resource Groups {#2-creating-resource-groups}

  1. Login to the Azure portal <https://portal.azure.com/> 
  2. Click the **Create a resource** button<img loading="lazy" width="254" height="163" class="wp-image-623" style="width: 300px;" src="https://sysmansquad.com/wp-content/uploads/2019/12/image-1.png" alt="" srcset="https:/wp-content/uploads/2019/12/image-1.png 254w, https:/wp-content/uploads/2019/12/image-1-100x64.png 100w" sizes="(max-width: 254px) 100vw, 254px" />
  3. Search for Resource group
  4. Create a Resource group called DOMAIN-Master-VMs or whatever you'd like your golden images to be based off (YES WVD is essentially build and capture/reference image)
  5. Create a second Resource group and give it whatever name you'd like. EX. I'm going to deploy AutoCAD so I'll name it DOMAIN-AutoCAD-HostPool

### Creating a Service Principal Account {#3-creating-a-service-principal-account}

We need to create a service principal account to access Marcel's UI and also grant permission to different resource groups in order to manage our WVD environment

  1. From the Azure Portal Dashboard, navigate to Azure Active Directory
  2. Select App registrations
  3. New Registration
  4. Give your application a name; I chose "svc_WVDAdmin
  5. Leave the rest default
  6. Select Register
  7. Go to your newly created application
  8. Record the Application client ID and Directory tenant ID for later
  9. Select Certificates & Secrets
 10. Create a new client secret
 11. Select an expire date; I chose Never
 12. Select Add and record the key value you are given as you can't ever see it again
 13. While we are in AAD navigate to the overview page and record the Tenant Name which should be above the Tenant ID

### Granting Access for our Service account {#4-granting-access-for-our-service-account}

  1. Navigate to the two Resource groups we created earlier
  2. Select Access Control (IAM)
  3. Select Role assignments
  4. Select Add 
  5. Select Role assignment
  6. Role should be set to Contributor
  7. Select should be set to your Service account; in this case svc_WVDAdmin
  8. Select Save 
  9. Apply the same setup to your other resource group or any resource groups you want to create and manage WVD with

### Creating a WVD tenant {#5-creating-a-wvd-tenant}

Time for some powershell! The following powershell will add a WVD tenant. Please use an administrative account when signing in as you have to grant access for your tenant.

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">$ApplicationID = PASTE YOUR SERVICE PRINCIPAL ACCOUNT APP ID HERE
$TenantName = PASTE YOUR FULL TENANT NAME HERE
Install-Module -Name Microsoft.RDInfra.RDPowerShell
Add-RdsAccount -DeploymentUrl "https://rdbroker.wvd.microsoft.com"
New-RdsRoleAssignment -TenantName $TenantName -RoleDefinitionName "RDS Owner" -ApplicationId $ApplicationID</pre>
</div><figure class="wp-block-image size-large is-resized">

<img loading="lazy" src="https://sysmansquad.com/wp-content/uploads/2019/12/powershell_rJBQfXUtgx.png" alt="" class="wp-image-624" width="636" height="542" srcset="https:/wp-content/uploads/2019/12/powershell_rJBQfXUtgx.png 859w, https:/wp-content/uploads/2019/12/powershell_rJBQfXUtgx-300x256.png 300w, https:/wp-content/uploads/2019/12/powershell_rJBQfXUtgx-768x654.png 768w, https:/wp-content/uploads/2019/12/powershell_rJBQfXUtgx-100x85.png 100w, https:/wp-content/uploads/2019/12/powershell_rJBQfXUtgx-855x729.png 855w" sizes="(max-width: 636px) 100vw, 636px" /> <figcaption>Successful execution</figcaption></figure> 

### Setting up Marcel's tool and creating a network share {#6-setting-up-marcels-tool-and-creating-a-network-share}

Earlier I mentioned I will be going over the method with Azure AD DS. I currently have a tools server in Azure that I'm using to manage everything so I will be signing into that. This gives me access to view and manage Azure AD DS and install any other tools I might need such as WVD. One thing I don't cover in this guide is Network Security Groups. I would strongly suggest blocking all RDP access except from Specific IPs so that only you can access the MasterVMs and your tools server.

You will need to download 4 items at this point:

  1. [Marcel's tool](https://blog.itprocloud.de/assets/files/WVDAdmin.msi)
  2. [ITPC-WVD-Image-Processing.ps1](https://blog.itprocloud.de/assets/files/AutoUpdate/Scripts/ITPC-WVD-Image-Processing.ps1.txt)
  3. [Microsoft.RDInfra.RDAgent.msi](https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RWrmXv)
  4. [Microsoft.RDInfra.RDAgentBootLoader.msi](https://query.prod.cms.rt.microsoft.com/cms/api/am/binary/RWrxrH)
  5. Rename 2-4 to match the link text since they will be named incorrectly when you download them.

  1. Navigate to C:\ and create a folder called Configuration
  2. Inside of your Configuration folder create a WVD folder
  3. Right click the WVD folder and select Share
  4. Give Everyone Read Access
  5. Move the 3 files we downloaded and renamed earlier into this folder; it should look like the following<img loading="lazy" width="1126" height="636" class="wp-image-625" style="width: 800px;" src="https://sysmansquad.com/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs.png" alt="" srcset="https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs.png 1126w, https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs-300x169.png 300w, https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs-1024x578.png 1024w, https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs-768x434.png 768w, https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs-100x56.png 100w, https:/wp-content/uploads/2019/12/mstsc_n4qL8uv5Vs-855x483.png 855w" sizes="(max-width: 1126px) 100vw, 1126px" />
  6. Next install Marcel's tool. You can leave all the options to default

### Launching the tool {#7-launching-the-tool}

We are ready to at the very least get signed into the tool now!

  1. Launch the WVD Admin tool that we just installed
  2. Input the Azure Tenant ID, Service Principal ID and the Principal Key you recorded earlier
  3. Select Save
  4. On the left-hand side select Reload All

You should see two forests, one being your Tenant Name the other being Azure. If you expand your tenant name you will see the resource group for the host-pool we created earlier assuming the permissions were assigned properly. If you expand the Azure forest you will see Virtual Machines and Images. At this stage you shouldn't have much else since we haven't created any master VMs for our host pools.

## Creating Master VMs {#8-creating-master-vms}

I hate to use the word master VMs as it really boils down to a golden image or the old build and capture mentality but that's currently what we have to work with in WVD.

  1. Navigate to the Master-VMs resource group we created earlier
  2. Create a new resource by selecting the Add button
  3. Search for Microsoft Windows 10 + Office 365 ProPlus (you do the + Office 365 ProPlus because the non-office version isn't the latest release of windows) and make sure you're selecting the latest version&nbsp;
  4. Click Create<img loading="lazy" width="745" height="159" class="wp-image-629" style="width: 800px;" src="https://sysmansquad.com/wp-content/uploads/2019/12/GetImage.png" alt="" srcset="https:/wp-content/uploads/2019/12/GetImage.png 745w, https:/wp-content/uploads/2019/12/GetImage-300x64.png 300w, https:/wp-content/uploads/2019/12/GetImage-100x21.png 100w" sizes="(max-width: 745px) 100vw, 745px" />
  5. For Virtual Machine name change it to whatever your preference in my case i'll be calling it AutoCAD after the program that I'll be installing
  6. You can leave the Size default I typically select B2Ms as I like to penny pinch (Please note this server won't cost you anything other than the storage of the drive when we are done with it)
  7. Scroll down and set an administrator account. This is a local admin account
  8. Select Next: Disks
  9. I change my disks to Standard HDD again to save on costs.
 10. Select Next: Networking
 11. Select the Virtual Network that your Azure AD DS exists on
 12. Change the subnet as needed
 13. Select Next: Management
 14. Turn off Boot Diagnostics
 15. Select Review and Create
 16. Select Create
 17. It will take a few minutes for the VM to deploy
 18. Once it has deployed, connect to the VM via RDP
 19. Install your applications (You can have as many applications as you want. In fact it's easier to manage if you put them all on one VM but this is up to your discretion)
 20. Make a note of the full path to the .exe of the programs you want to give access to
 21. Install Windows Updates
 22. Restart and check for more Updates
 23. Once updates are done Disable the Windows Update Service
 24. Domain join the machine
 25. Make any registry changes you want. I personally use the list below
 26. Shutdown the VM

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;shell.ps1&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v RemoteAppLogoffTimeLimit /t REG_DWORD /d 0 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v fResetBroken /t REG_DWORD /d 1 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v MaxConnectionTime /t REG_DWORD /d 10800000 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v RemoteAppLogoffTimeLimit /t REG_DWORD /d 0 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v MaxDisconnectionTime /t REG_DWORD /d 5000 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v MaxIdleTime /t REG_DWORD /d 10800000 /f 

reg add "HKLM\SOFTWARE\Policies\Microsoft\Windows NT\Terminal Services" /v fEnableTimeZoneRedirection /t REG_DWORD /d 1 /f 

reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\StorageSense\Parameters\StoragePolicy" /v 01 /t REG_DWORD /d 0 /f </pre>
</div>

### Creating a Template Image {#9-creating-a-template-image}

Now that we have a VM that's ready to go let's create a template of it! Using this method, the tool creates a temporary VM and creates an image based off that temporary VM. Once it's done the temporary VM is deleted and you're left with your original VM and a template image. This is great because if we want to go back and apply updates to the applications or windows itself we can boot up the original VM apply our changes and make a new template image from it.

  1. Open WVD Admin tool
  2. Select Reload all
  3. Expand the Azure tab
  4. Expand your Virtual machines
  5. Expand your Resource groups
  6. Right click on the VM we want to create a template of
  7. Select Create a template image
  8. On the left-hand side you'll want to give the Image a name or keep what's defaulted
  9. Make sure the Template VM is the one you selected
 10. Target RG should be the resource group where you want this template to live in my case I keep them in my MasterVMS resource group
 11. Script path is going to be the full path name where we have the 3 configuration files we added to our share earlier (EX: \\Server.Contoso.com\Confiration\WVD
 12. Select Capture
 13. This process takes on average about 10 minutes

### Creating a host pool

<img loading="lazy" width="533" height="300" class="wp-image-648" style="width: 350px;" src="https://sysmansquad.com/wp-content/uploads/2020/01/giphy.gif" alt="" />  
Now that we have a template image, we are ready to create the host pool! 

  1. Navigate to your Tenant name on the left-hand side
  2. Right click on your tenant 
  3. You will have 2 options one being Shared the other being Persistent/VDI in this scenario we are going to select Shared
  4. Select a name for the resource. In my case I'll call it AutoCAD
  5. Navigate back to Azure and expand Images
  6. Expand your Resource Groups 
  7. Right click the image that we created earlier 
  8. Select Create a session host from image
  9. Your screen at this point should look like this:<img loading="lazy" width="555" height="463" class="wp-image-649" style="width: 500px;" src="https://sysmansquad.com/wp-content/uploads/2020/01/mstsc_dJ47TcxRQX.png" alt="" srcset="https:/wp-content/uploads/2020/01/mstsc_dJ47TcxRQX.png 555w, https:/wp-content/uploads/2020/01/mstsc_dJ47TcxRQX-300x250.png 300w, https:/wp-content/uploads/2020/01/mstsc_dJ47TcxRQX-100x83.png 100w" sizes="(max-width: 555px) 100vw, 555px" />
 10. First we can apply a VM Name. You'll notice at the end we have ###, this will auto number the VM based on the Count to the right so if I have a count of two it will create two VMs in the host pool called WVD-PROD-001 and WVD-PROD-002
 11. We will select our Image 
 12. Select the host pool we created at the beginning of these steps
 13. Select your subnet
 14. Select the resource group you'd like these servers to live in (EX I'll be using the resource group we created earlier DOMAIN-AutoCAD-HostPool )
 15. Select your Disk and Size in my case I use PremiumLRS or UltraSSDLRS
 16. For Size I usually go with Standard B4ms however this will vary on the app and will take some testing to properly size
 17. Domain User and Password should be pretty straight forward, in this case since we are using Azure AD DS we use the full email address and password of someone who's allowed to domain join a machine
 18. You will want to check the License as Windows Client checkbox if you meet the licensing requirements listed earlier in this post as it will save you roughly 40% on VM costs \***
 19. OU should be set to the OU you'd like the machine joined too; in this case I will be selecting the Azure AD DC Computers OU located on my Azure AD DS
 20. Domain FQDN should be straight forward simply put your domain name (EX contoso.com)
 21. Local admin and password will be the local administrator account on the newly created VMs
 22. Script path should be set to the same path as when we created an image template (EX: \\Server.Contoso.com\Confiration\WVD)
 23. Select Start Rollout
 24. The time for this can vary based on machine size and number of machines 
 25. Once completed, you will be able to go to the resource you created under your tenant and see the Session Hosts

\*** Note that if you are using forced tunneling in your environment that your activation will fail. See the following links for more details:

  * [Forced Tunneling](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-forced-tunneling-rm)
  * [Failed KMS Activation](https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/custom-routes-enable-kms-activation)

### Assigning Groups and Access

Now that we have a host-pool we can start assigning access to them. On the resource we created earlier under our tenant in the WVD Admin application you should be able to see the session hosts that we just made. You'll also notice that a tab called Host Pool opens up.  
<img loading="lazy" width="556" height="460" class="wp-image-650" style="width: 500px;" src="https://sysmansquad.com/wp-content/uploads/2020/01/mstsc_8jOwEORRJs.png" alt="" srcset="https:/wp-content/uploads/2020/01/mstsc_8jOwEORRJs.png 556w, https:/wp-content/uploads/2020/01/mstsc_8jOwEORRJs-300x248.png 300w, https:/wp-content/uploads/2020/01/mstsc_8jOwEORRJs-100x83.png 100w" sizes="(max-width: 556px) 100vw, 556px" /> 

From here we can change several things; the two important ones being the Max Session Limit and Load Balancer Type. Max Session limit should be pretty straight forward, how many sessions can each VM in the Session host accept. Load Balancer Type gives you three options:

  1. Breadth First - Users will be evenly spread out across all the VMs in the host pool 
  2. Depth First - Users will be loaded up onto the first VM until the max session limit is reached and then loaded onto the next
  3. Persistent - When a user signs in for the first time they will always logon to the same VM in the pool  
    

In my experience Breath First is the one to go with as it will cause the least amount of hiccups performance wise, it's also selected by default. 

Now that we have that set, we have two options on the type of groups we can create:

  1. Application Groups - This grants access to a specific app and not the entire environment, if you are using the Remote Desktop application these apps will appear as if they are native apps on the machine
  2. Desktop Group - This will grant users to a full windows environment with all apps installed on the machine

In this scenario we will create an application group as a Desktop group is very straight forward

  1. Select the resource that contains your session Hosts
  2. Right click and select Add Application Group
  3. Give the group a name (EX AutoCAD)
  4. Right click the newly created group and select Add Remote Application
  5. Give it a name as well (EX Revit):<img loading="lazy" width="554" height="464" class="wp-image-651" style="width: 500px;" src="https://sysmansquad.com/wp-content/uploads/2020/01/mstsc_uuyZLfch9A.png" alt="" srcset="https:/wp-content/uploads/2020/01/mstsc_uuyZLfch9A.png 554w, https:/wp-content/uploads/2020/01/mstsc_uuyZLfch9A-300x251.png 300w, https:/wp-content/uploads/2020/01/mstsc_uuyZLfch9A-100x84.png 100w" sizes="(max-width: 554px) 100vw, 554px" />
  6. I personally set CLI settings to DoNotAllow because I'm not passing any Azure CLI commands to these VMs (More info can be found [HERE](https://docs.microsoft.com/en-us/cli/azure/?view=azure-cli-latest))
  7. File Path will be the path to the EXE that you should have copied down earlier when installing your applications, you can also set Icon Path to this as well
  8. If you want the app to appear in a folder you can give it a folder name, but I personally do not
  9. Friendly name is the name the app will appear as in the web feed or remote desktop application
 10. Select Save Changes

We are almost there! Take a minute to breathe or grab a drink!  
<img loading="lazy" width="480" height="270" class="wp-image-652" style="width: 350px;" src="https://sysmansquad.com/wp-content/uploads/2020/01/giphy-1.gif" alt="" /> 

Next, we are going to assign access to the application group we made. Currently in WVD we have to do manual assignments... it does not support groups but will in the future.

  1. Go to the application group we created (EX AutoCAD)
  2. You will notice under the App Group tab there is a blank box on the right-hand side
  3. Right click in that box and select Add
  4. Type in the users who need access to these apps (EX Joe@contoso.com; mary@contoso.com)
  5. Select Ok
  6. Right clicking and selecting refresh will show you the users who currently have access  
    You did it you're done! Aside from having to test said applications!

To access these apps you can use one of the following:

[Remote Desktop Client](http://aka.ms/wvd/clients/windows)
[Remote Desktop Web client](https://rdweb.wvd.microsoft.com/webclient/index.html)

I strongly recommend using the Remote Desktop Client option as the second just loads the app in a webpage. Once downloaded and installed you can subscribe with the user you granted access to and you should see the applications that were granted. If you double click on the app you will be prompted to sign in (Currently SSO only works with ADFS this will change in the future). The first sign in will be a little slower as it's creating a profile for the user in the background. This can be alleviated with solutions such as [FSLogix](https://docs.microsoft.com/en-us/fslogix/overview) which is very easy to setup. In any event we are done and you're now the proud owner of a WVD environment.
