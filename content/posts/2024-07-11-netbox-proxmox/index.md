---
title: "Working with Netbox - custom links, populating data from Proxmox, etc"
author: aaron
type: post
date: 2024-07-11T06:59:18+00:00
excerpt: Reading from Proxmox and writing into netbox
url: /2024/07/11/netbox-proxmox-et-al/
featured_image: chip_zoe.jpg
categories:
  - Powershell
  - Netbox
  - Proxmox
---

![Puppies for attention](chip_zoe.jpg)

## Wow. Been a while huh? Please explain this gap on your posting resume.

It's not that I've not been doing anything, it's just that occasionally I forget that I should probably write about those things.

I've converted my home lab to Proxmox since Broadcom has been busy destroying everything I love (well, in the context of virtualization anyway) and I have not yet been desperate enough as to seriously consider Hyper-V for this scale (Anything more than 1 hyper-v host sucks to manage without installing SCVMM and SCVMM doesn't make sense for 3 very small hypervisors - too much ram dedicated to allowing vmm to run).

Despite the faults of Proxmox (they keep trying to make it harder to disable their nag screen for the subscription i'm never going to buy for personal use), it makes a great hypervisor as long as you don't use Ceph for storage (Remember kids - friends don't let friends install Ceph!). It is, in my experience, the single worst storage system.

Being both lazy and obsessed with having good documentation for the VMs in my home lab, I wanted to be able to set up a scheduled task or cron job to periodically to make sure the new vms I add get their addresses documented.

Luckily I'm the kind of lazy that means I'll do huge amounts of work upfront to replace a tedious task with a very small shell script.

## So how do you get data into and out of Proxmox and Netbox?

Proxmox has an API I can interrogate with powershell. I don't love it but it really isn't bad - and once you dig into it it's pretty useful. I don't really feel like getting that deep into it often so I kinda .. wrote and published an entire [powershell module](https://www.powershellgallery.com/packages/proxmox-rest-module/) to make the problem go away. It works as well as you'd expect from a module sitting at version 0.0.1, so - good enough for everything I've used it for.

Proxmox currently supports QEMU/VKM virtual machines and LXC containers, and information about them is spread throughought several places in the API. I added a function to get a combined view - `Get-PXVMs`, and you can see how complicated it was to get a usable, unified view if you're interested in [the source](https://github.com/aaroneg/proxmox-rest-module/blob/trunk/source/Public/endpoints/cluster/resources/Get-PXVMs.ps1). Suffice to say, it was a lot of work and this view is the lowest common denominator for information provided by the API for both kinds of vms.

Netbox also has an API, and while it's API docs sometimes fall out of date, they're still pretty good - and as luck would have it I ALSO wrote a [module for that](https://github.com/aaroneg/netbox-rest-module). Why not just use existing modules other people have written? I don't want to, and if they fall short I don't particularly feel like trying to dig through their source code and understand why something failed. Obviously, that's not a viable strategy for everyone. If you want to check out some others, you can have a [look through Github](https://github.com/search?q=netbox+powershell&type=repositories&s=updated&o=desc). Many of them are probably fine, I evaluated none of them in depth. Many appear to be abandoned, some of them only provide the most basic of commands - the person writing a script using them seems to have to do almost all of the work instead of the module being full featured. This isn't a dig at them - we all do just enough work to make our projects go when it's a volunteer effort. I do think mine supplies the most coverage of the ones I evaluate while writing this post, but they all provide some good value. My modules get tested when I use them for something, and I'm a big fan of the Netbox project so you can at least be assured that the modules will keep being updated by me as long as I have a job in IT.

## Ok but did you do any work to tie these together?

Why yes Me, I did! (There are lots of advantages to interviewing yourself, you get to choose your own tough, hard-hitting or pure softball questions, and you never look like a dummy unless you want to)

I wrote a script to do all those things I just talked about! You can find it [here on github](https://github.com/aaroneg/populate-netbox/tree/trunk/proxmox). At the time of writing, it's meant to be mostly non-destructive to data in Netbox. It does however go in every time and set the _primary_ IPv4 and IPv6 objects on all of the vms it finds in proxmox, so if you don't like the logic of how it does that, you may wish to comment out that section. It's at the end.

Generally speaking, I write my scripts so that if you're missing any pre-requisites, they will tend to just make them magic themselves into place. You can see what the script is doing usually [in a script named init.ps1](https://github.com/aaroneg/populate-netbox/blob/trunk/proxmox/init.ps1) and make sure you're happy with the operations and do them yourself manually if you wish. I make heavy use of the Microsoft.Powershell.SecretManagement module(s) to avoid writing credentials in plaintext to disk, and configuration questions like URLs for services are asked only once then serialized to disk so you're not answering a lot of repetitive questions. To get asked these questions all over again, delete any XML files that appear next to the script.

Right now there's no logic to handle machines in netbox that have gone missing from proxmox, but I may well get annoyed enough soon to handle that too - so keep an eye on github if you're interested.

All kidding aside, this was a huge amount of work, and I'm quite proud of the results. I hope you find it useful.
