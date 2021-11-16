---
title: 'Creating an Ubuntu 20.04 cloud template & cloud-init configuration in Xen Orchestra'
author: Aaron
type: post
date: 2021-07-07T14:46:22+00:00
url: /2021/07/07/creating-an-ubuntu-20-04-cloud-template-cloud-init-configuration-in-xen-orchestra/
categories:
  - Documentation
  - How-To
  - Networking
tags:
  - cloud-init
  - linux
  - ubuntu
  - xcp-ng
  - xen-orchestra

---
I had a need in my home lab to quickly deploy a bunch of thin clones of Ubuntu's cloud image. I chose to use the cloud images Ubuntu [provides](https://cloud-images.ubuntu.com/) instead of building a custom template.

Xen Orchestra has had support for cloud-init [since 2015][2]. 

## Quick Walkthrough

Here is the short version of how this works:

  1. Download the current 20.04 ubuntu cloud image OVA file, there should only be 1 on each build's page. I used [focal-server-cloudimg-amd64.ova][3]
  2. In Xen Orchestra, Import -> VM, then drag & drop your ova onto the obvious place. Set the default CPU, Memory, and target VM Network settings & click Import
  3. When it's finished, you can click on Home -> VMs, and clear the "power_state:running" filter from the display.
  4. Select the powered-off vm, and rename it whatever you want.
  5. On the Advanced tab, click "Convert to template"
  6. Click the "New VM" button in the top-right corner
  7. Choose a pool
  8. Select your newly-created template from the list
  9. Adjust CPU, Ram, etc as necessary. 
 10. Under the "Install settings" header, choose a custom config
 11. Paste your customized User and Network config
 12. Click "Create"

## Example cloud-init configs:


```powershell
#cloud-config
hostname: {name}
users:
  - name: jappleseed
    gecos: jappleseed
    primary_group: jappleseed
    groups: adm
    lock_passwd: false
    shell: /bin/bash
    sudo: ALL=(ALL) NOPASSWD:ALL
    ssh_authorized_keys:
      - ssh-rsa KEYCONTENTS user@HOSTNAME

ca-certs:
  trusted: 
  - |
    -----BEGIN CERTIFICATE-----
    # The indented contents of your CA cert go here:
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
    -----END CERTIFICATE-----
```


<div class="wp-block-uagb-inline-notice uagb-inline_notice__outer-wrap uagb-inline_notice__align-left uagb-block-738d57a5">
  <h4 class="uagb-notice-title">
    Network config
  </h4>
  
  <div class="uagb-notice-text">
    <p>
      I don't know if this is unique to Xen Orchestra or not, but the syntax of the network config is a little odd. No matter what else you change, leave the first line EXACTLY as you see it below.
    </p>
  </div>
</div>


```powershell
#network:
    version: 2
    renderer: networkd
    ethernets:
        eth0:
            addresses:
                - 192.168.0.124/24
                - 2001:db8::1:9f/64
            gateway4: 192.168.0.1
            nameservers:
                search: [example.com]
                addresses: [192.168.0.1, 8.8.8.8]
```


## Caveats

This approach is fast, but doesn't properly install the xcp-ng guest tools. You'll probably want those if you want XCP-NG or Xen-Orchestra to be able to dive into each guest VM and display a useful level of detail about the guest. You can do a normal install from an iso, install some packages and run "cloud-init clean", then immediately shut down the VM. This will force cloud init to run the same way it would if this were a fresh machine - generating host keys, naming the machine and applying any other config you pass in.


 [2]: https://xen-orchestra.com/blog/cloudinit-support-for-xenserver/
 [3]: https://cloud-images.ubuntu.com/focal/current/focal-server-cloudimg-amd64.ova
