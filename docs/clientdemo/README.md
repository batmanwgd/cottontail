<!--
 Copyright 2021 Kaska Miskolczi. All rights reserved.
 Use of this source code is governed by a BSD-style
 license that can be found in the LICENSE file.
-->

#### 1. Review Notes on Milanote to gain background and an overarching review
#### 2. Review Work/Process flow to understand how we arrived at our current conclusions

#### Show our application connected to the Keycloak instance as a client, not a provider:
```sh
curl -k -X POST https://sit-login.geoplatform.info/auth/realms/geoplatform/protocol/openid-connect/token \
-d grant_type=client_credentials \
-d client_id=vanguard-sso \
-d client_secret=e69284c4-4f0a-4784-ab95-10e0dbb8651e \
-d scope=openid | jq '.'
```

#### Show the created URL from the client side, and the associated misconfiguration error: 
```sh
curl -k -X POST https://idp.geoplatform.gov/simplesaml/module.php/core/login.php \ 
-d grant_type=password \
-d as=geosamloauth \
-d username=nyuszi \
-d password=DEMO 
```

#### _As a single-liner_
`curl -u nyuszi https://idp.geoplatform.gov/simplesaml/module.php/core/authenticate.php -d as=geosamloauth`

#### Resulting Code
```sh
https://idp.geoplatform.gov/simplesamlidp/module.php/core/loginuserpass.php
?AuthState=_e19a5fcac210955179bab59ca6f57fca3335a8b614
:https://idp.geoplatform.gov/simplesamlidp/module.php/core/as_login.php
?AuthId=geosamloauth
&ReturnTo=https://idp.geoplatform.gov/simplesamlidp/module.php/core/postredirect.php
?RedirId=_6d1dff8b0a3a7fca19888b59a337186d2010b396a2
```


#### Show how the cookie is formed:
```sh
curl -k -X POST https://idp.geoplatform.gov/simplesaml/module.php/core/authenticate.php \ 
-d grant_type=password \
-d as=geosamloauth \
-d username=nyuszi \
-d password=DEMO 
```

Obviously not being appended to the URL, then grant_type

```sh
curl -k -X POST https://idp.geoplatform.gov/simplesaml/module.php/core/authenticate.php \ 
-d as=geosamloauth \
-d username=nyuszi \
-d password=DEMO 
```

but this should actually work: 
This is the initial URL: 
https://idp.geoplatform.gov/simplesamlidp

But this is what's returned:
https://idp.geoplatform.gov/simplesamlidp/module.php/core/loginuserpass.php?AuthState=_dbe55dcbd4f0359247ce79e77e3b0eb6a5e6c32439%3Ahttps%3A%2F%2Fidp.geoplatform.gov%2Fsimplesamlidp%2Fmodule.php%2Fcore%2Fas_login.php%3FAuthId%3Dgeosamloauth%26ReturnTo%3Dhttps%253A%252F%252Fidp.geoplatform.gov%252Fsimplesamlidp%252Fmodule.php%252Fcore%252Fauthenticate.php%253Fas%253Dgeosamloauth

Visit a decoder online to make this more readable:
https://meyerweb.com/eric/tools/dencoder/
and then hit decode a few extra times

```sh
https://idp.geoplatform.gov/simplesamlidp/module.php/core/loginuserpass.php
?AuthState=_dbe55dcbd4f0359247ce79e77e3b0eb6a5e6c32439
:https://idp.geoplatform.gov/simplesamlidp/module.php/core/as_login.php
?AuthId=geosamloauth
&ReturnTo=https://idp.geoplatform.gov/simplesamlidp/module.php/core/authenticate.php
?as=geosamloauth
```

This output actually shows us what course this GeoPlatform.gov login takes from the beginning and it's "ReturnTo" is what should ideally be mapped over to the Keycloak instance under "Redirect_URI" (though we typically just use a URI)

Note: 
- the "?" is indicating a parameter being queried from the resource pinged
- the ":" is the requested entity name
- the "&" is used to delimit query parameters, meaning link multiples but let you know where the next one sits

#### Short documentation walk
- When we review the documentation here, regarding the methods to create "authsources" in SimpleSAML PHP:
https://simplesamlphp.org/docs/stable/simplesamlphp-authsource

We see that there are two effected classes that create this "authsource" (the foundational requirement for a Keycloak `id_token` and this isn't unique to Keycloak, this is for any OpenID or OAuth2.0 `id_token` requirement.

You can also see more about the authentication integration with the API built into SimpleSAML, as this authentication source must exist in `config/authsources.php`

and should be reflected as: `$auth = new \SimpleSAML\Auth\Simple('default-sp');`

So let's search our documentation created from the pear based `phpDocumenter phar` _(via `composer`)_
where we search `authsources`, before we review the `config/authsources.php` file

_This is where we come to find out that the user credentials is the actual grant_type being used to generate the authentication command/pass, and this is directly highlighted in the `config/authsources.php` code_

Then as we review the `config/authmemcookie.php` we can see the circular dependencies here, that unify the entire `authsources.php` dependency which is the missing or mysterious `grant_type` declaration required for the very URL redirection into Keycloak, which will always be a mystery as we don't know, nor do we want to know the user credentials.

Let's review the Keycloak information required on the client credentials side, and how we might see the differences between the clients and the identity providers _(the clients are supposed to be the service providers and the identity providers are what we just covered, whereby the assumption would have been that if everything is too convoluted to use the SimpleSAML PHP package as an identity provider, we could always fall back to using them as a client and merely giving the illusion of them as a provider, by utilizing two instances of Keycloak, serving as identity providers against each other, whereby one consumes the information from the SimpleSAML authorization source, and then passes that to the chief identity provision or identity broker at this point of the 1st Keycloak instance)_

Problems with this approach though, are just as troubling from the SimpleSAML PHP instance setup side/aspect.



This is the actual return state sent:
```sh
https://idp.geoplatform.gov/simplesamlidp/module.php/core/loginuserpass.php
?AuthState=_d6be85dad17de8c0964026af7f8238273ed3adec1c
:https://idp.geoplatform.gov/simplesamlidp/module.php/core/as_login.php
?AuthId=admin
&ReturnTo=https://idp.geoplatform.gov/simplesamlidp/module.php/core/frontpage_welcome.php
```

https://nyulacska.github.io/showcase-local/auth/_phpdoc/build/index.html 