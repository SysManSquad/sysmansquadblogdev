---
title: Where is the report’s data??
author: Kevin Crouch
type: post
date: 2021-05-16T03:21:09+00:00
url: /2021/05/15/where-is-the-reports-data/
featured_image: /wp-content/uploads/2021/05/wordcloud_api_graph-3-100x39.png
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
        <a href="#introduction">Introduction</a><li class="uagb-toc__list">
          <a href="#so-wandering-api-endpoint-hell">So, wandering API Endpoint Hell?</a><li class="uagb-toc__list">
            <a href="#watching-how-the-portal-works">Watching how the Portal works</a><li class="uagb-toc__list">
              <a href="#using-the-documentation">Using the Documentation</a><li class="uagb-toc__list">
                <a href="#getting-a-token-for-your-api-calls">Getting a token for your API calls</a><li class="uagb-toc__list">
                  <a href="#another-example-with-a-less-common-api">Another Example with a Less Common API</a><ul class="uagb-toc__list">
                    <li class="uagb-toc__list">
                      <a href="#ok-so-what-api-is-it-using">OK - so what API IS it using?</a><ul class="uagb-toc__list">
                        <li class="uagb-toc__list">
                          <a href="#finding-your-token">Finding your Token</a><li class="uagb-toc__list">
                            <li class="uagb-toc__list">
                              <a href="#decoding-your-token">Decoding your Token</a>
                            </li></ul>
                          </li></ul>
                        </li>
                        <li class="uagb-toc__list">
                          <a href="#useful-tools-microsofts-jwt-decoder">Useful Tools: Microsoft's JWT Decoder</a><li class="uagb-toc__list">
                            <a href="#useful-tools-api-explorer-websites">Useful Tools: API Explorer websites</a><li class="uagb-toc__list">
                              <a href="#conclusion">Conclusion</a><ul class="uagb-toc__list">
                                <li class="uagb-toc__list">
                                  <a href="#where-to-find-me">Where to find me</a>
                                </li>
                              </ul>
                            </li></ul>
                          </li></ul></ol> </div> </div> </div> 
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2>
                                Introduction
                              </h2>
                              
                              <p>
                                Take for example this report on a <a href="https://endpoint.microsoft.com/#blade/Microsoft_Intune_Enrollment/UXAnalyticsMenu/proactiveRemediations" target="_blank" rel="noreferrer noopener">Proactive Remediation</a>. I used one of the built in Proactive Remediations for the example, but it could easily be one of our other <a href="https://sysmansquad.com/category/endpoint-management/proactive-remediation/" target="_blank" rel="noreferrer noopener">Proactive Remediation</a> posts, like <a href="https://sysmansquad.com/2020/07/08/dynamic-outlook-email-signature-using-with-intune-endpoint-analytics-proactive-remediations/" target="_blank" rel="noreferrer noopener">Dynamic Outlook Signatures</a>, <a href="https://sysmansquad.com/2020/07/07/intune-autopilot-proactive-remediation/" target="_blank" rel="noreferrer noopener">Building VPN Connections</a>, or <a href="https://sysmansquad.com/2020/07/27/setting-acl-using-intune-endpoint-analytics-proactive-remediations/" target="_blank" rel="noreferrer noopener">Repairing Folder permissions</a>.
                              </p><figure class="wp-block-image alignwide">
                              
                              <img src="https://i.imgur.com/Zffu5T5.png" alt="" /></figure> 
                              
                              <p>
                                This data is generally all exposed by Graph or a similar Microsoft API, it is just a matter of finding the right endpoints.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h2 id="api-endpoint-hell">
                                So, wandering API Endpoint Hell?
                              </h2>
                              
                              <p>
                                You could absolutely go through the docs pages for <a href="https://docs.microsoft.com/en-us/graph/" target="_blank" rel="noreferrer noopener">Microsoft Graph</a> or other APIs and find the <a href="https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta" target="_blank" rel="noreferrer noopener">Get deviceHealthScriptRunSummary</a> - but the Portal is already fetching the information somehow - a lot of times you can just look at how the Portal fetches the information, and do the same thing yourself.
                              </p>
                              
                              <p>
                                Instead or blindly wandering the several levels of API Docs, let's use some of the tools built-in to Modern Browsers like Edge and Google Chrome to observe how the Web Portal fetches the information internally.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2 id="watching-the-portal-work">
                                Watching how the Portal works
                              </h2>
                              
                              <p>
                                First up, let's open the <a href="https://endpoint.microsoft.com/#blade/Microsoft_Intune_Enrollment/UXAnalyticsMenu/proactiveRemediations" target="_blank" rel="noreferrer noopener">Proactive Remediations area</a> and navigate down to the <strong>Restart stopped Office C2R svc</strong>.
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
                                      If there are still a lot of entries, Filtering to <strong>XHR</strong> type can be useful
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
                              
                              <img loading="lazy" width="1024" height="584" src="https://sysmansquad.com/wp-content/uploads/2021/05/image-1024x584.png" alt="" class="wp-image-2744" srcset="https:/wp-content/uploads/2021/05/image-1024x584.png 1024w, https:/wp-content/uploads/2021/05/image-300x171.png 300w, https:/wp-content/uploads/2021/05/image-768x438.png 768w, https:/wp-content/uploads/2021/05/image-100x57.png 100w, https:/wp-content/uploads/2021/05/image-855x488.png 855w, https:/wp-content/uploads/2021/05/image.png 1103w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure> 
                              
                              <p>
                              </p>
                              
                              <p id="queryURL-example">
                                So, here we can easily see that our URL that the report is referencing is
                              </p>
                              
                              <div class="wp-block-codemirror-blocks-code-block alignwide code-block">
                                <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;webidl&quot;,&quot;mime&quot;:&quot;text/x-webidl&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;QueryURL&quot;,&quot;align&quot;:&quot;wide&quot;,&quot;language&quot;:&quot;Web IDL&quot;,&quot;modeName&quot;:&quot;webidl&quot;}">https://graph.microsoft.com/beta/deviceManagement/deviceHealthScripts/02a4e7e8-195a-4824-8044-08b3a7f2d555/runSummary</pre>
                              </div>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2 id="using-the-documentation">
                                Using the Documentation
                              </h2>
                              
                              <p>
                                So, from our URL - we have three key terms to look up
                              </p>
                              
                              <div class="wp-block-codemirror-blocks-code-block alignwide code-block">
                                <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;webidl&quot;,&quot;mime&quot;:&quot;text/x-webidl&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;align&quot;:&quot;wide&quot;,&quot;language&quot;:&quot;Web IDL&quot;,&quot;modeName&quot;:&quot;webidl&quot;}">https://graph.microsoft.com/beta/deviceManagement/deviceHealthScripts/02a4e7e8-195a-4824-8044-08b3a7f2d555/runSummary</pre>
                              </div>
                              
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
                                In general, the further to the right, the more specific area you are looking for. So here we are doing the action <strong>runSummary</strong> on a specific <strong>deviceHealthScripts</strong>. If you search these up, you can find the MS Graph endpoint <a href="https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta" target="_blank" rel="noreferrer noopener">Get deviceHealthScriptRunSummary</a>.
                              </p>
                              
                              <p>
                                Now, right at the top of that page, it will tell you what API Permissions you need in the <a href="https://docs.microsoft.com/graph/api/intune-devices-devicehealthscriptrunsummary-get?view=graph-rest-beta#prerequisites" target="_blank" rel="noreferrer noopener">Prerequisites section</a>. A screenshot of this node is below.
                              </p><figure class="wp-block-image size-large">
                              
                              <img loading="lazy" width="749" height="370" src="https://sysmansquad.com/wp-content/uploads/2021/05/image-1.png" alt="" class="wp-image-2747" srcset="https:/wp-content/uploads/2021/05/image-1.png 749w, https:/wp-content/uploads/2021/05/image-1-300x148.png 300w, https:/wp-content/uploads/2021/05/image-1-100x49.png 100w" sizes="(max-width: 749px) 100vw, 749px" /></figure>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2 id="getting-a-token">
                                Getting a token for your API calls
                              </h2>
                              
                              <p>
                                Now that we know what Permissions Scopes we need to use, we can work on setting up our access methods to use this information in a script.
                              </p>
                              
                              <p>
                                For simple testing, it is often convenient to just use the <a href="https://developer.microsoft.com/graph/graph-explorer" target="_blank" rel="noreferrer noopener">MS Graph Explorer</a> or other <a href="#api-explorer-sites">API Explorer Sites</a> to test and workshop a query, and you can find more intro to that <a href="https://docs.microsoft.com/graph/graph-explorer/graph-explorer-overview" target="_blank" rel="noreferrer noopener">here</a>, but when you want to automate something with minimal user interaction, a quick and easy way to get a token is through <a href="https://docs.microsoft.com/azure/active-directory/develop/msal-overview" target="_blank" rel="noreferrer noopener">MSAL</a> or the Microsoft Authentication Library.
                              </p>
                              
                              <p id="using-a-token">
                                Since PowerShell is my language of choice, I reach for <a href="https://www.powershellgallery.com/packages/MSAL.PS" target="_blank" rel="noreferrer noopener">MSAL.PS</a>.
                              </p>
                              
                              <p>
                                Here is what a full script to implement the above query might look like
                              </p>
                              
                              <div class="wp-block-codemirror-blocks-code-block alignwide code-block">
                                <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;QueryUserAuthenticationMethods.ps1&quot;,&quot;align&quot;:&quot;wide&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">Install-Module MSAL.PS
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
Invoke-RestMethod -Headers @{Authorization = "Bearer $($Token.AccessToken)"} @QueryParams</pre>
                              </div>
                              
                              <p>
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2>
                                Another Example with a Less Common API
                              </h2>
                              
                              <p>
                                Let's find the <strong><a href="https://portal.azure.com/#blade/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/UserRegistrationDetails/menuId/UserRegistrationDetails" target="_blank" rel="noreferrer noopener">Authentication Methods Registration Detail</a></strong> report data.
                              </p><figure class="wp-block-image alignwide size-large">
                              
                              <img loading="lazy" width="1024" height="376" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-10-1024x376.png" alt="" class="wp-image-2670" srcset="https:/wp-content/uploads/2021/04/image-10-1024x376.png 1024w, https:/wp-content/uploads/2021/04/image-10-300x110.png 300w, https:/wp-content/uploads/2021/04/image-10-768x282.png 768w, https:/wp-content/uploads/2021/04/image-10-100x37.png 100w, https:/wp-content/uploads/2021/04/image-10-855x314.png 855w, https:/wp-content/uploads/2021/04/image-10-1234x453.png 1234w, https:/wp-content/uploads/2021/04/image-10.png 1328w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure> 
                              
                              <p>
                                We go through the same DevTools process that we outlined above in <strong><a href="#watching-the-portal-work" target="_blank" rel="noreferrer noopener">Watching How the Portal Works</a></strong>.
                              </p><figure class="wp-block-image alignwide">
                              
                              <img src="https://sysmansquad.com/wp-content/uploads/2021/04/image-11.png" alt="This image has an empty alt attribute; its file name is image-11.png" /></figure> 
                              
                              <p>
                                This gives us the Query URL below.
                              </p>
                              
                              <div class="wp-block-codemirror-blocks-code-block alignwide code-block">
                                <pre class="CodeMirror" data-setting="{&quot;mode&quot;:&quot;powershell&quot;,&quot;mime&quot;:&quot;application/x-powershell&quot;,&quot;theme&quot;:&quot;default&quot;,&quot;lineNumbers&quot;:true,&quot;styleActiveLine&quot;:true,&quot;lineWrapping&quot;:true,&quot;readOnly&quot;:false,&quot;fileName&quot;:&quot;QueryURL&quot;,&quot;align&quot;:&quot;wide&quot;,&quot;language&quot;:&quot;PowerShell&quot;,&quot;modeName&quot;:&quot;powershell&quot;}">https://graph.windows.net/myorganization/activities/authenticationMethodUserDetails?$orderby=userPrincipalName%20asc&api-version=beta</pre>
                              </div>
                              
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
                                        <a href="https://docs.microsoft.com/graph/overview" target="_blank" rel="noreferrer noopener">Microsoft Graph APIs</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/microsoft-365/security/defender/api-overview" target="_blank" rel="noreferrer noopener">Microsoft 365 Defender APIs</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/rest/api/azure/" target="_blank" rel="noreferrer noopener">Azure REST APIs</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/dynamics-nav/fin-graph" target="_blank" rel="noreferrer noopener">Dynamics APIs</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/en-us/mem/intune/developer/intune-graph-apis" target="_blank" rel="noreferrer noopener">Intune API</a>
                                      </li>
                                      <li>
                                        <a href="https://msdn.microsoft.com/office-365/office-365-management-activity-api-reference" target="_blank" rel="noreferrer noopener">Office 365 Management APIs</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/azure/information-protection/develop/developers-guide" target="_blank" rel="noreferrer noopener">Azure Rights Management SDK</a>
                                      </li>
                                      <li>
                                        <a href="https://docs.microsoft.com/rest/api/storagerp/" target="_blank" rel="noreferrer noopener">Azure Storage Resource API</a>
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
                                    <figure class="wp-block-image size-large"><img loading="lazy" width="510" height="536" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-12.png" alt="" class="wp-image-2672" srcset="https:/wp-content/uploads/2021/04/image-12.png 510w, https:/wp-content/uploads/2021/04/image-12-285x300.png 285w, https:/wp-content/uploads/2021/04/image-12-100x105.png 100w" sizes="(max-width: 510px) 100vw, 510px" /></figure>
                                  </div>
                                </div>
                              </div></section> 
                              
                              <p>
                                In general terms <a href="https://docs.microsoft.com/graph/overview" target="_blank" rel="noreferrer noopener">Microsoft Graph</a> is the main one and is slowly replacing some of the others to consolidate into one large API.
                              </p>
                              
                              <p>
                                However, this example above references <strong>graph.windows.net</strong> - which I know means it is using the <a href="https://docs.microsoft.com/azure/active-directory/develop/active-directory-graph-api" target="_blank" rel="noreferrer noopener">Legacy Azure AD Graph</a>. Now this is currently supported, but is actually already recommending to <a href="https://go.microsoft.com/fwlink/?linkid=2132805" target="_blank" rel="noreferrer noopener">migrate to Microsoft Graph</a>. For this example, I am focusing on recreating what the Portal is actively doing, so I won't look at the Microsoft Graph equivalent here (though it looks like this might be fairly similar - <a href="https://docs.microsoft.com/graph/api/reportroot-list-credentialuserregistrationdetails" target="_blank" rel="noreferrer noopener">credentialUserRegistrationDetails</a>)
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h3 id="what-api-is-it">
                                OK - so what API <em>IS</em> it using?
                              </h3>
                              
                              <p>
                                Well - for the more obscure APIs - this can be a bit hard to find, and so hard to look up documentation for. Sometimes, there just isn't really public documentation for it.
                              </p>
                              
                              <p>
                                If you are stuck trying to figure out what you are using, some very useful information can be gathered from your <strong>Bearer Token</strong>. But first, we need to get one.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h4 id="finding-your-token">
                                Finding your Token
                              </h4>
                              
                              <p>
                                Now, you can get tokens lots of ways, like <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-overview" target="_blank" rel="noreferrer noopener">MSAL</a>, a number of <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/authentication-flows-app-scenarios" target="_blank" rel="noreferrer noopener">assorted Authentication Flows</a>, but we're watching the portal right now, and we already logged in. If we jump back to our F12 DevTools > Network Tab - we can click on the entry we found before in <a href="#watching-the-portal-work">this section</a>, open the <strong>Headers</strong> > Scroll to the <strong>Request Headers</strong> section > <strong>Authorization</strong>
                              </p>
                              
                              <p>
                                This will give you a big beautiful base64 <strong>Bearer </strong>blob, which is how the Portal authenticates for it's API calls in the background. You just have to de-crumple it into a usable state.
                              </p>
                              
                              <div class="wp-block-image">
                                <figure class="aligncenter size-large is-resized"><img loading="lazy" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-14-edited.png" alt="" class="wp-image-2675" width="516" height="386" /></figure>
                              </div>
                            </div>
                          </div>
                          
                          <p>
                          </p>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h4 id="decoding-your-token">
                                Decoding your Token
                              </h4>
                              
                              <p>
                                Now, usually when you get a token for these APIs, it is a <strong>Bearer</strong> token and a <strong>JSON Web Token</strong> or <strong>JWT</strong>. Now JWT's are an excellent and open standard you can read more about <a href="https://jwt.io/" target="_blank" rel="noreferrer noopener">here</a>, but the short version is that inside this big beautiful base64 blob are three parts.
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
                                The <strong>Bearer</strong> at the beginning just references the type of token, but everything bolded below is one big chunk with all three parts. Well - if you want you can run it through a <a href="https://www.base64decode.org/" target="_blank" rel="noreferrer noopener">Base64Decoder</a> - but the Signature part at the end comes out looking like random high ASCII.
                              </p>
                              
                              <pre id="bearer-example" class="wp-block-preformatted">Bearer&nbsp;<strong>e01lc3NhZ2U6ICJEaWQgeW91IHRoaW5rIHRoaXMgd2FzIGdvaW5nIHRvIGhhdmUgYW4gYWN0dWFsIHJlYWwgdG9rZW4gaW4gaXQ/IEhhISAKV2VsbCBhcyBsb25nIGFzIHlvdSdyZSBoZXJlIC0gV2hhdCBpcyB5b3VyIGZhdm9yaXRlIGNvbG9yPyBPaC4uLiBobW1tLi4uIEkgd29uJ3QgcmVhbGx5IHNlZSB5b3VyIHJlc3BvbnNlIGhlcmUuIERhbW4uIFdlbGwgLSB0aGUgYmVzdCB3YXkgdG8gY2hhdCB3aXRoIG1lIGlzIHRvIGNvbWUgYnkgdGhlIFdpbkFkbWlucyBEaXNjb3JkLiBZb3UgY2FuIGdldCBhbiBpbnZpdGUgb3ZlciBoZXJlIGh0dHBzOi8vd2luYWRtaW5zLmlvL2Rpc2NvcmQgLiBDb21lIG9uIGJ5IHNvbWV0aW1lLCBhbmQgZmVlbCBmcmVlIHRvIHRhZyBtZSBhdCBAUHN5Y2hvRGF0YSBhbmQgdGVsbCBtZSB5b3VyIGZhdm9yaXRlIGNvbG9yISAKCkJldHRlciB5ZXQsIHNvbWV0aGluZyBmdW4uLi4uLiB0ZWxsIG1lIHlvdSBmb3VuZCBteSBsb3N0IHNvY2shIEl0IHdpbGwgY29uZnVzZSBldmVyeW9uZSBlbHNlIGFuZCBiZSBsb3RzIG9mIGdvb2QgZnVuISAKCldlbGwsIEknbSBhYm91dCBvdXQgb2YgdGhpbmdzIHRvIHJhbWJsZSBhYm91dC4uLiBTby4uIHVoaCBibHVyLXBsZT8gTW9udGdvbWVyeS4gVHVybnBpa2UuIFRoYXQncyBhbGwgSSBoYXZlIHNvIGhvcGUgdG8gY2hhdCBpbiBEaXNjb3JkIHNvbWUgdGltZSEiIH0KJeGIadj0TKLmjz_kgjH0byyuyGZA0CSRQDOP3tbP27tGoERHMQcyyWxv1J0ZtCDbAC7OWRQdxsf6YmcgKNmvyWCZDac2p6e2HGf9ZESfOCj6iFIQBR05FvByqudE_tPZlQgQk0wotkr3oQoxJQ</strong></pre>
                              
                              <p>
                                However, there are services that know how to gracefully decode all the Microsoft Style bits and bobs. There is one public JWT decoder that you can paste your token into <a href="https://jwt.io/#debugger-io" target="_blank" rel="noreferrer noopener">here</a>, but Microsoft actually runs one of their own, and it will automatically identify the issuer of certain types of the tokens as well.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group alignwide">
                            <div class="wp-block-group__inner-container">
                              <h2 id="jwt-decoder">
                                Useful Tools: Microsoft's JWT Decoder
                              </h2>
                              
                              <p class="has-text-align-center">
                                <a href="https://jwt.ms" target="_blank" rel="noreferrer noopener">jwt.ms</a>
                              </p>
                              
                              <p>
                                The tool is very simple to use. Just paste your token (from a <a href="#finding-your-token">browser session</a> or a token you <a href="#getting-a-token">fetched yourself</a>) in the top of the page, and it is decoded on the bottom half.
                              </p>
                              
                              <p>
                                This will also split out the different sections for you, and let you see helpful information like
                              </p><figure class="wp-block-image alignwide size-large">
                              
                              <img loading="lazy" width="1024" height="572" src="https://sysmansquad.com/wp-content/uploads/2021/04/image-13-1024x572.png" alt="" class="wp-image-2673" srcset="https:/wp-content/uploads/2021/04/image-13-1024x572.png 1024w, https:/wp-content/uploads/2021/04/image-13-300x168.png 300w, https:/wp-content/uploads/2021/04/image-13-768x429.png 768w, https:/wp-content/uploads/2021/04/image-13-100x56.png 100w, https:/wp-content/uploads/2021/04/image-13-855x478.png 855w, https:/wp-content/uploads/2021/04/image-13.png 1026w" sizes="(max-width: 1024px) 100vw, 1024px" /></figure> <figure class="wp-block-image size-large"><img loading="lazy" width="94" height="85" src="https://sysmansquad.com/wp-content/uploads/2021/05/image-2.png" alt="" class="wp-image-2758" /></figure> 
                              
                              <ul>
                                <li>
                                  what scopes (<strong>scp</strong>) you have issued <ul>
                                    <li>
                                      These are roughly equivalent to the permissions that you are requesting to use
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  from what issuer (<strong>iss</strong>) <ul>
                                    <li>
                                      This is the authority that issued a token. Most times you will see "STS" which stands for Security Token Service
                                    </li>
                                    <li>
                                      This often relates to the tenant that is verifying you for example a issuer of https://sts.windows.net/efff978e-7235-6548-2347-09b768955994/ is issuing the token from tenant ID <strong>efff978e-7235-6548-2347-09b768955994</strong>
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  for what site/service or audience (<strong>aud</strong>) <ul>
                                    <li>
                                      The Audience is often related closely to the API or Service that you are signing into, and is often related to the domain-portion of the Query URL you find in the DevTools Network tab.
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  what tenant ID you authenticated from (<strong>tid</strong>)<ul>
                                    <li>
                                      This often relates to the STS mentioned above
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  the authentication methods for this token (<strong>amr</strong>)<ul>
                                    <li>
                                      This can sometimes be used to tell if someone has entered a password, or especially if the user's session is verified with MFA
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  the expiration timestamp of the token (<strong>exp</strong>)<ul>
                                    <li>
                                      If you are testing, particularly if you got a token manually, your token might have expired on you. The error messages will usually help identify this, but you can pop it into the decoder to check
                                    </li>
                                    <li>
                                      These are given in Epoch time, and for one-off I would use <a href="https://www.epochconverter.com/" target="_blank" rel="noreferrer noopener nofollow">EpochConverter.com</a> or <a href="https://www.epoch101.com/Powershell#epoch-to-date-powershell" target="_blank" rel="noreferrer noopener">in PowerShell</a>.
                                    </li>
                                  </ul>
                                </li>
                              </ul>
                              
                              <p>
                                A lot of this information can be helpful when you are dealing with some of these <a href="#various-apis">less common APIs</a> besides common Microsoft Graph and when looking for documentation or troubleshooting.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h2 id="api-explorer-sites">
                                Useful Tools: API Explorer websites
                              </h2>
                              
                              <p>
                                Several APIs have explorer websites. Here are several below, and there are probably more, and if you know of some, come by the <a href="https://winadmins.io/discord" target="_blank" rel="noreferrer noopener">WinAdmins Discord</a>, and tag me there <a href="https://discordapp.com/users/264652399824601088" target="_blank" rel="noreferrer noopener">@PsychoData</a> or on <a href="https://twitter.com/psychodata" target="_blank" rel="noreferrer noopener">Twitter @PsychoData</a> to let me know!
                              </p>
                              
                              <ul>
                                <li>
                                  <a href="https://developer.microsoft.com/en-us/graph/graph-explorer" target="_blank" rel="noreferrer noopener">Microsoft Graph Explorer</a>
                                </li>
                                <li>
                                  <a href="https://graphexplorer.azurewebsites.net/#" target="_blank" rel="noreferrer noopener">Azure Graph Explorer</a>
                                </li>
                                <li>
                                  <a href="https://resources.azure.com/" target="_blank" rel="noreferrer noopener">Azure Resource Explorer</a>
                                </li>
                              </ul>
                              
                              <p>
                                You can search for more API and other resources here on this community listing of various <a href="https://msportals.io/" target="_blank" rel="noreferrer noopener">MS Portals</a> - here are a couple searches that may be useful - <a href="https://msportals.io/?search=explorer" target="_blank" rel="noreferrer noopener">Explorer Sites</a> - <a href="https://msportals.io/?search=playground" target="_blank" rel="noreferrer noopener">Playground sites</a>.
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h2>
                                Conclusion
                              </h2>
                              
                              <p>
                                With these processes, we have talked about how you can
                              </p>
                              
                              <ul>
                                <li>
                                  <a href="#watching-the-portal-work">Watch how the Portal is fetching information</a><ul>
                                    <li>
                                      <a href="#finding-your-token">See the tokens that the browser used</a> to fetch the data and
                                    </li>
                                    <li>
                                      <a href="#decoding-your-token">decode the data in them</a>
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Find what APIs & Scopes you need for these reports<ul>
                                    <li>
                                      <a href="http://using-the-documentation">using the</a><a href="#using-the-documentation"> </a><a href="http://using-the-documentation">documentation</a>
                                    </li>
                                    <li>
                                      using the <a href="#decoding-your-token">browser tools</a>
                                    </li>
                                  </ul>
                                </li>
                                
                                <li>
                                  Authenticate to APIs and <a href="#getting-a-token">get your own Bearer tokens</a>
                                </li>
                                <li>
                                  Using a token <a href="#using-a-token">in a script</a> to expand your capabilities
                                </li>
                              </ul>
                              
                              <p>
                                There are thousands of API Endpoints, and they are adding more all the time, with all sorts of detailed information and functions available. What kind of things would you like to find out how the Portal Web-UI does?
                              </p>
                            </div>
                          </div>
                          
                          <div class="wp-block-group">
                            <div class="wp-block-group__inner-container">
                              <h4>
                                Where to find me
                              </h4>
                              
                              <div class="wp-block-columns are-vertically-aligned-center">
                                <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:66.66%">
                                  <p>
                                    If you have questions, are having problems, or just want to chat over something, you can leave a comment below or reach me on the&nbsp;<a href="https://discord.com/invite/winadmins" target="_blank" rel="noreferrer noopener">WinAdmins Discord</a>&nbsp;at&nbsp;<a href="https://discordapp.com/users/264652399824601088">@PsychoData</a>
                                  </p>
                                </div>
                                
                                <div class="wp-block-column is-vertically-aligned-center" style="flex-basis:33.33%">
                                  <div class="wp-block-buttons">
                                    <div class="wp-block-button is-style-fill">
                                      <a class="wp-block-button__link" href="https://discord.com/invite/winadmins" target="_blank" rel="noreferrer noopener">WinAdmins Discord</a>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>