---
title: Granting Permission to Request Permission
author: Kevin Crouch
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=2878
categories:
  - Endpoint Management

---
 

Respond to https://pushsecurity.com/blog/consent-phishing-the-emerging-phishing-technique-that-can-bypass-2fa/?utm\_source=reddit-office365&utm\_medium=post&utm_id=078-blogs  
  
Setup Low impact Permissions they are allowed to accept (like "view email address" and essentially account-verification permissions)  
  
https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ConsentPoliciesMenuBlade/Permissions  
  
Change the User Consent to only allow Low Impact permissions without requesting approval.  
  
https://portal.azure.com/#blade/Microsoft\_AAD\_IAM/ConsentPoliciesMenuBlade/UserSettings  
  
  
  
Note: This won't affect existing approved permissions, so you may want to do an audit of those. I would suggest these as a starting point.  
  
(Only covers Delegated/User permissions, not App Permissions)  
  
https://portal.cloudappsecurity.com/#/app-permissions/?permissionLevel=eq(i:2,i:1)&query=eq(5c5681e18e88be83a57bc6ec,)&tab=11161  
  
https://docs.microsoft.com/en-us/cloud-app-security/manage-app-permissions  
  
[Configure the admin consent workflow - Azure Active Directory | Microsoft Docs](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/configure-admin-consent-workflow)
