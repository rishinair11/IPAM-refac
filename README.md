# IPAM - IP allocation manager

Technologies used:
    
- NodeJS
- Express
- Mongoose (for MongoDB)
- Netmask (for CIDR range calculation)
    

#  Use cases:
    
- User wants to view the Network ID of multiple On-Prem/Cloud based networks that he/she wants to deploy applications/templates on. So, user will request quantity of worker/master nodes for the same and IPAM will respond with the list of IPs allocated to the user.
- User wants to add his/her own infrastructure with pre-assigned static IPs for use with IPAM. IPAM will allocate IPs from the newly added network also. (to release as a redistributable application for standalone clients)
    
//More being added
    

#  Currently working 
- Allocate IPs from existing networks. User can select desired network from the UI and send a request for IPs.
- User can add his/her own infrastructure and static IPs as new networks. 
- 
//More being added
