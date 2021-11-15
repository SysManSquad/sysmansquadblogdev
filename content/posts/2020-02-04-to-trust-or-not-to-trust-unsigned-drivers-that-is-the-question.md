---
title: 'To Trust Or Not To Trust (UNSIGNED DRIVERS): That Is The Question'
author: Chris Thomas
type: post
date: 2020-02-04T06:48:24+00:00
url: /2020/02/04/to-trust-or-not-to-trust-unsigned-drivers-that-is-the-question/
featured_image: /wp-content/uploads/2019/12/driver-removal-04-obs-100x70.png
categories:
  - Documentation
  - Endpoint Management
  - How-To
  - MECM/MEMCM/SCCM

---
 

This post is intended to help others who might want to better understand why their Operating System Deployment (OSD) task sequence (TS) is failing during the **Setup Windows and Configuration Manager** step with an error code of **<a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/TheNotoriousDRR/status/1163132463843106818" target="_blank">0x80004005</a>** and how to identify the unsigned drivers in your driver package that might be causing it. Maybe my google-fu was failing me, but I didn't see anything else out there that was a guided tour with pictures through the old <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://support.microsoft.com/en-us/help/2012889/configmgr-2007-windows-setup-fails-when-installing-drivers-during-an-c" target="_blank">Microsoft article</a> on this issue. Admit it - sometimes picture guides are just easier, especially if you can <s>pass the task</s> _present a growth opportunity_ to a junior member of your team.

<div class="wp-block-group">
  <div class="wp-block-group__inner-container">
  </div>
</div><figure class="wp-block-pullquote">

> _YES - Before you mention it - I recognize that I should be using&nbsp;<a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/AdamGrossTX/PowershellScripts/tree/master/ConfigMgr/BootImage" target="_blank">DART</a>&nbsp;in my boot image so I can capture screenshots and not have to crop cell phone pictures, but I just haven't yet and I wanted to get this process documented_...  
> <a rel="noreferrer noopener" aria-label="￼ (opens in a new tab)" href="http://www.ravishly.com/you-arent-lazy-youre-just-terrified-paralysis-and-perfectionism-mental-health" target="_blank"><img loading="lazy" width="800" height="766" class="wp-image-731" style="width: 300px" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/OCDame_Am-I-Crazy_002.png" alt="" srcset="https:/wp-content/uploads/2019/12/OCDame_Am-I-Crazy_002.png 800w, https:/wp-content/uploads/2019/12/OCDame_Am-I-Crazy_002-300x287.png 300w, https:/wp-content/uploads/2019/12/OCDame_Am-I-Crazy_002-768x735.png 768w, https:/wp-content/uploads/2019/12/OCDame_Am-I-Crazy_002-100x96.png 100w" sizes="(max-width: 800px) 100vw, 800px" /></a>
> 
> _<a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="http://www.ravishly.com/you-arent-lazy-youre-just-terrified-paralysis-and-perfectionism-mental-health" target="_blank">If I wait for perfectionism, then my procrastination and paralysis will kick in.</a>_ 
> 
> <cite>*<em>I reserve the right to revisit the post and replace images in the future.</em>* </cite></figure> 

## The Error...

Okay ... your OSD task sequence just failed and the timer is started. You have 15 minutes, by default, to read the logs and find the bad driver before all of the OEM inf files are wiped from the x: drive! You could always click the link in the image caption below and learn how to extend the default timeout (courtesy of <a href="https://twitter.com/AArwidmark" target="_blank" rel="noreferrer noopener" aria-label="Ami Arwidmark (opens in a new tab)">Ami Arwidmark</a>), but where is the fun in that?! <figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-01-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="570" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-01-obs-1024x570.png" alt="" class="wp-image-521" srcset="https:/wp-content/uploads/2019/12/osd-fail-01-obs-1024x570.png 1024w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-300x167.png 300w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-768x428.png 768w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-1536x855.png 1536w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-2048x1140.png 2048w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-100x56.png 100w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-855x476.png 855w, https:/wp-content/uploads/2019/12/osd-fail-01-obs-1234x687.png 1234w" sizes="(max-width: 1024px) 100vw, 1024px" /></a><figcaption> _"Hey Chris, you know you can <a href="https://deploymentresearch.com/extend-the-configmgr-task-sequence-error-dialogue-timeout/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">Extend the ConfigMgr Task Sequence Error Dialogue Timeout</a>, right?"_  
**Ooh, shiny! I should do that!**</figcaption></figure> 

## Ready, Set, Go!

  * You'll want to quickly open the Windows Setup logs from **x:\windows\panther\setupact.log**.<figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-02-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="571" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-02-obs-1024x571.png" alt="" class="wp-image-522" srcset="https:/wp-content/uploads/2019/12/osd-fail-02-obs-1024x571.png 1024w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-300x167.png 300w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-768x428.png 768w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-1536x856.png 1536w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-2048x1142.png 2048w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-100x56.png 100w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-855x478.png 855w, https:/wp-content/uploads/2019/12/osd-fail-02-obs-1234x688.png 1234w" sizes="(max-width: 1024px) 100vw, 1024px" /></a><figcaption> This whole post is under the assumption that your boot image has <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://docs.microsoft.com/en-us/configmgr/osd/get-started/manage-boot-images" target="_blank">command support</a> enabled so that you can access the command prompt and run **CMTrace.exe**. </figcaption></figure> 

  * Now, you'll want to scroll through the **x:\windows\panther\setupact.log** file until you reach the red section and a white line saying _"Windows Setup could not install one or more boot-critical drivers"_ and right above that you will see the last driver that Window Setup was trying to install. In this case it was **X:\WINDOWS\INF\oem184.inf**.<figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-03-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="589" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-03-obs-1024x589.png" alt="" class="wp-image-523" srcset="https:/wp-content/uploads/2019/12/osd-fail-03-obs-1024x589.png 1024w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-300x172.png 300w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-768x442.png 768w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-1536x883.png 1536w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-2048x1177.png 2048w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-100x57.png 100w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-855x492.png 855w, https:/wp-content/uploads/2019/12/osd-fail-03-obs-1234x709.png 1234w" sizes="(max-width: 1024px) 100vw, 1024px" /></a><figcaption>_Stupid oem184.inf wasting my time..._</figcaption></figure> 

  * Sweet! **CTRL-O** and type that path of **X:\WINDOWS\INF\oem184.inf** (using whatever oemxxx.inf file you found in your situation) to open the driver inf file and figure out what is causing you to go through this trouble... <figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-04-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="604" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-04-obs-1024x604.png" alt="" class="wp-image-524" srcset="https:/wp-content/uploads/2019/12/osd-fail-04-obs-1024x604.png 1024w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-300x177.png 300w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-768x453.png 768w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-1536x906.png 1536w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-2048x1208.png 2048w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-100x59.png 100w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-855x504.png 855w, https:/wp-content/uploads/2019/12/osd-fail-04-obs-1234x728.png 1234w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure> 

  * Now you could look for the driver name, but I've had the most luck looking for the **DriverVer** and in this case I was looking at a problem driver with a version of **8.3.1027.5567**. Off to the #MEMCM console so we can yank this thing out of the driver package...<figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-05-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="725" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/osd-fail-05-obs-1024x725.png" alt="" class="wp-image-525" srcset="https:/wp-content/uploads/2019/12/osd-fail-05-obs-1024x725.png 1024w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-300x212.png 300w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-768x544.png 768w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-1536x1087.png 1536w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-2048x1450.png 2048w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-100x71.png 100w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-855x605.png 855w, https:/wp-content/uploads/2019/12/osd-fail-05-obs-1234x874.png 1234w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure> 

## To The Console!

<ol start="1">
  <li>
    Open the driver package for the model of machine you're working with and search on the <strong>DriverVer</strong> you found in your <strong>setupact.log</strong> file. In my case it was <strong>8.3.1027.5567</strong>.
  </li>
</ol>

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-01-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="118" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-01-obs-1024x118.png" alt="" class="wp-image-531" srcset="https:/wp-content/uploads/2019/12/driver-removal-01-obs-1024x118.png 1024w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-300x34.png 300w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-768x88.png 768w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-1536x176.png 1536w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-100x11.png 100w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-855x98.png 855w, https:/wp-content/uploads/2019/12/driver-removal-01-obs-1234x142.png 1234w, https:/wp-content/uploads/2019/12/driver-removal-01-obs.png 1915w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure>
</div>

<ol start="2">
  <li>
    I right click and disable the drivers before I remove them from the driver package, because ... honestly I'm not sure if they would get picked up later in Auto Apply. Generally I add a WMI query to the Auto Apply phase to exclude all models that I have a driver package for. However, as I expand the rights for driver management out to more than just myself, as I present growth opportunities to my colleagues, I can't say that will always be the case so I just disable it until I can look into it some more.
  </li>
</ol>

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-02-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="118" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-02-obs-1024x118.png" alt="" class="wp-image-532" srcset="https:/wp-content/uploads/2019/12/driver-removal-02-obs-1024x118.png 1024w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-300x34.png 300w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-768x88.png 768w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-1536x176.png 1536w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-100x11.png 100w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-855x98.png 855w, https:/wp-content/uploads/2019/12/driver-removal-02-obs-1234x142.png 1234w, https:/wp-content/uploads/2019/12/driver-removal-02-obs.png 1915w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure>
</div>

<ol start="3">
  <li>
    Then I will edit it out of the driver package.
  </li>
</ol>

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-03-1.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="158" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-03-1-1024x158.png" alt="" class="wp-image-538" srcset="https:/wp-content/uploads/2019/12/driver-removal-03-1-1024x158.png 1024w, https:/wp-content/uploads/2019/12/driver-removal-03-1-300x46.png 300w, https:/wp-content/uploads/2019/12/driver-removal-03-1-768x119.png 768w, https:/wp-content/uploads/2019/12/driver-removal-03-1-1536x237.png 1536w, https:/wp-content/uploads/2019/12/driver-removal-03-1-100x15.png 100w, https:/wp-content/uploads/2019/12/driver-removal-03-1-855x132.png 855w, https:/wp-content/uploads/2019/12/driver-removal-03-1-1234x191.png 1234w, https:/wp-content/uploads/2019/12/driver-removal-03-1.png 1917w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure>
</div>

<ol start="4">
  <li>
    Wait for it to load and scroll down until you see the driver package it's attached to, clear the checkbox and click OK.
  </li>
</ol><figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-04-obs-1.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="786" height="549" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-04-obs-1.png" alt="" class="wp-image-539" srcset="https:/wp-content/uploads/2019/12/driver-removal-04-obs-1.png 786w, https:/wp-content/uploads/2019/12/driver-removal-04-obs-1-300x210.png 300w, https:/wp-content/uploads/2019/12/driver-removal-04-obs-1-768x536.png 768w, https:/wp-content/uploads/2019/12/driver-removal-04-obs-1-100x70.png 100w" sizes="(max-width: 786px) 100vw, 786px" /></a></figure> 

<ol start="5">
  <li>
    Allow the system to update your driver package for you.
  </li>
</ol><figure class="wp-block-image size-large">

<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-05-1.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="404" height="224" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-05-1.png" alt="" class="wp-image-540" srcset="https:/wp-content/uploads/2019/12/driver-removal-05-1.png 404w, https:/wp-content/uploads/2019/12/driver-removal-05-1-300x166.png 300w, https:/wp-content/uploads/2019/12/driver-removal-05-1-100x55.png 100w" sizes="(max-width: 404px) 100vw, 404px" /></a></figure> 

<ol start="6">
  <li>
    Make note of the time you start this. No sense testing OSD again until you're sure the package is ready.
  </li>
</ol>

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-06-1.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="116" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-06-1-1024x116.png" alt="" class="wp-image-541" srcset="https:/wp-content/uploads/2019/12/driver-removal-06-1-1024x116.png 1024w, https:/wp-content/uploads/2019/12/driver-removal-06-1-300x34.png 300w, https:/wp-content/uploads/2019/12/driver-removal-06-1-768x87.png 768w, https:/wp-content/uploads/2019/12/driver-removal-06-1-1536x175.png 1536w, https:/wp-content/uploads/2019/12/driver-removal-06-1-100x11.png 100w, https:/wp-content/uploads/2019/12/driver-removal-06-1-855x97.png 855w, https:/wp-content/uploads/2019/12/driver-removal-06-1-1234x140.png 1234w, https:/wp-content/uploads/2019/12/driver-removal-06-1.png 1593w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure>
</div>

<ol start="7">
  <li>
    Once the driver package is updated (pay no attention to the time stamp I got distracted at work) test OSD and hopefully you'll be back in business on that model.
  </li>
</ol>

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-07-1.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="109" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-removal-07-1-1024x109.png" alt="" class="wp-image-542" srcset="https:/wp-content/uploads/2019/12/driver-removal-07-1-1024x109.png 1024w, https:/wp-content/uploads/2019/12/driver-removal-07-1-300x32.png 300w, https:/wp-content/uploads/2019/12/driver-removal-07-1-768x82.png 768w, https:/wp-content/uploads/2019/12/driver-removal-07-1-1536x164.png 1536w, https:/wp-content/uploads/2019/12/driver-removal-07-1-100x11.png 100w, https:/wp-content/uploads/2019/12/driver-removal-07-1-855x91.png 855w, https:/wp-content/uploads/2019/12/driver-removal-07-1-1234x132.png 1234w, https:/wp-content/uploads/2019/12/driver-removal-07-1.png 1594w" sizes="(max-width: 1024px) 100vw, 1024px" /></a></figure>
</div>

## Woot - We Can Image Again!

<hr class="wp-block-separator" />

Now ... I was already planning this post in my head - I had all the screenshots, but hadn't made time to put it all together - then my friend <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/SCCMF12TWICE" target="_blank">Chris Buck</a> who runs <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://sccmf12twice.com/our-blog/" target="_blank">https://sccmf12twice.com/our-blog/</a> (_go check out all the cool things our community is sharing!_) made this comment below on Twitter and I felt compelled to get this out before I lose my enthusiasm. This post is out later than I planned, but Cub Scout Pinewood Derby and Blue & Gold prep took priority. Speaking of which ... I love my new Leader and his analytical mind (<a href="https://www.joshuastevens.net/blog/pinewood-nerdy-statistics/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">https://www.joshuastevens.net/blog/pinewood-nerdy-statistics/</a>)!<figure class="wp-block-image size-large">

<a href="https://twitter.com/SCCMF12TWICE/status/1207736790804783104" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="597" height="446" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/chris-buck-drivers.png" alt="" class="wp-image-529" srcset="https:/wp-content/uploads/2019/12/chris-buck-drivers.png 597w, https:/wp-content/uploads/2019/12/chris-buck-drivers-300x224.png 300w, https:/wp-content/uploads/2019/12/chris-buck-drivers-100x75.png 100w" sizes="(max-width: 597px) 100vw, 597px" /></a></figure> 

There are many different ways that people choose to handle drivers - like standard packages as Chris Buck mentions and we see examples of that in <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/miketerrill" target="_blank">Mike Terrill</a>'s **<a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://miketerrill.net/2017/09/10/configuration-manager-dynamic-drivers-bios-management-with-total-control-part-1/" target="_blank">Dynamic Drivers and BIOS Management</a>** solution and then there is <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/modaly_it" target="_blank">Maurice Daly</a> and <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/NickolajA" target="_blank">Nickolaj Andersen</a>'s **<a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://www.scconfigmgr.com/modern-driver-management/" target="_blank">Modern Driver Management</a>** solution which is what I'm working toward. There is also a very vocal person in the <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://www.winadmins.chat/" target="_blank">#WinAdmins</a> discord that insists Auto Apply is the only way to go, but I still have little trust. Do what works well for you and your organization.

Personally, I work in K-12 public education and in particular my organization currently has contracts to support several other local school districts for full IT services. With this comes the challenge of what many private sector admins take for granted ... this mythical creature I've heard people refer to as "standardization" and "lifecycle replacement". That's why I created ... <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="http://tiny.cc/WhyIDrink" target="_blank">http://tiny.cc/WhyIDrink</a> and went and used <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://twitter.com/Ebag333" target="_blank">Ebag333</a>'s <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/winadminsdotorg/SystemCenterConfigMgr/blob/master/Scripts/Drivers/BurnDriverDatabaseWithFire.ps1" target="_blank">BurnDriverDatabaseWithFire</a> script out of the <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://www.winadmins.chat/" target="_blank">#WinAdmins</a> community <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/winadminsdotorg/SystemCenterConfigMgr/" target="_blank">github repo</a> to start fresh. If someone needs to image a machine we will evaluate if it still is of value to the schools and add drivers back as appropriate. I'm hoping this will allow me to focus on only doing 'modern management' on models that are necessary.

<hr class="wp-block-separator" />
<figure class="wp-block-image size-large">
<a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/ts-driver-package-step-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="747" height="633" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/ts-driver-package-step-obs.png" alt="" class="wp-image-526" srcset="https:/wp-content/uploads/2019/12/ts-driver-package-step-obs.png 747w, https:/wp-content/uploads/2019/12/ts-driver-package-step-obs-300x254.png 300w, https:/wp-content/uploads/2019/12/ts-driver-package-step-obs-100x85.png 100w" sizes="(max-width: 747px) 100vw, 747px" /></a><figcaption> _"Chris, you know they have a **<a href="https://docs.microsoft.com/en-us/configmgr/osd/understand/task-sequence-steps" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">Do unattended installation of unsigned drivers on version of Windows where this is allowed</a>** option for driver packages, right? It's literally just a checkbox and you wouldn't have to do any of this..."_  
**I know ... but I don't want to check it. Why isn't it signed?!**</figcaption></figure> 

<hr class="wp-block-separator" />

<div class="wp-block-image">
  <figure class="aligncenter size-large"><a href="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-delete-obs.png" target="_blank" rel="noreferrer noopener"><img loading="lazy" width="1024" height="186" src="https://www.sysmansquad.com/wp-content/uploads/2019/12/driver-delete-obs-1024x186.png" alt="" class="wp-image-530" srcset="https:/wp-content/uploads/2019/12/driver-delete-obs-1024x186.png 1024w, https:/wp-content/uploads/2019/12/driver-delete-obs-300x54.png 300w, https:/wp-content/uploads/2019/12/driver-delete-obs-768x139.png 768w, https:/wp-content/uploads/2019/12/driver-delete-obs-1536x279.png 1536w, https:/wp-content/uploads/2019/12/driver-delete-obs-100x18.png 100w, https:/wp-content/uploads/2019/12/driver-delete-obs-855x155.png 855w, https:/wp-content/uploads/2019/12/driver-delete-obs-1234x224.png 1234w, https:/wp-content/uploads/2019/12/driver-delete-obs.png 1919w" sizes="(max-width: 1024px) 100vw, 1024px" /></a><figcaption> <em>"Why don't you just delete the drivers, Chris?"</em> </figcaption></figure>
</div>

In the words of, newly minted MVP, <a href="https://twitter.com/bdam555" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">Bryan Dam</a> - "<a href="https://damgoodadmin.com/2017/11/05/fully-automate-software-update-maintenance-in-cm/" target="_blank" rel="noreferrer noopener" aria-label=" (opens in a new tab)">If I was a better person...</a>" and had a _**growth mindset**_ (_my sons 5th grade teacher would be so happy to hear me parroting her words_) I would like to believe I may revisit this at some point to understand if these drivers are necessary or not. The realist inside tells me I probably won't though. In our testing it appears the devices work just fine and no drivers are reported missing in Device Manager. Good enough for now, we have tons of other work to get to. If we start receiving a spike in tickets for a particular model I can at least look at that list of disabled drivers to look for an OEM version. Sometimes that has to be enough, but I would love to get better and welcome any feedback on process improvement through email or Twitter. I hope this is helpful to someone in the future.

-Chris (<a href="https://twitter.com/AutomateMyStuff" target="_blank" rel="noreferrer noopener" aria-label="@AutomateMyStuff (opens in a new tab)">@AutomateMyStuff</a>)