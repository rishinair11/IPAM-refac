# IPAM - IP allocation manager

## Technologies used:
    
- NodeJS
- Express
- Mongoose (for MongoDB)
- Netmask (for CIDR range calculation)
    

##  Use cases:
    
- User wants to view the Network ID of multiple On-Prem/Cloud based networks that he/she wants to deploy applications/templates on. So, user will request quantity IPs and the network ID of the network from which IPs are required, after which IPAM will respond with the list of IPs allocated to the user.
- User wants to add his/her own infrastructure with pre-assigned static IPs for use with IPAM. IPAM will allocate IPs from the newly added network also. (to release as a redistributable application for standalone clients)
- User can de-allocate his IPs whenever required, IPAM will update accordingly (As of now, all IPs are deleted).


##  Currently funcitional 
- Allocate IPs from existing networks. User can select desired network from the UI and send a request for IPs.
- User can add his/her own infrastructure and static IPs as new networks. 
- User can delete his IPs whenever required. (As of now, all IPs are deleted).

