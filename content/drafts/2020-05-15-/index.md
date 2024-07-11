---
title: Making Failed OSD Obvious
author: Rich Mawdsley
type: post
date: -001-11-30T00:00:00+00:00
draft: true
categories:
  - Endpoint Management

---
Sometimes when building machines with SCCM, they fail. It happens, we accept it, we fix it, we move on. But sometimes, it's not obvious. Perhaps the 15minute timeout has passed and the machine has booted to the OS without anyone realising, or even days go by before someone goes back to check how it got on.

<div class="wp-block-image">
  <figure class="aligncenter">![1](https://richmawdsleyblog.files.wordpress.com/2017/02/11.png)</figure>
</div>

This can really happen at any point after your _"Apply Operating System Image"_ step and your IT folk doing the deployments would likely be none the wiser if they're not present, until you get called saying the machine is missing X Y & Z.

So ok, how do we make it obvious? How do we make it so it's impossible to miss even to the most basic of user that the machine they are looking at has not been deployed correctly, and needs attention..

Well, one could argue steps and folders in the TS to catch errors (J├Ârgen Nilsson has written a great [blog](https://t.co/WNfjA0Fq3G) on this), or even monitoring tools;<figure class="wp-block-image alignnone size-full wp-image-297">

![2](https://richmawdsleyblog.files.wordpress.com/2017/02/2.png) <figcaption>If your eyes have lit up at this.. let me know, I may blog how to do it.</figcaption></figure> 

And they're great! Providing you're looking at them at the time. Which lets be honest, most of our deployment guys don't..

We need a really in your face "Hello! I've failed!"…<figure class="wp-block-image">

![5.png](https://richmawdsleyblog.files.wordpress.com/2017/02/51.png) </figure> 

That'll do it.

How do it do that!!?.. I hear you..

It all starts in the Wim. Because as mentioned earlier, our build could fail at absolutely any point after its installed the OS, and we want resilience for that and any scenario thereafter. So we are going to hard build in that lockscreen wallpaper into our Wim, then one of our very last steps in the Task Sequence will change it from "Failed" to "Success", or a normal wallpaper.

That way, if our client fails at any point in the Task Sequence between installing the Wim, and the end of our Task Sequence, it will be absolutely in your face obvious that said machine has not completed successfully… even hours, days, years later!

Firstly download our required files: [Download](https://my.pcloud.com/publink/show?code=kZfBElZeopT1u8Wc2buXq1xAJigoh9YO6iV)

Now in your base Wim image..

<blockquote class="wp-block-quote">
  <p>
    **1) Create the folder structure C:\Windows\BG\****2) Copy "background_PreLoginRed_SCCM_Build_FailedWarning.jpg" here.****3) Set the following: "HKLM\Software\Policies\Microsoft\Windows\Personalization\LockScreenImage", "C:\Windows\BG\background_PreLoginRed_SCCM_Build_FailedWarning.jpg", "REG_SZ"**
  </p>
</blockquote><figure class="wp-block-image">

![4](https://richmawdsleyblog.files.wordpress.com/2017/02/4.png) </figure> 

There are numerous ways to achieve the above, just ensure you update and re-capture \ import to SCCM etc afterwards.

That's it for the Failed part.. easy right?

But, we now need to remove it at the end of our Task Sequence. I'm going to go 1 extra here, and change it to a temporary lock screen wallpaper to inform the user that the machine has only recently been built and may still be installing updates and/or applications. This will be automatically removed later.

To do this, I'm going to utilise my OEM Files. I'd advise you read this guide if you haven't already. **[Guide ÔÇô OEM Files](https://richmawdsleyblog.wordpress.com/2017/01/27/osd-oem-files/)**

Place the remainder of the downloaded files into your virtual Windows 10 root folder, specifically Windows\BG.<figure class="wp-block-image">

![6](https://richmawdsleyblog.files.wordpress.com/2017/02/6.png) </figure> 

And update your OEM Files package;<figure class="wp-block-image">

![7](https://richmawdsleyblog.files.wordpress.com/2017/02/7.png) </figure> 

So, now these files (assuming you preconfigured this bit as mentioned in my [previous guide][2]) will get copied down to our client during the build ready to be used.

So our last step is to create a step in the TS to tell it to remove our red failed image, and replace it with something a little more welcoming.

Put this as late as you can, 1 of your last steps in the TS..

<blockquote class="wp-block-quote">
  <p>
    **Step: Run Command Line****Name: Set Lock Screen Image****Command line: cmd.exe /c "cscript.exe C:\windows\BG\SetBackground.vbs"**
  </p>
</blockquote><figure class="wp-block-image">

![8.png](https://richmawdsleyblog.files.wordpress.com/2017/02/8.png) </figure> 

Done.

So what will now happen?

When your Task Sequence runs _"SetBackground.vbs"_, it'll do two things;

**1) Set the background:**<figure class="wp-block-image alignnone size-full wp-image-429">

![lockbackground_preloginblue_machinerecentlybuiltwarningv4](https://richmawdsleyblog.files.wordpress.com/2017/02/lockbackground_preloginblue_machinerecentlybuiltwarningv4.jpg) <figcaption>Shiny</figcaption></figure> 

**2) Create a scheduled task to remove the above background, 24 hours later.**

Around* 24 hours later it will run a scheduled task to run _"RemoveBackground.vbs",_ which will check for the existence of "_C:_SMSTaskSequence" (one of the biggest give away's somethings not right)_, and if it doesn't exist, then delete the keys we set earlier for the background, in turn setting it back to Windows default, and then self destructing and removing the scheduled task.

_*I asterisk around 24 hours because sometimes it does run sooner._

And of course, if our client doesn't get this far and fails, it'll have our Failed Wallpaper;<figure class="wp-block-image">

![5](https://richmawdsleyblog.files.wordpress.com/2017/02/51.png) </figure> 

So there we are. An absolutely obvious way of instantly seeing if a machine has failed to build just by looking at it, even by the simplest of user. _Pretty sweet right?_

Find this guide useful? Let me know and please do share!

Until next time.. 

 
 [2]: https://richmawdsleyblog.wordpress.com/2017/02/03/guide-unsupported-hardware-filter/
