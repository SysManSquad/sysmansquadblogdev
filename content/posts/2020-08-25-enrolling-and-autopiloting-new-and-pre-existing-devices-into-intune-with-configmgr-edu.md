---
title: Enrolling and Autopiloting New and Pre-existing Devices into Intune with ConfigMgr – EDU
author: Andrew Arsenault
type: post
date: 2020-08-25T15:45:46+00:00
url: /2020/08/25/enrolling-and-autopiloting-new-and-pre-existing-devices-into-intune-with-configmgr-edu/
categories:
  - Endpoint Management

---
Months after we issued students and faculty 600+ unmanaged off the shelf laptops (no AD, no Azure AD, no Intune, no ConfigMgr) to get them off and running temporarily during this pandemic, my co-worker and I were tasked with figuring out how to bring these machines under some form of management. We did not have these machines in ConfigMgr or have the hardware hashes uploaded into Intune, so we had some work ahead of us. Ultimately, we decided to re-image the devices using a ConfigMgr task sequence which also enrolls them into Autopilot. This allows us to remotely manage the device and wipe it after being used by a student.

I created a ConfigMgr PXE task sequence that with minimal intervention, will "reimage" the device to whatever version of Win 10 you choose (we use 1909 for now). It copies the AutopilotConfigurationFile.JSON and then resets the machine, ultimately bringing you to a login screen where any user with permissions can provision the device. The device will then bring down any policies and convert to Autopilot and you are off and running with an Intune managed device. Let's walk through the steps!

**Disclaimer:** This blog assumes you have a working knowledge of ConfigMgr and Endpoint Manager Admin Center (MEMAC), and have administrative rights to your Intune Tenant.

First off we will prepare the Autopilot Profile and download the config JSON 

In MEMAC, navigate to the "Windows Autopilot deployment profiles" blade, and create a new Autopilot profile, call this whatever you want. The only basic setting we are worried about is the "Convert all targeted devices to Autopilot", set this to Yes. Next we will set the OOBE settings to the following (Note: the "Enter a name" option can be whatever you want to name your devices, this is important as we will use this to target the Autopilot profile post image): <figure class="wp-block-image size-large">

<img loading="lazy" width="436" height="334" src="https://sysmansquad.com/wp-content/uploads/2020/08/image.png" alt="" class="wp-image-1505" srcset="https:/wp-content/uploads/2020/08/image.png 436w, https:/wp-content/uploads/2020/08/image-300x230.png 300w, https:/wp-content/uploads/2020/08/image-100x77.png 100w" sizes="(max-width: 436px) 100vw, 436px" /> </figure> 

For now we will not assign this to a group, this comes later.

Next we are going to pull down this config into a file called AutopilotConfigurationFile.JSON. In powershell run the following commands:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Install-Module WindowsAutopilotIntune -Force
Connect-MSGraph</pre>
</div>

Sign into your tenant here and back in powershell run the following command:

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Get-AutopilotProfile | ConvertTo-AutopilotConfigurationJSON | Out-File c:\Autopilot\AutopilotConfigurationFile.json -Encoding ASCII</pre>
</div>

Save this file in a folder by itself on a share somewhere that ConfigMgr has access to.

Next we head into ConfigMgr and create a new package, this package can have any name, but make sure you check the box "This package contains source files" and point it to the folder that houses your config file. On the following page, select "Do not create a program". Distribute this package to any DP's you will use.

Now, create a new task sequence and select the option for "Deploy Windows Autopilot for Existing Devices". The rest of these options can be default, just select your Windows image you want to use and on the Prepare System for Windows Autopilot screen, select the package that you just created that contains your JSON.

Once the TS is created it should look something like this:<figure class="wp-block-image size-large">

<img loading="lazy" width="284" height="308" src="https://sysmansquad.com/wp-content/uploads/2020/08/image-1.png" alt="" class="wp-image-1508" srcset="https:/wp-content/uploads/2020/08/image-1.png 284w, https:/wp-content/uploads/2020/08/image-1-277x300.png 277w, https:/wp-content/uploads/2020/08/image-1-100x108.png 100w" sizes="(max-width: 284px) 100vw, 284px" /> </figure> 

We are going to make some small changes to this task sequence, when completed, it should look like this:<figure class="wp-block-image size-large">

<img loading="lazy" width="314" height="310" src="https://sysmansquad.com/wp-content/uploads/2020/08/image-3.png" alt="" class="wp-image-1510" srcset="https:/wp-content/uploads/2020/08/image-3.png 314w, https:/wp-content/uploads/2020/08/image-3-300x296.png 300w, https:/wp-content/uploads/2020/08/image-3-100x99.png 100w" sizes="(max-width: 314px) 100vw, 314px" /> <figcaption>The final reboot step reboots to the currently installed operation system </figcaption></figure> 

The step we added "Autopilot for existing devices config file" is a "Run Command Line" and will copy the config JSON from the package we created earlier and place it in the C:\Windows\Provisioning\Autopilot\ folder. It should look something like this:<figure class="wp-block-image size-large">

<img loading="lazy" width="936" height="798" src="https://www.sysmansquad.com/wp-content/uploads/2020/08/image-9.png" alt="" class="wp-image-1574" srcset="https:/wp-content/uploads/2020/08/image-9.png 936w, https:/wp-content/uploads/2020/08/image-9-300x256.png 300w, https:/wp-content/uploads/2020/08/image-9-768x655.png 768w, https:/wp-content/uploads/2020/08/image-9-100x85.png 100w, https:/wp-content/uploads/2020/08/image-9-855x729.png 855w" sizes="(max-width: 936px) 100vw, 936px" /> </figure> 

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;null&quot;,&quot;mime&quot;:&quot;text/plain&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Command Line&quot;,&quot;language&quot;:&quot;Plain Text&quot;,&quot;modeName&quot;:&quot;text&quot;}">cmd.exe /c xcopy AutopilotConfigurationFile.json %OSDTargetSystemDrive%\windows\provisioning\Autopilot\ /c</pre>
</div>

Distribute this content to your DP.

At this point lets head back to MEMAC and create our dynamic device security group that we will be targeting with our AP profile. The dynamic membership rules will be as follows (This is based on my computer naming convention that is in the Autopilot Profile)

<div class="wp-block-codemirror-blocks-code-block code-block">
  <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;null&quot;,&quot;mime&quot;:&quot;text/plain&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;Dynamic Membership Rule&quot;,&quot;language&quot;:&quot;Plain Text&quot;,&quot;modeName&quot;:&quot;text&quot;}">(device.displayName -startsWith "LLP")</pre>
</div>

Once this group is created, navigate to the Deployment Profiles blade that we linked at the beginning of the blog, select your AP profile and under properties, edit the assignments and assign the profile to the newly created dynamic group.

Congrats! Most of the setup is complete at this point, we only have to deploy the new Task Sequence and run it! Back in ConfigMgr deploy your Provisioning TS to "All Unknown Computers" or to a collection if you want to convert already managed machines (there is an easier way to do this that I may blog about later) and PXE boot your device, run the task sequence! After some time (usually 20 min or so) you should be presented with the following screen:<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="767" src="https://sysmansquad.com/wp-content/uploads/2020/08/image-4-1024x767.png" alt="" class="wp-image-1512" srcset="https:/wp-content/uploads/2020/08/image-4-1024x767.png 1024w, https:/wp-content/uploads/2020/08/image-4-300x225.png 300w, https:/wp-content/uploads/2020/08/image-4-768x575.png 768w, https:/wp-content/uploads/2020/08/image-4-100x75.png 100w, https:/wp-content/uploads/2020/08/image-4-855x640.png 855w, https:/wp-content/uploads/2020/08/image-4.png 1026w" sizes="(max-width: 1024px) 100vw, 1024px" /> <figcaption>Choose any options for all of these screens as they will be handled by AutoPilot going forward</figcaption></figure> 

After selecting your defaults, the final screen you should see is your Org login screen.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="773" src="https://sysmansquad.com/wp-content/uploads/2020/08/ap-1024x773.jpg" alt="" class="wp-image-1515" srcset="https:/wp-content/uploads/2020/08/ap-1024x773.jpg 1024w, https:/wp-content/uploads/2020/08/ap-300x227.jpg 300w, https:/wp-content/uploads/2020/08/ap-768x580.jpg 768w, https:/wp-content/uploads/2020/08/ap-100x76.jpg 100w, https:/wp-content/uploads/2020/08/ap-855x646.jpg 855w, https:/wp-content/uploads/2020/08/ap.jpg 1026w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

After another couple of minutes of setup, the provisioning process begins! At this point it will apply any settings that were configured as a part of that Autopilot Profile we set up earlier. 

If you check MEMAC at this stage you should see your newly created device but it won't be named properly yet, and is missing some info.<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="29" src="https://sysmansquad.com/wp-content/uploads/2020/08/image-5-1024x29.png" alt="" class="wp-image-1516" srcset="https:/wp-content/uploads/2020/08/image-5-1024x29.png 1024w, https:/wp-content/uploads/2020/08/image-5-300x8.png 300w, https:/wp-content/uploads/2020/08/image-5-768x22.png 768w, https:/wp-content/uploads/2020/08/image-5-100x3.png 100w, https:/wp-content/uploads/2020/08/image-5-855x24.png 855w, https:/wp-content/uploads/2020/08/image-5-1234x35.png 1234w, https:/wp-content/uploads/2020/08/image-5.png 1416w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

At this point the machine still isn't completely converted, that comes a little later, for now, let the device provision and send you to your desktop.

Once we are at the desktop, take a look in MEMAC, TA-DA!<figure class="wp-block-image size-large">

<img loading="lazy" width="1024" height="24" src="https://sysmansquad.com/wp-content/uploads/2020/08/image-7-1024x24.png" alt="" class="wp-image-1519" srcset="https:/wp-content/uploads/2020/08/image-7-1024x24.png 1024w, https:/wp-content/uploads/2020/08/image-7-300x7.png 300w, https:/wp-content/uploads/2020/08/image-7-768x18.png 768w, https:/wp-content/uploads/2020/08/image-7-100x2.png 100w, https:/wp-content/uploads/2020/08/image-7-855x20.png 855w, https:/wp-content/uploads/2020/08/image-7-1234x29.png 1234w, https:/wp-content/uploads/2020/08/image-7.png 1398w" sizes="(max-width: 1024px) 100vw, 1024px" /> </figure> 

The new device is named according to our AP config file, and is now managed by Intune. If we check the Autopiloted Devices blade we see the following:<figure class="wp-block-image size-large">

<img loading="lazy" width="292" height="817" src="https://sysmansquad.com/wp-content/uploads/2020/08/complete-1.png" alt="" class="wp-image-1521" srcset="https:/wp-content/uploads/2020/08/complete-1.png 292w, https:/wp-content/uploads/2020/08/complete-1-107x300.png 107w, https:/wp-content/uploads/2020/08/complete-1-100x280.png 100w" sizes="(max-width: 292px) 100vw, 292px" /> </figure> 

Your device is now Autopiloted and managed by Intune! You can now reset this device and it will come up with the settings configured in the AP Config JSON.