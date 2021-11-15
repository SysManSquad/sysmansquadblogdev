---
title: 'NET-101 : Create a Basic Lab Network – Design'
author: Aaron
type: post
date: 2019-12-17T06:59:18+00:00
excerpt: Begin creating a lab environment by documenting it.
url: /2019/12/17/net-101-create-a-basic-lab-network-design/
featured_image: /wp-content/uploads/2019/12/Lab-Network-3-100x44.png
uagb_style_timestamp-js:
  - 1589200585
uag_style_timestamp-js:
  - 1591063989
categories:
  - Documentation
  - How-To
  - Networking
  - Uncategorized

---
As I go through my career, I often find that the answers I take for granted are not easy to find for people who are just starting out. I had the advantage of a dedicated class on network administration to build on, but not everyone had that opportunity. While this article focuses on a lab environment, most of the content will be applicable to real life as well.

I've tried to include as many reference links as possible to help you learn about the concepts involved, but I cannot explain everything in one article. If you think there's a section that can use a bit more explanation, let us know, and we'll take a look as time allows.

<p class="has-text-align-center">
  <strong>Why is this a networking article on a site for sysadmins? Because all systems depend on the network. If you know how your network works, you will have an easier time of building & fixing your systems.</strong>
</p>

## Prerequisites

You will need one of these options available to you:

  * At least one pc with 2 network adapters, several spare PCs laying around & a network switch
  * A computer with virtualization software and enough ram to run several virtual machines

We'll assume that what you're building is a private network that will use a NAT gateway & firewall to allow your traffic out onto the larger network or internet. This is the most common scenario at most companies, and it's a good place to build on before you learn more advanced concepts. If you don't have a good grounding in TCP/IP and networking in general, I suggest that you read this book before continuing: [Networking Concepts](https://docs.netgate.com/pfsense/en/latest/book/network/index.html).

All addresses in this article will use [CIDR notation](https://docs.netgate.com/pfsense/en/latest/book/network/understanding-cidr-subnet-mask-notation.html).

## Methodology

We're going to start by writing out our network documentation before we build even a single box. Why? Because if you don't have good network documentation, you're going to always struggle to get things right, or fix them in a month or two when you've forgotten what settings you used.

I will also try to only build this lab with products or apps you can download for free. I make no guarantee you can leave them up for free forever. This particular article will use Microsoft technologies but at some point I may write a companion article that uses only Linux-based and free technology.

## Start at the bottom: Networking

### Choosing a Subnet

#### IPv4

You will want to start by deciding what address range to use. Here is a short list of available private IPv4 address spaces you can work with. **Do NOT select one that matches the network your lab's router will connect to, or you will have a very bad time**. 

  * 10.0.0.0/8
  * 172.16.0.0/12
  * 192.168.0.0/16

If you are creating this lab at home, you will most likely have a 192.168.X.X IPv4 address. I'm assuming that you're creating this lab at home, so we'll pick a sane default that's unlikely to be used by your home router.

You will begin by selecting a **/24** address space. A **/24** subnet is sometimes called a class "C" network, but is not exactly the same for historical reasons. We will use a large private address space, and carve out a smaller section to be our first subnet. An example of this address space is **10.248.100.0/24**. Our example code and scripts will assume you are using this address space, but you should pick a different one so that you have to put in more work, which will help you understand better what's going on. I'll place a link to a subnet calculator here to help you understand where the values I'm using are coming from. [10.248.100.0/24](https://www.calculator.net/ip-subnet-calculator.html?cclass=c&csubnet=24&cip=10.248.100.0&ctype=ipv4&printit=0&x=62&y=26) It is also possible to work out this calculation manually if you are better at binary math than I am.

It's important to note that the very first address in your subnet (in our case 10.248.100.0) is the Network Number and is unusable by any device. The very last number in the network ( 10.248.100.255 ) is the broadcast address, and it too is unusable for normal purposes. We won't go into great detail about what is special about them for now.

#### IPv6

<p class="has-text-align-center">
  <em>Unfortunately, my experience doesn't yet include IPv6. I'll make a best-effort here but maybe don't count anything in this article referencing IPv6 as well-researched or authoritative yet. </em>
</p>

I recommend this article for some light reading regarding IPv6 addressing: [TCP/IP Fundamentals for Windows, Chapter 3](https://docs.microsoft.com/en-us/previous-versions/tn-archive/bb726995(v=technet.10)#ipv6-addressing). You may also find this series of articles useful: [Infoblox IPv6 Blogs](https://blogs.infoblox.com/category/ipv6-coe/).

Some important differences from IPv4:

  * There is no reserved address for a 'broadcast' address. IPv6 replaced broadcasting with "Multicasting" and "Anycasting"
  * When directing a service to listen on any address in IPv4, you used 0.0.0.0 - the IPv6 equivalent is '::' to denote all zeros.
  * Loopback - IPv4 was 127.0.0.1. IPv6 is '::1'
  * Choosing a subnet smaller that a /64 is almost entirely unsupported, even though that is a huge amount of wasted address space.

For IPv6, you can use [SimpleDNS](https://simpledns.com/private-ipv6), who were kind enough to provide a site to generate a private address range. I'm going to use the following network number and provide as much background material as I can, because this is not an area I understand well. The key take-away from what I'm reading on this is that the subnet mask functionality is integrated into the IPv6 address without being a separately tracked number. You will also notice that there is no number-only representation of an IPv6 address, it is written either in binary or in hexadecimal notation. I've made use of this [IPv6 subnet calculator](https://www.calculator.net/ip-subnet-calculator.html?c6subnet=120&c6ip=fdda%3Af6d4%3Af5a2%3Af1e6%3A%3A0000&ctype=ipv6&printit=0&x=47&y=20#ipv6).

  * The network identifier for this network is: **fdda:f6d4:f5a2:f1e6:0000:0000:0000:0000** 
  * Which can also be written as: **fdda:f6d4:f5a2:f1e6::/64** 

<s> I'm not sure how one normally divides up an IPv6 network.</s>

It turns out the minimum size is a /64.

#### The Default Gateway

What is a gateway? What separates it from a router? Well, a gateway, or more typically a 'default gateway' is the machine that passes all network traffic meant for another subnet on to the next router. While a gateway is a router, not all routers are gateways. It is possible that there is more than one router with a presence inside a subnet, and it may be true that traffic bound for one specific network has a router inside your subnet that you can pass traffic to, and it will get there. It is more common however, to simply have one router on your network that catches all traffic that leaves the subnet. In our case, there will be one router, because there is only one way for traffic to leave our first subnet.

Once you have selected an address space, your first task will be deciding what address your router or gateway will use. 

**IPv4**: It is customary but not an absolute rule that network equipment addresses be located at the beginning or end of the address range. There is nothing whatsoever that prevents you from picking an arbitrary address in the middle and confusing anyone who needs to figure out your network. All that is required is that the gateway interface be a valid address inside the subnet that is not already used by something else. Please do not pick an address in the middle of your subnet for your gateway.

**IPv6**: It looks like the lowest address within the subnet (the one with all zeros as the [interface identifier](https://blogs.infoblox.com/ipv6-coe/ipv6-back-to-basics-interface-ids/)) is a [Subnet Router Anycast Address](https://into6.com.au/2014/03/30/subnet-router-anycast-addresses-what-are-they-how-do-they-work/). This means that it is always owned by a router. The routers all seem to respond to messages directed to this address after a randomized timeout. The practical effect of this, is that it is a reserved address. Therefore in our example, **fdda:f6d4:f5a2:f1e6::00/64** is a reserved address that is always used by one of the available routers in the subnet.

It also seems that in IPv6, you need to think of IPv6 addresses as identifiers for interfaces, not hosts. In other words, it is perfectly likely that a machine may have a large number of interfaces, and so the thinking has shifted to the assumption that it will, and so the terminology has shifted as well. Even with this change, an interface may have more than one IPv6 address assigned, just like you were able to do with IPv4 addresses. The interface identifier is the part of the address that changes to distinguish an interface from another one inside the same subnet.

#### Gateway summary

For the purpose of our lab network, we're going to set our example IPv4 gateway address as **10.248.100.1/24**, and our IPv6 address as **fdda:f6d4:f5a2:f1e6::1/64** You will use these addresses any time you are asked for a default gateway.

<p class="has-text-align-center">
  <em>Real corporate networks are made of many subnets and firewalls and things of that nature but this lab will only cover having 1 internal subnet. Once you've mastered this network config, you can increase your security posture by expanding your lab to have 2 subnets, a firewall interface for both, and writing the firewall rules that allow devices on one network to talk to the other network.</em>
</p>

#### VLANs

This is something you won't really need to know until you get into more advanced networking with real switches, but it's important to know that VLANs are a thing, and while they tend to contain 1 subnet, they are not required to, and cannot be assumed to only contain the subnet you think they do. They are, at a basic level, a way to separate traffic in one network from another network while maintaining one set of networking switches & cabling. 

We won't talk about them a lot in this article other than suggesting you learn more about them before we publish the next article in this series. Our only subnet in this lab is going to be **VLAN 77**. The numbering is arbitrary because while you _can_ number the vlan after the third octet in a **/24** network, you may eventually end up with more than one network sharing the third octet. There is no single right answer to deciding what numbering scheme to use. Just don't try to use an existing, already defined vlan number by accident on an existing network.

You should not assume that the vlan number ties to an ip addressing scheme in any case.

<p class="has-text-align-center">
  <em>If you'd like to know more about vlan and vlan tagging, have a look at [Thomas Krenn VLAN Basics](https://www.thomas-krenn.com/en/wiki/VLAN_Basics).</em>
</p>

### Basic Networking Roles/Services

#### DHCP

Unless you are setting the address on every PC or network device by hand, you will use DHCP to hand out IP addresses to machines. You will need to decide where the DHCP service will live, and what range it will give out to any client that asks. In our lab, we'll have a dedicated DHCP server, even though the router/gateway appliance is capable of doing this job.

IPv4: For our purposes, the DHCPv4 range will be 10.248.100.[50-99]/24 as we do not expect to have a large number of DHCP clients. We will use **10.248.100.3/24** for our DHCPv4 server address.

IPv6:  
Unicast address: **fdda:f6d4:f5a2:f1e6::3/64**  
Range: **fdda:f6d4:f5a2:f1e6::[32-63]/64**  
_!! Remember - this is the same number of addresses, but written in hex. Even though it looks like a normal decimal notation for '32' the decimal equivalent is actually '50'_

#### DNS

<pre class="wp-block-verse"><em>It's not DNS.<br />There's no way it's DNS.<br />It was DNS.</em></pre>

An embarrassingly large number of systems problems can be traced back to DNS.

Generally speaking, you should use a DNS name that you own. In our example lab, we'll want to pick something that's reserved and not valid on the general internet so we can know for sure that any answer we get will be from our actual DNS server. We can find out what names are not allowed to be registered by searching for 'reserved DNS names' or just reading [RFC 2606](https://tools.ietf.org/html/rfc2606#section-2). For our lab DNS name we will use '**lab.text**'.  
We will write this in our documentation as '**lab.test.**' - note the trailing dot. This is important because the trailing dot signifies that this is the end of the DNS domain. This is important for some DNS records and also because we are using an uncommon top-level domain.

IPv4: Our DNS server will live at **10.248.100.2/24**.  
IPv6: **fdda:f6d4:f5a2:f1e6::2/64**

## Documentation

Hey, so now we have an idea of our network definition. We know what it is, what the addresses of the critical services are, and what we're going to call it. This is an excellent time to write it down.<figure class="wp-block-table">

<table class="">
  <tr>
    <td>
      <strong>Item</strong>
    </td>
    
    <td>
      <strong>Value</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      Subnet ID
    </td>
    
    <td>
      <strong>10.248.100.0/24</strong><br /> <strong>fdda:f6d4:f5a2:f1e6::/64</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      Default Gateway
    </td>
    
    <td>
      <strong>10.248.100.1/24</strong><br /> <strong>fdda:f6d4:f5a2:f1e6::1/64</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      DNS Server
    </td>
    
    <td>
      <strong>10.248.100.2/24</strong><br /> <strong>fdda:f6d4:f5a2:f1e6::2/64</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      DNS Domain
    </td>
    
    <td>
      <strong>lab.test.</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      DHCP Server Address
    </td>
    
    <td>
      <strong>10.248.100.3/24</strong><br /> <strong>fdda:f6d4:f5a2:f1e6::3/64</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      DHCP Range
    </td>
    
    <td>
      <strong>10.248.100.[50-99]/24</strong><br /><strong>fdda:f6d4:f5a2:f1e6::[32-63]/64</strong>
    </td>
  </tr>
  
  <tr>
    <td>
      VLAN ID
    </td>
    
    <td>
      <strong>77</strong>
    </td>
  </tr>
</table></figure> 

Well that was simple. But also maybe we should do this in a visual way as well. Being able to visualize your network can help you find problems later. Even though our network is basic, let's document it as well as we can.<figure class="wp-block-image size-large">

![](https://sysmansquad.com/wp-content/uploads/2019/12/Lab-Network-3.png) </figure> 

<p class="has-text-align-center">
  <strong><em>[Here are the source files for this drawing.](https://github.com/SysManSquad/BlogFiles/tree/master/aaron/net-101)</em></strong>
</p>

Pretty neat huh? While you may at some point get to a level where you have some tool that generates these diagrams for you, I wouldn't count on it being soon. Some networks are so big that one human simply can't track every change to the topology or other critical information, but this lab network isn't one of them. 

I didn't just come up with this diagram design on my own, I have to thank the folks at Packet Pushers for the advice on how to do it well. [How to Draw Clear L3 Logical Network Diagrams](https://packetpushers.net/how-to-draw-clear-l3-logical-network-diagrams/). I also don't use visio as it's extremely expensive and not better than [Draw.io](https://www.draw.io/). If you prefer a downloadable app instead of a website, have a look over here at their [github releases](https://github.com/jgraph/drawio-desktop/releases) page. 

You may also notice that I've included some interface names here, em0 and em1. This is because I happen to know that the software appliance we'll use to create our gateway/firewall device names its interfaces this way.

In our next installment we'll cover the general process of creating your lab.




