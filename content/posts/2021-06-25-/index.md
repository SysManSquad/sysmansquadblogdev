---
title: Automatically Updating OSD FrontEnd’s Approved Hardware Models List
author: Nic Wendlowsky
type: post
date: -001-11-30T00:00:00+00:00
draft: true
url: /?p=2819
categories:
  - Endpoint Management

---
This post is geared toward users of [MSEndpointMgr's OSD FrontEnd](https://msendpointmgr.com/configmgr-osd-frontend/) for Configuration Manager, but maybe it'll inspire others in ways to automate the boring stuff.<div class="wp-block-uagb-table-of-contents uagb-toc\_\_align-left uagb-toc\_\_columns-1 uagb-block-382929f6 " data-scroll= "1" data-offset= "30" data-delay= "800" > 

<div class="uagb-toc__wrap">
  <div class="uagb-toc__title-wrap">
    <div class="uagb-toc__title">
      Table Of Contents
    </div>
  </div>
  
  <div class="uagb-toc__list-wrap">
    <ol class="uagb-toc__list">
      <li class="uagb-toc__list">
        [Brief Background](#brief-background)<li class="uagb-toc__list">
          [Script Goals](#script-goals)<ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              [Outline](#outline)
            </li>
          </ul>
        </li>
        
        <li class="uagb-toc__list">
          [Getting Started](#getting-started)<ul class="uagb-toc__list">
            <li class="uagb-toc__list">
              [Get list of ConfigMgr Packages](#get-list-of-configmgr-packages)<li class="uagb-toc__list">
                <li class="uagb-toc__list">
                  [Get distribution status of a Package](#get-distribution-status-of-a-package)
                </li></ul>
              </li></ul></ol> </div> </div> </div> 
              <h2>
                Brief Background
              </h2>
              
              <p>
                At my current org, I moved us from a basic Task Sequence to using OSD FrontEnd as a way to allow for more customization of the image with less post-image configuration. We don't have set "profiles" for certain roles, so having a nice dynamic list of Applications to install was a big plus.
              </p>
              
              <p>
                The other thing I liked was that the Pre-Flight checks have an option to validate the hardware against a list of computer models to ensure they're approved based on whatever criteria you decide. For me, the only criteria I cared about was not allowing the image to start without making sure valid drivers were distributed.
              </p>
              
              <p>
                At first, this was great until we started ordering new models (and in some cases, pulling old, dusty machines from closets to use as loaners) and my Techs were blocked by the Pre-Flight check failing.
              </p>
              
              <h2>
                Script Goals
              </h2>
              
              <p>
                We also use the [Driver Auotmation Tool](https://msendpointmgr.com/driver-automation-tool/) for maintaining updated driver Packages (Note: *not Driver Packs*) which provides a standardized naming convention and Package properties to use for a nice automation script.
              </p>
              
              <p>
                At first, I updated the list manually when needed until I ran into an odd issue where OSD FrontEnd parses the HWmodels.txt file in a case-sensitive manner. Meaning that if the system's model is **Opti<span class="has-inline-color has-vivid-red-color">P</span>lex 9010** but the name in the txt file is **Opti<span class="has-inline-color has-vivid-red-color">p</span>lex 9010**, no match is found, thus a false positive.
              </p>
              
              <p>
                I submitted an [issue on Github](https://github.com/MSEndpointMgr/ConfigMgrOSDFrontEnd/issues/4), but until then, let's get to the workaround and also automate the task.
              </p>
              
              <h3>
                Outline
              </h3>
              
              <p>
                It definitely helps to outline a list of goals to accomplish for any complex, lengthy, or specialized script in order to keep organized and avoid too many tangents.
              </p>
              
              <p>
                For this script, I wanted:
              </p>
              
              <ul>
                <li>
                  Use ConfigMgr Status Filter Rule to trigger script
                </li>
                <li>
                  Update HWModels.txt<ul>
                    <li>
                      Query ConfigMgr for driver Packages
                    </li>
                    <li>
                      Add any models found
                    </li>
                    <li>
                      Remove any models without driver Package
                    </li>
                    <li>
                      iterate through list of models and add "duplicates" in different letter case arrangements (OptiPlex vs Optiplex vs optiplex)
                    </li>
                    <li>
                      Ensure VMs are always in the list (we have VM drivers in the Driver Catalog instead of packages)
                    </li>
                    <li>
                      Backup the file in case of errors
                    </li>
                    <li>
                      Only update if the driver Package is FULLY distributed to prevent models being approved with no available content
                    </li>
                  </ul>
                </li>
                
                <li>
                  Use the AdminService instead of the ConfigurationManager.psd1 module
                </li>
                <li>
                  Log file to record all changes
                </li>
                <li>
                  Support <code>ShouldProcess</code> for testing
                </li>
              </ul>
              
              <p>
                It's a lengthy list, so I'll try my best to keep this post short.<br />*Narrator: He didn't.*
              </p>
              
              <h2>
                Getting Started
              </h2>
              
              <h3>
                Get list of ConfigMgr Packages
              </h3>
              
              <h3>
                Get distribution status of a Package
              </h3>
