---
title: Where is the report’s data??
author: Kevin Crouch
type: post
date: 2021-05-16T03:21:09+00:00
url: /2021/05/15/where-is-the-reports-data/
featured_image: wordcloud_api_graph-3.png
categories:
  - Azure
  - Documentation
  - General
  - How-To
  - Microsoft
  - Powershell
  - Proactive Remediation
  - Scripting
tags:
  - Azure
  - azuread
  - Graph
  - GraphAPI
  - MECM
  - Microsoft
  - Office
  - PowerShell
  - PowerShell Module
  - Proactive Remediations
  - productivity

---
Have you ever looked at a report on a Portal Page and wanted to know just _**WHERE**_ the data just came from? 

Well you can - and finding the information can be so easy. Read on below to see how. 

<!--more--><div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-2d668412 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
    
    <span class="uag-toc__collapsible-wrap"> <svg xmlns="https://www.w3.org/2000/svg" viewBox= "0 0 320 512"><path d="M143 352.3L7 216.3c-9.4-9.4-9.4-24.6 0-33.9l22.6-22.6c9.4-9.4 24.6-9.4 33.9 0l96.4 96.4 96.4-96.4c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9l-136 136c-9.2 9.4-24.4 9.4-33.8 0z"></path></svg> </span>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Introduction](#introduction)<li class="uagb-toc__list">
          [So, wandering API Endpoint Hell?](#so-wandering-api-endpoint-hell)<li class="uagb-toc__list">
            [Watching how the Portal works](#watching-how-the-portal-works)<li class="uagb-toc__list">
              [Using the Documentation](#using-the-documentation)<li class="uagb-toc__list">
                [Getting a token for your API calls](#getting-a-token-for-your-api-calls)<li class="uagb-toc__list">
                  [Another Example with a Less Common API](#another-example-with-a-less-common-api)<ul class="uagb-toc__list">
                    <li class="uagb-toc__list">
                      [OK - so what API IS it using?](#ok-so-what-api-is-it-using)<ul class="uagb-toc__list">
                        <li class="uagb-toc__list">
                          [Finding your Token](#finding-your-token)<li class="uagb-toc__list">
                            <li class="uagb-toc__list">
                              [Decoding your Token](#decoding-your-token)
                            </li></ul>
                          </li></ul>
                        </li>
                        <li class="uagb-toc__list">
                          [Useful Tools: Microsoft's JWT Decoder](#useful-tools-microsofts-jwt-decoder)<li class="uagb-toc__list">
                            [Useful Tools: API Explorer websites](#useful-tools-api-explorer-websites)<li class="uagb-toc__list">
                              [Conclusion](#conclusion)<ul class="uagb-toc__list">
                                <li class="uagb-toc__list">
                                  [Where to find me](#where-to-find-me)
                                </li>
                              </ul>
                            </li></ul>
                          </li></ul></ol> </div> </div> </div> 
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              
## Introduction
                              
                              
                              <p>
                                Take for example this report on a [Proactive Remediation](https://endpoint.microsoft.com/#blade/Microsoft_Intune_Enrollment/UXAnalyticsMenu/proactiveRemediations). I used one of the built in Proactive Remediations for the example, but it could easily be one of our other [Proactive Remediation](https://sysmansquad.com/category/endpoint-management/proactive-remediation/) posts, like [Dynamic Outlook Signatures](https://sysmansquad.com/2020/07/08/dynamic-outlook-email-signature-using-with-intune-endpoint-analytics-proactive-remediations/), [Building VPN Connections](https://sysmansquad.com/2020/07/07/intune-autopilot-proactive-remediation/), or [Repairing Folder permissions](https://sysmansquad.com/2020/07/27/setting-acl-using-intune-endpoint-analytics-proactive-remediations/).
                              </p><figure class="wp-block-image alignwide">
                              
                              ![](https://i.imgur.com/Zffu5T5.png)</figure> 
                              
                              <p>
                                This data is generally all exposed by Graph or a similar Microsoft API, it is just a matter of finding the right endpoints.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              ## So, wandering API Endpoint Hell?
                              
                              
                              <p>
                                You could absolutely go through the docs pages for [Microsoft Graph](https://docs.microsoft.com/en-us/graph/) or other APIs and find the [Get deviceHealthScriptRunSummary](https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta) - but the Portal is already fetching the information somehow - a lot of times you can just look at how the Portal fetches the information, and do the same thing yourself.
                              </p>
                              
                              <p>
                                Instead or blindly wandering the several levels of API Docs, let's use some of the tools built-in to Modern Browsers like Edge and Google Chrome to observe how the Web Portal fetches the information internally.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              ## Watching how the Portal works
                              
                              
                              <p>
                                First up, let's open the [Proactive Remediations area](https://endpoint.microsoft.com/#blade/Microsoft_Intune_Enrollment/UXAnalyticsMenu/proactiveRemediations) and navigate down to the **Restart stopped Office C2R svc**.
                              </p>
                              
                              <p>
                                From there we can follow a few steps to observe what the portal does while we load in some information.
                              </p>
                              
                              <ol>
                                <li>
                                  Press F12 to Open DevTools<ul>
                                    <li>
                                      Open DevTools and switch to the Network tab
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Adjust / Check some settings<ul>
                                    <li>
                                      Make sure you are recording
                                    </li>
                                    <li>
                                      Ensure Preserve Log is enabled
                                    </li>
                                    <li>
                                      Disable Cache
                                    </li>
                                    <li>
                                      If there are still a lot of entries, Filtering to **XHR** type can be useful
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Clear the existing history, which often still shows leftover entries from loading the page
                                </li>
                                <li>
                                  Refresh the Report
                                </li>
                                <li>
                                  Report URLs are shown down below in the Log
                                </li>
                              </ol><figure class="wp-block-image alignwide size-large">
                              
                              ![](image-1024x584.png)</figure> 
                              
                              <p>
                              </p>
                              
                              <p id="queryURL-example">
                                So, here we can easily see that our URL that the report is referencing is
                              </p>
                              
                              
```web
https://graph.microsoft.com/beta/deviceManagement/deviceHealthScripts/02a4e7e8-195a-4824-8044-08b3a7f2d555/runSummary
```
                              
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              ## Using the Documentation
                              
                              
                              <p>
                                So, from our URL - we have three key terms to look up
                              </p>
                              
                              
```web
https://graph.microsoft.com/beta/deviceManagement/deviceHealthScripts/02a4e7e8-195a-4824-8044-08b3a7f2d555/runSummary
```
                              
                              
                              <ul>
                                <li>
                                  deviceManagement
                                </li>
                                <li>
                                  deviceHealthScripts
                                </li>
                                <li>
                                  runSummary
                                </li>
                              </ul>
                              
                              <p>
                                In general, the further to the right, the more specific area you are looking for. So here we are doing the action **runSummary** on a specific **deviceHealthScripts**. If you search these up, you can find the MS Graph endpoint [Get deviceHealthScriptRunSummary](https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta).
                              </p>
                              
                              <p>
                                Now, right at the top of that page, it will tell you what API Permissions you need in the [Prerequisites section](https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta#prerequisites). A screenshot of this node is below.
                              </p><figure class="wp-block-image size-large">
                              
                              ![](image-1.png)</figure>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              ## Getting a token for your API calls
                              
                              
                              <p>
                                Now that we know what Permissions Scopes we need to use, we can work on setting up our access methods to use this information in a script.
                              </p>
                              
                              <p>
                                For simple testing, it is often convenient to just use the [MS Graph Explorer](https://developer.microsoft.com/graph/graph-explorer) or other [API Explorer Sites](#api-explorer-sites) to test and workshop a query, and you can find more intro to that [here](https://docs.microsoft.com/graph/graph-explorer/graph-explorer-overview), but when you want to automate something with minimal user interaction, a quick and easy way to get a token is through [MSAL](https://docs.microsoft.com/azure/active-directory/develop/msal-overview) or the Microsoft Authentication Library.
                              </p>
                              
                              <p id="using-a-token">
                                Since PowerShell is my language of choice, I reach for [MSAL.PS](https://www.powershellgallery.com/packages/MSAL.PS).
                              </p>
                              
                              <p>
                                Here is what a full script to implement the above query might look like
                              </p>
                              
                              
```powershell
Install-Module MSAL.PS
$AuthParams =  @{
	ClientID  = $YourAppID
    TenantID  = 'contoso.one' #Also could use the GUID form from decoding your JWT token, like '492d0e46-26b0-475c-82d0-102c962ea477' 
    Scopes    = 'DeviceManagementConfiguration.Read.All'
    LoginHint = 'YourUPN@Contoso.one' 
    }

$Token = Get-MSALToken @AuthParams
    
$QueryParams =  @{
    queryURL = 'https://graph.microsoft.com/beta/deviceManagement/deviceHealthScripts/02a4e7e8-195a-4824-8044-08b3a7f2d555/runSummary'
    Method   = 'GET'
    }
Invoke-RestMethod -Headers @{Authorization = "Bearer $($Token.AccessToken)"} @QueryParams
```
                              
                              
                              <p>
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              
## Another Example with a Less Common API
                              
                              
                              <p>
                                Let's find the **[Authentication Methods Registration Detail](https://portal.azure.com/#blade/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/UserRegistrationDetails/menuId/UserRegistrationDetails)** report data.
                              </p><figure class="wp-block-image alignwide size-large">
                              
                              ![](image-10-1024x376.png)</figure> 
                              
                              <p>
                                We go through the same DevTools process that we outlined above in **[Watching How the Portal Works](#watching-the-portal-work)**.
                              </p><figure class="wp-block-image alignwide">
                              
                              ![This image has an empty alt attribute; its file name is image-11.png](image-11.png)</figure> 
                              
                              <p>
                                This gives us the Query URL below.
                              </p>
                              
                              
```powershell
https://graph.windows.net/myorganization/activities/authenticationMethodUserDetails?$orderby=userPrincipalName%20asc&api-version=beta
```
                              
                              
                              <p>
                                Voila! Well... somewhat. Most people know of Microsoft Graph, but there are other Microsoft APIs that are available. Some variations include:
                              </p><section class="wp-block-uagb-columns uagb-columns__wrap uagb-columns__background-undefined uagb-columns__stack-mobile uagb-columns__valign-undefined uagb-columns__gap-10 alignwide uagb-block-6aff5a46" id="various-apis">
                              
                              <div class="uagb-columns__overlay">
                              </div>
                              
                              <div class="uagb-columns__inner-wrap uagb-columns__columns-2">
                                <div class="wp-block-uagb-column uagb-column__wrap uagb-column__background-undefined uagb-block-bd0858c7">
                                  <div class="uagb-column__overlay">
                                  </div>
                                  
                                  <div class="uagb-column__inner-wrap">
                                    <ul>
                                      <li>
                                        [Microsoft Graph APIs](https://docs.microsoft.com/graph/overview)
                                      </li>
                                      <li>
                                        [Microsoft 365 Defender APIs](https://docs.microsoft.com/microsoft-365/security/defender/api-overview)
                                      </li>
                                      <li>
                                        [Azure REST APIs](https://docs.microsoft.com/rest/api/azure/)
                                      </li>
                                      <li>
                                        [Dynamics APIs](https://docs.microsoft.com/dynamics-nav/fin-graph)
                                      </li>
                                      <li>
                                        [Intune API](https://docs.microsoft.com/en-us/mem/intune/developer/intune-graph-apis)
                                      </li>
                                      <li>
                                        [Office 365 Management APIs](https://msdn.microsoft.com/office-365/office-365-management-activity-api-reference)
                                      </li>
                                      <li>
                                        [Azure Rights Management SDK](https://docs.microsoft.com/azure/information-protection/develop/developers-guide)
                                      </li>
                                      <li>
                                        [Azure Storage Resource API](https://docs.microsoft.com/rest/api/storagerp/)
                                      </li>
                                      <li>
                                        The list could go on for dozens of entries
                                      </li>
                                    </ul>
                                    
                                    <p>
                                    </p>
                                  </div>
                                </div>
                                
                                <div class="wp-block-uagb-column uagb-column__wrap uagb-column__background-undefined uagb-block-e8d1b750">
                                  <div class="uagb-column__overlay">
                                  </div>
                                  
                                  <div class="uagb-column__inner-wrap">
                                    <figure class="wp-block-image size-large">![](image-12.png)</figure>
                                  </div>
                                </div>
                              </div></section> 
                              
                              <p>
                                In general terms [Microsoft Graph](https://docs.microsoft.com/graph/overview) is the main one and is slowly replacing some of the others to consolidate into one large API.
                              </p>
                              
                              <p>
                                However, this example above references **graph.windows.net** - which I know means it is using the [Legacy Azure AD Graph](https://docs.microsoft.com/azure/active-directory/develop/active-directory-graph-api). Now this is currently supported, but is actually already recommending to [migrate to Microsoft Graph](https://go.microsoft.com/fwlink/?linkid=2132805). For this example, I am focusing on recreating what the Portal is actively doing, so I won't look at the Microsoft Graph equivalent here (though it looks like this might be fairly similar - [credentialUserRegistrationDetails](https://docs.microsoft.com/graph/api/reportroot-list-credentialuserregistrationdetails))
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              ### OK - so what API *IS* it using?
                              
                              
                              <p>
                                Well - for the more obscure APIs - this can be a bit hard to find, and so hard to look up documentation for. Sometimes, there just isn't really public documentation for it.
                              </p>
                              
                              <p>
                                If you are stuck trying to figure out what you are using, some very useful information can be gathered from your **Bearer Token**. But first, we need to get one.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              
#### Finding your Token
                              
                              
                              <p>
                                Now, you can get tokens lots of ways, like [MSAL](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview), a number of [assorted Authentication Flows](https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-flows-app-scenarios), but we're watching the portal right now, and we already logged in. If we jump back to our F12 DevTools > Network Tab - we can click on the entry we found before in [this section](#watching-the-portal-work), open the **Headers** > Scroll to the **Request Headers** section > **Authorization**
                              </p>
                              
                              <p>
                                This will give you a big beautiful base64 **Bearer **blob, which is how the Portal authenticates for it's API calls in the background. You just have to de-crumple it into a usable state.
                              </p>
                              
                              <div class="wp-block-image">
                                <figure class="aligncenter size-large is-resized">![](image-14-edited.png)</figure>
                              </div>
                            </div>
                          </div>
                          
                          <p>
                          </p>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              
#### Decoding your Token
                              
                              
                              <p>
                                Now, usually when you get a token for these APIs, it is a **Bearer** token and a **JSON Web Token** or **JWT**. Now JWT's are an excellent and open standard you can read more about [here](https://jwt.io/), but the short version is that inside this big beautiful base64 blob are three parts.
                              </p>
                              
                              <ul>
                                <li>
                                  Header
                                </li>
                                <li>
                                  Claims/Payload
                                </li>
                                <li>
                                  Signature
                                </li>
                              </ul>
                              
                              <p>
                                The **Bearer** at the beginning just references the type of token, but everything bolded below is one big chunk with all three parts. Well - if you want you can run it through a [Base64Decoder](https://www.base64decode.org/) - but the Signature part at the end comes out looking like random high ASCII.
                              </p>
                              
                              <pre id="bearer-example" class="wp-block-preformatted">Bearer**e01lc3NhZ2U6ICJEaWQgeW91IHRoaW5rIHRoaXMgd2FzIGdvaW5nIHRvIGhhdmUgYW4gYWN0dWFsIHJlYWwgdG9rZW4gaW4gaXQ/IEhhISAKV2VsbCBhcyBsb25nIGFzIHlvdSdyZSBoZXJlIC0gV2hhdCBpcyB5b3VyIGZhdm9yaXRlIGNvbG9yPyBPaC4uLiBobW1tLi4uIEkgd29uJ3QgcmVhbGx5IHNlZSB5b3VyIHJlc3BvbnNlIGhlcmUuIERhbW4uIFdlbGwgLSB0aGUgYmVzdCB3YXkgdG8gY2hhdCB3aXRoIG1lIGlzIHRvIGNvbWUgYnkgdGhlIFdpbkFkbWlucyBEaXNjb3JkLiBZb3UgY2FuIGdldCBhbiBpbnZpdGUgb3ZlciBoZXJlIGh0dHBzOi8vd2luYWRtaW5zLmlvL2Rpc2NvcmQgLiBDb21lIG9uIGJ5IHNvbWV0aW1lLCBhbmQgZmVlbCBmcmVlIHRvIHRhZyBtZSBhdCBAUHN5Y2hvRGF0YSBhbmQgdGVsbCBtZSB5b3VyIGZhdm9yaXRlIGNvbG9yISAKCkJldHRlciB5ZXQsIHNvbWV0aGluZyBmdW4uLi4uLiB0ZWxsIG1lIHlvdSBmb3VuZCBteSBsb3N0IHNvY2shIEl0IHdpbGwgY29uZnVzZSBldmVyeW9uZSBlbHNlIGFuZCBiZSBsb3RzIG9mIGdvb2QgZnVuISAKCldlbGwsIEknbSBhYm91dCBvdXQgb2YgdGhpbmdzIHRvIHJhbWJsZSBhYm91dC4uLiBTby4uIHVoaCBibHVyLXBsZT8gTW9udGdvbWVyeS4gVHVybnBpa2UuIFRoYXQncyBhbGwgSSBoYXZlIHNvIGhvcGUgdG8gY2hhdCBpbiBEaXNjb3JkIHNvbWUgdGltZSEiIH0KJeGIadj0TKLmjz_kgjH0byyuyGZA0CSRQDOP3tbP27tGoERHMQcyyWxv1J0ZtCDbAC7OWRQdxsf6YmcgKNmvyWCZDac2p6e2HGf9ZESfOCj6iFIQBR05FvByqudE_tPZlQgQk0wotkr3oQoxJQ**</pre>
                              
                              <p>
                                However, there are services that know how to gracefully decode all the Microsoft Style bits and bobs. There is one public JWT decoder that you can paste your token into [here](https://jwt.io/#debugger-io), but Microsoft actually runs one of their own, and it will automatically identify the issuer of certain types of the tokens as well.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              ## Useful Tools: Microsoft's JWT Decoder
                              
                              
                              
                                [jwt.ms](https://jwt.ms)
                              
                              
                              <p>
                                The tool is very simple to use. Just paste your token (from a [browser session](#finding-your-token) or a token you [fetched yourself](#getting-a-token)) in the top of the page, and it is decoded on the bottom half.
                              </p>
                              
                              <p>
                                This will also split out the different sections for you, and let you see helpful information like
                              </p><figure class="wp-block-image alignwide size-large">
                              
                              ![](image-13-1024x572.png)</figure> <figure class="wp-block-image size-large">![](image-2.png)</figure> 
                              
                              <ul>
                                <li>
                                  what scopes (**scp**) you have issued <ul>
                                    <li>
                                      These are roughly equivalent to the permissions that you are requesting to use
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  from what issuer (**iss**) <ul>
                                    <li>
                                      This is the authority that issued a token. Most times you will see "STS" which stands for Security Token Service
                                    </li>
                                    <li>
                                      This often relates to the tenant that is verifying you for example a issuer of https://sts.windows.net/efff978e-7235-6548-2347-09b768955994/ is issuing the token from tenant ID **efff978e-7235-6548-2347-09b768955994**
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  for what site/service or audience (**aud**) <ul>
                                    <li>
                                      The Audience is often related closely to the API or Service that you are signing into, and is often related to the domain-portion of the Query URL you find in the DevTools Network tab.
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  what tenant ID you authenticated from (**tid**)<ul>
                                    <li>
                                      This often relates to the STS mentioned above
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  the authentication methods for this token (**amr**)<ul>
                                    <li>
                                      This can sometimes be used to tell if someone has entered a password, or especially if the user's session is verified with MFA
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  the expiration timestamp of the token (**exp**)<ul>
                                    <li>
                                      If you are testing, particularly if you got a token manually, your token might have expired on you. The error messages will usually help identify this, but you can pop it into the decoder to check
                                    </li>
                                    <li>
                                      These are given in Epoch time, and for one-off I would use [EpochConverter.com](https://www.epochconverter.com/) or [in PowerShell](https://www.epoch101.com/Powershell#epoch-to-date-powershell).
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                              
                              <p>
                                A lot of this information can be helpful when you are dealing with some of these [less common APIs](#various-apis) besides common Microsoft Graph and when looking for documentation or troubleshooting.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              ## Useful Tools: API Explorer websites
                              
                              
                              <p>
                                Several APIs have explorer websites. Here are several below, and there are probably more, and if you know of some, come by the [WinAdmins Discord](https://winadmins.io/discord), and tag me there [@PsychoData](https://discordapp.com/users/264652399824601088) or on [Twitter @PsychoData](https://twitter.com/psychodata) to let me know!
                              </p>
                              
                              <ul>
                                <li>
                                  [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
                                </li>
                                <li>
                                  [Azure Graph Explorer](https://graphexplorer.azurewebsites.net/#)
                                </li>
                                <li>
                                  [Azure Resource Explorer](https://resources.azure.com/)
                                </li>
                              </ul>
                              
                              <p>
                                You can search for more API and other resources here on this community listing of various [MS Portals](https://msportals.io/) - here are a couple searches that may be useful - [Explorer Sites](https://msportals.io/?search=explorer) - [Playground sites](https://msportals.io/?search=playground).
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              
## Conclusion
                              
                              
                              <p>
                                With these processes, we have talked about how you can
                              </p>
                              
                              <ul>
                                <li>
                                  [Watch how the Portal is fetching information](#watching-the-portal-work)<ul>
                                    <li>
                                      [See the tokens that the browser used](#finding-your-token) to fetch the data and
                                    </li>
                                    <li>
                                      [decode the data in them](#decoding-your-token)
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Find what APIs & Scopes you need for these reports<ul>
                                    <li>
                                      [using the](http://using-the-documentation)[ ](#using-the-documentation)[documentation](http://using-the-documentation)
                                    </li>
                                    <li>
                                      using the [browser tools](#decoding-your-token)
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Authenticate to APIs and [get your own Bearer tokens](#getting-a-token)
                                </li>
                                <li>
                                  Using a token [in a script](#using-a-token) to expand your capabilities
                                </li>
                              </ul>
                              
                              <p>
                                There are thousands of API Endpoints, and they are adding more all the time, with all sorts of detailed information and functions available. What kind of things would you like to find out how the Portal Web-UI does?
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              
#### Where to find me
                              
                              
                              <div class="wp-block-columns are-vertically-aligned-center">
                                <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:66.66%">
                                  <p>
                                    If you have questions, are having problems, or just want to chat over something, you can leave a comment below or reach me on the[WinAdmins Discord](https://discord.com/invite/winadmins)at[@PsychoData](https://discordapp.com/users/264652399824601088)
                                  </p>
                                </div>
                                
                                <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:33.33%">
                                  <div class="wp-block-buttons">
                                    <div class="wp-block-button is-style-fill">
                                      [WinAdmins Discord](https://discord.com/invite/winadmins)
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
