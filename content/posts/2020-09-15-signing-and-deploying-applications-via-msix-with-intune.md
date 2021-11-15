---
title: Signing and Deploying Applications via MSIX with Intune
author: Jake Shackelford
type: post
date: 2020-09-15T17:22:10+00:00
url: /2020/09/15/signing-and-deploying-applications-via-msix-with-intune/
featured_image: /wp-content/uploads/2020/09/vmconnect_1eSsb6FTKd-100x92.png
categories:
  - Endpoint Management
tags:
  - Apps
  - Intune
  - MSIX
  - Windows 10

---
 

### Why would I want to use MSIX and what is it?

[MSIX is a Windows app package format that provides a modern packaging experience to all Windows apps. The MSIX package format preserves the functionality of existing app packages and/or install files in addition to enabling new, modern packaging and deployment features to Win32, WPF, and Windows Forms apps.](https://docs.microsoft.com/en-us/windows/msix/overview#:~:text=MSIX%20is%20a%20Windows%20app,WPF%2C%20and%20Windows%20Forms%20apps.)

Do you have a bloated application? Maybe one or two that are so old it doesn't even have any install parameters? Maybe you have a massive application that is a pain to deploy?

Well MSIX might be for you! Wrapping your app with MSIX sounds fine and dandy however you need to also create a certificate otherwise you won't be able to deploy the app properly. I'll walk you through the setup from start to finish.

### Prerequisites

[Microsoft Store for Business configured](https://sysmansquad.com/2020/01/27/intune-autopilot-setup-companion-guide-part-2-windows-store-for-business/)  
-The first person to sign in to Microsoft Store for Business must be a Global Admin of the Azure Active Directory (AD) tenant. Once the Global Admin has signed in, they can give permissions to others employees.  
  
A machine that can run Hyper-V

### Getting your certificate and deploying it

The reason we need to get a certificate is to make the app a trusted one. Once we have this in place the app will go from Untrusted to Trusted like the picture below  
![](https://sysmansquad.com/wp-content/uploads/2020/09/vmconnect_1eSsb6FTKd.png) 

  1. Log in to [Microsoft Store for Business](https://businessstore.microsoft.com/en-us/store?signin=)
  2. Select **Manage**
  3. Select **Settings**
  4. Select **Devices**
  5. Select **Download** on Download your organization's root certificate file for use with Device Guard![](https://sysmansquad.com/wp-content/uploads/2020/09/msedge_5t3OJ6orOw.png) 

You will need to deploy this certificate to any machine that you want to install the app on so let's create the Intune Configuration Profile for it

  1. Log in to [Device Management](https://devicemanagement.microsoft.com/)
  2. Select **Devices**
  3. Select **Configuration Profiles**
  4. Select **Create Profile**
  5. Select **Windows 10 and later**
  6. Select **Trusted Certificate**
  7. Select **Create**
  8. Give the certificate profile a name
  9. Select **Next**
 10. Browse to your certificate file 
 11. Select **Next**
 12. Assign to any group that needs to install the application
 13. Select **Next**
 14. Select **Next**
 15. Select **Create**

Now you have the certificate and it's deployed to your users/devices! Lets get to packaging our apps!

### Creating your packaging environment

  1. Launch Hyper-V Manager
  2. Select **Quick Create...**
  3. Select **MSIX Packaging Tool Environment**
  4. Select **Create Virtual Machine**

This will start the creation process of your image. It will take some time to download and setup. Once setup I strongly recommend right clicking the Virtual machine and Checkpointing it if you want to do multiple apps.

### Packaging your app

  1. Launch the MSIX Packaging Tool on the Virtual machine
  2. Select environment - Leave default and select **Next**
  3. Prepare computer - Select **Next**
  4. Select Installer - Browse to your installer EXE 
      1. Specify install arguments if you'd like (Optional)
      2. Signing Preference should be set to Sign with Device Guard Signing 
      3. Select the **Sign in with Microsoft** button (Sign in with an admin account)
      4. Select Next
  5. Package Information - Fill in all required fields and select Next
  6. Installation - Your app will begin to install, run through the installation and select **Next**
  7. First Launch Tasks - Select **Next**
      1. Select **Yes, Move on**
  8. Services report - Select **Next**
  9. Create package - Select **Create**
 10. Select **Close** to the popup

### Adding your MSIX to Intune

  1. Log in to [Device Management](https://devicemanagement.microsoft.com/)
  2. Select **Apps**
  3. Select **Windows**
  4. Select **Add**
  5. App type set to **Line-of-business app**
  6. Select **Select**
  7. Select the MSIX Package we created
  8. Verify that all the information looks correct and add a Logo if desired
  9. Select **Next**
 10. Add User/Device assignments
 11. Select **Next**
 12. Select **Create**

Congrats! You have a deployed app now! I strongly recommend rebooting the machine after the certificate is deployed and then attempting the installation but you should be all set!<figure class="wp-block-image size-large">

![](https://sysmansquad.com/wp-content/uploads/2020/01/giphy-2.gif) </figure>
