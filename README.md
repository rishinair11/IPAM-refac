# IPAM - IP allocation manager

# Usage:
The image for this IPAM API tool can be found at:-
https://hub.docker.com/r/nehapit/ipam/

# Start the ipam api container
`docker run --name {CONTAINER_NAME} -p {PORT_NO}:8000 -d nehapit/ipam`


## Technologies used:
    
- NodeJS
- Express
- Mongoose (for MongoDB)
    

##  Use cases:
    
- User wants to view the Network ID of multiple On-Prem/Cloud based networks that he/she wants to deploy applications/templates on. So, user will request quantity IPs and the network ID of the network from which IPs are required, after which IPAM will respond with the list of IPs allocated to the user.
- User wants to add his/her own infrastructure with pre-assigned static IPs for use with IPAM. IPAM will allocate IPs from the newly added network also. (to release as a redistributable application for standalone clients)
- User can de-allocate his IPs whenever required, IPAM will update accordingly (As of now, all IPs are deleted).


##  Currently functional 
- Allocate IPs from existing networks. User can select desired network from the UI and send a request for IPs.
- User can add his/her own infrastructure and static IPs as new networks. 
- User can delete his IPs whenever required. (As of now, all IPs are deleted).
- User can assign/deassign IPs whenever needed. 


# IPAM-Demo (Front-end)

## Technologies/Frameworks used

- React & React-scripts(for prod-build)
- Chokidar (for scss -> css conversion)
- React-MD for Material design components

## Setup

For setting up React-MD with create-react-app , go to link:
- https://github.com/mlaursen/react-md/tree/master/examples/with-create-react-app
