\# Dudley Golf Club – Old Domain Redirect Plan



\## Purpose



This document records the proposed migration from the old IntelligentGolf-hosted public website:



https://www.dudleygolfclub.com/



to the new public website:



https://dudleygolfclub.co.uk/



The aim is to preserve SEO value by using permanent 301 redirects for old public website pages, while keeping IntelligentGolf member and booking services working normally.



Do not make DNS or redirect changes until IntelligentGolf confirms the preferred migration sequence.



\---



\## Proposed 301 Redirects



\### Homepage



https://www.dudleygolfclub.com/

→

https://dudleygolfclub.co.uk/



\---



\### Visitors



https://www.dudleygolfclub.com/visitors

→

https://dudleygolfclub.co.uk/visitors



https://www.dudleygolfclub.com/visitor\_welcome

→

https://dudleygolfclub.co.uk/visitors



https://www.dudleygolfclub.com/visitor\_information

→

https://dudleygolfclub.co.uk/visitors



https://www.dudleygolfclub.com/visitor\_rates

→

https://dudleygolfclub.co.uk/visitors



https://www.dudleygolfclub.com/dress\_code

→

https://dudleygolfclub.co.uk/visitors



\---



\### Membership



https://www.dudleygolfclub.com/membership

→

https://dudleygolfclub.co.uk/membership



https://www.dudleygolfclub.com/membership\_welcome

→

https://dudleygolfclub.co.uk/membership



https://www.dudleygolfclub.com/categories\_and\_rates

→

https://dudleygolfclub.co.uk/membership



\---



\### Course



https://www.dudleygolfclub.com/course

→

https://dudleygolfclub.co.uk/course



https://www.dudleygolfclub.com/course\_overview

→

https://dudleygolfclub.co.uk/course



https://www.dudleygolfclub.com/the\_course\_overview

→

https://dudleygolfclub.co.uk/course



https://www.dudleygolfclub.com/scorecard

→

https://dudleygolfclub.co.uk/course



https://www.dudleygolfclub.com/course\_rating

→

https://dudleygolfclub.co.uk/course



https://www.dudleygolfclub.com/hole\_1

through

https://www.dudleygolfclub.com/hole\_18

→

https://dudleygolfclub.co.uk/course



\---



\### Clubhouse / Hospitality



https://www.dudleygolfclub.com/clubhouse

→

https://dudleygolfclub.co.uk/hospitality



https://www.dudleygolfclub.com/our\_clubhouse

→

https://dudleygolfclub.co.uk/hospitality



https://www.dudleygolfclub.com/breakfast\_menu

→

https://dudleygolfclub.co.uk/hospitality



\---



\### Tee Booking



https://www.dudleygolfclub.com/book\_a\_tee\_time

→

https://dudleygolfclub.co.uk/visitor-booking



https://www.dudleygolfclub.com/online\_booking

→

https://dudleygolfclub.co.uk/visitor-booking



\---



\### Societies



https://www.dudleygolfclub.com/groups\_and\_societies

→

https://dudleygolfclub.co.uk/societies



\---



\### 1893 Club



https://www.dudleygolfclub.com/1893\_club

→

https://dudleygolfclub.co.uk/1893-club



\---



\### History



https://www.dudleygolfclub.com/our\_history

→

https://dudleygolfclub.co.uk/history



\---



\### Functions



https://www.dudleygolfclub.com/function\_room\_hire

→

https://dudleygolfclub.co.uk/functions



\---



\### Contact



https://www.dudleygolfclub.com/contact

→

https://dudleygolfclub.co.uk/enquire



\---



\### Events



https://www.dudleygolfclub.com/events

→

https://dudleygolfclub.co.uk/social-events



\---



\### Open Competitions



https://www.dudleygolfclub.com/open\_competitions

→

https://dudleygolfclub.co.uk/upcoming-comps



\---



\### Member Login Landing Page



https://www.dudleygolfclub.com/member\_login

→

https://dudleygolfclub.co.uk/members-login



\---



\## Pages To Retire Rather Than Redirect



These appear to be old system, test or component pages and should preferably return 404 or 410 rather than redirecting to the homepage:



https://www.dudleygolfclub.com/test\_page



https://www.dudleygolfclub.com/test\_hole\_1



https://www.dudleygolfclub.com/address\_footer



https://www.dudleygolfclub.com/bottom\_tabs



Old duplicate or obsolete policy pages should also be reviewed before deciding whether to redirect or retire them:



https://www.dudleygolfclub.com/club\_policies



https://www.dudleygolfclub.com/club\_policies\_1



\---



\## DO NOT REDIRECT – IntelligentGolf Services



The following IntelligentGolf operational services must remain available unless IntelligentGolf confirms they are moving to a new subdomain or URL.



https://www.dudleygolfclub.com/login.php



https://www.dudleygolfclub.com/visitorbooking/



https://www.dudleygolfclub.com/memberbooking/



https://www.dudleygolfclub.com/psi



https://www.dudleygolfclub.com/live



https://www.dudleygolfclub.com/extlink.php



Any other IntelligentGolf member, app, booking or EPOS endpoints must also remain operational.



\---



\## DNS / IntelligentGolf Notes



Current www DNS:



www.dudleygolfclub.com

CNAME

application.intelligentgolf.co.uk



IntelligentGolf currently serves the public website and member functions.



Lee Cowell at IntelligentGolf previously confirmed:



\- IntelligentGolf hosts the current public website.

\- IntelligentGolf does not host the domain name.

\- IntelligentGolf does not host the DNS.

\- IntelligentGolf does not host club email.

\- Member functions can be moved to a subdomain.

\- DNS for that subdomain should be configured first.

\- IntelligentGolf can then configure SSL and change its baseurl.

\- Member functions and the app can continue normally.

\- EPOS is unaffected.

\- No downtime should be necessary if the DNS is prepared first.



\---



\## Current Migration Findings – 12 September 2026



Old www homepage:

https://www.dudleygolfclub.com/

returns HTTP 200 OK.



Old homepage currently has no detected canonical URL pointing to the new .co.uk site.



Old robots.txt still advertises:

https://www.dudleygolfclub.com/sitemap.xml



The old sitemap still contains the legacy public website pages.



The bare HTTP domain:

http://dudleygolfclub.com/

returns 301 to:

http://www.dudleygolfclub.com/



The bare HTTPS domain:

https://dudleygolfclub.com/

currently fails certificate validation due to a hostname mismatch.



The new website is live at:

https://dudleygolfclub.co.uk/



New sitemap:

https://dudleygolfclub.co.uk/sitemap.xml



The new sitemap currently contains 36 public pages.



\---



\## Status



Awaiting response from Lee Cowell / IntelligentGolf before making DNS or old-domain redirect changes.



Do not alter old-domain DNS until IntelligentGolf confirms the safe migration sequence.

