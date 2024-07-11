---
title: Connecting Okta LDAP Interface to Jamf
author: Nic Wendlowsky
type: post
date: -001-11-30T00:00:00+00:00
draft: true
categories:
  - Endpoint Management

---
I've recently transitioned to a company that has virtually no Microsoft products, save for a few Windows laptops and M365 Apps users, so all of our identity management comes from Okta.  
I'm also spearheading a project to migrate our Apple devices to Jamf, so getting our IdP to talk to Jamf is important.

Okta is a very powerful and highly-supported IdP and SSO provider.

Jamf is a very powerful and highly-supported Apple-only MDM provider.

Yet Jamf does not have a built-in integration for Okta in its Cloud Identity Providers system setting. So what do you do?

In comes Okta LDAP Interface.

<div class="wp-block-uagb-inline-notice uagb-inline_notice__outer-wrap uagb-inline_notice__align-left uagb-block-5be48def">
  
#### Plagiarism Alert
  
  
  <div class="uagb-notice-text">
    <p>
      A huge part of this is just re-writing this post from [The Travelling Tech Guy](https://travellingtechguy.eu/integrating-okta-ldap-in-jamf-pro/), but I'm adding the Okta configuration side of it.
    </p>
  </div>
</div>

## Prerequisites

  * Okta [Super Admin](https://help.okta.com/en/prod/Content/Topics/Security/administrators-admin-comparison.htm) permissions
  * Jamf Pro Administrator permissions
  * Approval from the powers-that-be to:
      * Enable Okta LDAP Interface
      * Create a Read-Only Administrator in Okta
      * Exclude that user from MFA policies

## Okta LDAP Interface

<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile is-vertically-aligned-top" style="grid-template-columns:auto 34%">
  <figure class="wp-block-media-text__media">![](2021-10-20-21_27_44-testcarbon-Directories-and-11-more-pages-Personal-Microsoft​-Edge.png)</figure>
  
  <div class="wp-block-media-text__content">
    <p>
      The first phase is to enable the Okta LDAP Interface
    </p>
    
    <ol id="block-d82003a4-9b89-4dde-8238-d21909841c16">
      <li>
        Login to Okta
      </li>
      <li>
        Launch the Admin console
      </li>
      <li>
        Navigate to Directory > Directory Integrations<ol>
          <li>
            Add Directory > choose Add LDAP Interface
          </li>
        </ol>
      </li>
      
      <li>
        That's it.
      </li>
      <li>
        Take note of the Settings for later use
      </li>
    </ol>
  </div>
</div>

## Okta Service Account

<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
  <figure class="wp-block-media-text__media"></figure>
  
  <div class="wp-block-media-text__content">
    
### Create the Service Account
    
    
    <ol>
      <li>
        Navigate to *Directory > People*<ol>
          <li>
            Add Person<ol>
              <li>
                Fill out the information as desired
              </li>
              <li>
                Password<ol>
                  <li>
                    Use the Set By Admin option
                  </li>
                  <li>
                    This way you don't have to set up an actual email account in Exchange, Google, etc.
                  </li>
                  <li>
                    **UN**check the box to change password at first login
                  </li>
                </ol>
              </li>
            </ol>
          </li>
        </ol>
      </li>
    </ol>
  </div>
</div>

<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
  <figure class="wp-block-media-text__media"></figure>
  
  <div class="wp-block-media-text__content">
    
### Exclude Service Account from MFA
    
    
    <p>
      If you don't use MFA (how is that possible??), you can skip this section.
    </p>
    
    <p>
      There are 2 options to accomplish the same goal here: Exclude the Service Account explicitly in your MFA Policy *or* Create a new Group and a new Policy for easier access and visibility.
    </p>
    
    <p>
    </p>
  </div>
</div>

<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
  <figure class="wp-block-media-text__media"></figure>
  
  <div class="wp-block-media-text__content">
    
#### Option 1: Exclude Service Account from Existing Policy
    
    
    <ol>
      <li>
        Navigate to
      </li>
    </ol>
  </div>
</div>

<div class="wp-block-media-text alignwide has-media-on-the-right is-stacked-on-mobile">
  <figure class="wp-block-media-text__media"></figure>
  
  <div class="wp-block-media-text__content">
    
#### Option 2: Create new group and policy blocking MFA
    
    
    <ol>
      <li>
        Navigate to
      </li>
    </ol>
  </div>
</div>
